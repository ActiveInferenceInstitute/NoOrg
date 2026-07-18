import { mkdir, open, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { JsonValue } from '../domain/types';
import { jsonValueSchema } from '../domain/types';
import { NoOrgError } from '../domain/errors';

export interface StateStore {
  load(): Promise<void>;
  isOpen(): boolean;
  get<T extends JsonValue>(key: string): T | undefined;
  snapshot(): Readonly<Record<string, JsonValue>>;
  revision(): number;
  set(key: string, value: JsonValue): Promise<void>;
  update<T extends JsonValue>(key: string, updater: (current: T | undefined) => T): Promise<T>;
  flush(): Promise<void>;
  close(): Promise<void>;
}

const envelopeSchema = z.object({
  schemaVersion: z.literal(2),
  revision: z.number().int().nonnegative(),
  state: z.record(jsonValueSchema),
});

const previousEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  state: z.record(jsonValueSchema),
});

function clone<T>(value: T): T {
  return structuredClone(value);
}

function isMissingFile(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

function isLiveProcess(pid: number): boolean {
  if (pid === process.pid) return true;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'EPERM';
  }
}

interface LockOwner {
  readonly pid: number;
  readonly createdAt: number;
  readonly token: string;
}

const staleLockMs = 30_000;

export class FileStateStore implements StateStore {
  private readonly values = new Map<string, JsonValue>();
  private mutation = Promise.resolve();
  private closed = false;
  private locked = false;
  private currentRevision = 0;

  public isOpen(): boolean {
    return !this.closed;
  }

  public constructor(private readonly filePath: string) {}

  public async load(): Promise<void> {
    if (this.closed) throw new NoOrgError('STATE_STORE_CLOSED', 'State store is closed');
    await this.acquireLock();
    try {
      const content = await readFile(this.filePath, 'utf8');
      const raw: unknown = JSON.parse(content);
      const current = envelopeSchema.safeParse(raw);
      const previous = previousEnvelopeSchema.safeParse(raw);
      if (!current.success && !previous.success) {
        throw new NoOrgError(
          'STATE_SCHEMA_INVALID',
          `State file ${this.filePath} has an invalid schema`
        );
      }
      const parsed = current.success
        ? current.data
        : previous.success
          ? { schemaVersion: 2 as const, revision: 0, state: previous.data.state }
          : undefined;
      if (!parsed)
        throw new NoOrgError(
          'STATE_SCHEMA_INVALID',
          `State file ${this.filePath} has an invalid schema`
        );
      this.values.clear();
      for (const [key, value] of Object.entries(parsed.state)) this.values.set(key, clone(value));
      this.currentRevision = parsed.revision;
    } catch (error) {
      if (isMissingFile(error)) return;
      await this.releaseLock();
      if (error instanceof NoOrgError) throw error;
      throw new NoOrgError(
        'STATE_LOAD_FAILED',
        `Unable to load state from ${this.filePath}`,
        false
      );
    }
  }

  public get<T extends JsonValue>(key: string): T | undefined {
    const value = this.values.get(key);
    return value === undefined ? undefined : (clone(value) as T);
  }

  public snapshot(): Readonly<Record<string, JsonValue>> {
    return clone(Object.fromEntries(this.values));
  }

  public revision(): number {
    return this.currentRevision;
  }

  public async set(key: string, value: JsonValue): Promise<void> {
    jsonValueSchema.parse(value);
    await this.enqueue(() => {
      this.values.set(key, clone(value));
      this.currentRevision += 1;
    });
  }

  public async update<T extends JsonValue>(
    key: string,
    updater: (current: T | undefined) => T
  ): Promise<T> {
    let nextValue!: T;
    await this.enqueue(() => {
      const current = this.values.get(key) as T | undefined;
      nextValue = updater(current === undefined ? undefined : clone(current));
      jsonValueSchema.parse(nextValue);
      this.values.set(key, clone(nextValue));
      this.currentRevision += 1;
    });
    return clone(nextValue);
  }

  public async flush(): Promise<void> {
    await this.mutation;
    if (this.closed || !this.locked) return;
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    const body = JSON.stringify(
      { schemaVersion: 2, revision: this.currentRevision, state: this.snapshot() },
      null,
      2
    );
    try {
      await writeFile(temporaryPath, body, { encoding: 'utf8', mode: 0o600 });
      const handle = await open(temporaryPath, 'r+');
      try {
        await handle.sync();
      } finally {
        await handle.close();
      }
      await rename(temporaryPath, this.filePath);
    } catch (error) {
      await rm(temporaryPath, { force: true }).catch(() => undefined);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.closed) return;
    let failure: unknown;
    try {
      await this.flush();
    } catch (error) {
      failure = error;
    } finally {
      this.closed = true;
      await this.releaseLock();
    }
    if (failure !== undefined) throw failure;
  }

  private async enqueue(operation: () => void): Promise<void> {
    if (this.closed) throw new NoOrgError('STATE_STORE_CLOSED', 'State store is closed');
    const next = this.mutation.then(operation);
    this.mutation = next.catch(() => undefined);
    await next;
  }

  private async acquireLock(): Promise<void> {
    if (this.locked) return;
    const lockPath = `${this.filePath}.lock`;
    await mkdir(dirname(lockPath), { recursive: true });
    try {
      await mkdir(lockPath);
    } catch (error) {
      if (
        !isMissingFile(error) &&
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'EEXIST'
      ) {
        let owner: LockOwner | undefined;
        try {
          const raw = await readFile(`${lockPath}/owner`, 'utf8');
          try {
            const parsed: unknown = JSON.parse(raw);
            if (
              typeof parsed === 'object' &&
              parsed !== null &&
              typeof (parsed as { pid?: unknown }).pid === 'number' &&
              typeof (parsed as { createdAt?: unknown }).createdAt === 'number' &&
              typeof (parsed as { token?: unknown }).token === 'string'
            ) {
              owner = parsed as LockOwner;
            }
          } catch {
            const pid = Number.parseInt(raw, 10);
            if (Number.isInteger(pid)) owner = { pid, createdAt: 0, token: 'prior' };
          }
        } catch {
          owner = undefined;
        }
        let lockAge = Number.POSITIVE_INFINITY;
        try {
          lockAge = Date.now() - (await stat(lockPath)).mtimeMs;
        } catch {
          lockAge = Number.POSITIVE_INFINITY;
        }
        if (
          (owner !== undefined && isLiveProcess(owner.pid)) ||
          (owner === undefined && lockAge < staleLockMs) ||
          (owner !== undefined && owner.createdAt > 0 && Date.now() - owner.createdAt < staleLockMs)
        ) {
          throw new NoOrgError('STATE_LOCKED', `State file ${this.filePath} is already in use`);
        }
        await rm(lockPath, { recursive: true, force: true });
        await mkdir(lockPath);
      } else {
        throw error;
      }
    }
    const owner: LockOwner = { pid: process.pid, createdAt: Date.now(), token: randomUUID() };
    try {
      await writeFile(`${lockPath}/owner`, JSON.stringify(owner), {
        encoding: 'utf8',
        mode: 0o600,
      });
    } catch (error) {
      await rm(lockPath, { recursive: true, force: true }).catch(() => undefined);
      throw error;
    }
    this.locked = true;
  }

  private async releaseLock(): Promise<void> {
    if (!this.locked) return;
    await rm(`${this.filePath}.lock`, { recursive: true, force: true });
    this.locked = false;
  }
}

export class MemoryStateStore implements StateStore {
  private readonly values = new Map<string, JsonValue>();
  private closed = false;
  private currentRevision = 0;

  public isOpen(): boolean {
    return !this.closed;
  }

  public async load(): Promise<void> {
    if (this.closed) throw new NoOrgError('STATE_STORE_CLOSED', 'State store is closed');
  }

  public get<T extends JsonValue>(key: string): T | undefined {
    const value = this.values.get(key);
    return value === undefined ? undefined : (clone(value) as T);
  }

  public snapshot(): Readonly<Record<string, JsonValue>> {
    return clone(Object.fromEntries(this.values));
  }

  public revision(): number {
    return this.currentRevision;
  }

  public async set(key: string, value: JsonValue): Promise<void> {
    if (this.closed) throw new NoOrgError('STATE_STORE_CLOSED', 'State store is closed');
    jsonValueSchema.parse(value);
    this.values.set(key, clone(value));
    this.currentRevision += 1;
  }

  public async update<T extends JsonValue>(
    key: string,
    updater: (current: T | undefined) => T
  ): Promise<T> {
    const next = updater(this.get<T>(key));
    await this.set(key, next);
    return clone(next);
  }

  public async flush(): Promise<void> {}

  public async close(): Promise<void> {
    this.closed = true;
  }
}
