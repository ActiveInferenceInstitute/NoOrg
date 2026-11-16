import { lstat, mkdir, open, readFile, rename, rm, rmdir } from 'node:fs/promises';
import { constants, type Stats } from 'node:fs';
import type { FileHandle } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
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
  state: z.record(z.string(), jsonValueSchema),
});

const previousEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  state: z.record(z.string(), jsonValueSchema),
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
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'EPERM') return true;
      if (error.code === 'ESRCH') return false;
    }
    throw error;
  }
}

interface LockOwner {
  readonly pid: number;
  readonly createdAt: number;
  readonly token: string;
}

const staleLockMs = 30_000;

export interface FileStateStoreIO {
  readonly lstat: typeof lstat;
  readonly mkdir: typeof mkdir;
  readonly open: typeof open;
  readonly readFile: typeof readFile;
  readonly rename: typeof rename;
  readonly rm: typeof rm;
  readonly rmdir: typeof rmdir;
}

export const nodeStateStoreIO: FileStateStoreIO = {
  lstat,
  mkdir,
  open,
  readFile,
  rename,
  rm,
  rmdir,
};

interface DirectoryLease {
  readonly path: string;
  readonly handle: FileHandle;
  readonly dev: number;
  readonly ino: number;
}

interface StoreLease extends DirectoryLease {
  readonly owner: LockOwner;
}

interface ObservedLock {
  readonly identity: Stats;
  readonly owner: LockOwner | undefined;
}

function sameIdentity(left: { dev: number; ino: number }, right: { dev: number; ino: number }): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}

function parseOwner(raw: string): LockOwner | undefined {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' && parsed !== null &&
      'pid' in parsed && Number.isSafeInteger(parsed.pid) && Number(parsed.pid) > 0 &&
      'createdAt' in parsed && typeof parsed.createdAt === 'number' &&
      Number.isFinite(parsed.createdAt) && parsed.createdAt >= 0 &&
      'token' in parsed && typeof parsed.token === 'string' && parsed.token.length > 0
    ) return parsed as LockOwner;
  } catch {
    // Only the exact historical decimal-PID representation is admitted below.
  }
  const legacy = raw.trim();
  if (/^[1-9][0-9]*$/.test(legacy) && Number.isSafeInteger(Number(legacy))) {
    return { pid: Number(legacy), createdAt: 0, token: 'legacy-pid' };
  }
  return undefined;
}

export class FileStateStore implements StateStore {
  private values = new Map<string, JsonValue>();
  private mutation: Promise<void> = Promise.resolve();
  private closed = false;
  private closing = false;
  private loaded = false;
  private dirty = false;
  private failure: NoOrgError | undefined;
  private retainGuard = false;
  private lease: StoreLease | undefined;
  private closePromise: Promise<void> | undefined;
  private currentRevision = 0;
  private readonly filePath: string;

  public constructor(filePath: string, private readonly io: FileStateStoreIO = nodeStateStoreIO) {
    this.filePath = resolve(filePath);
  }

  public isOpen(): boolean {
    return this.loaded && !this.closed && !this.closing && this.failure === undefined;
  }

  public async load(): Promise<void> {
    this.assertAvailable(false);
    if (this.closing) throw new NoOrgError('STATE_STORE_CLOSED', 'State store is closing');
    await this.schedule(async () => {
      this.assertAvailable(false);
      if (this.loaded) return;
      await this.io.mkdir(dirname(this.filePath), { recursive: true });
      // Optimistic inspection may reject a live/ambiguous owner without changing
      // its namespace. Any stale observation is re-read under the guard.
      const observed = await this.observeLock();
      if (observed !== undefined) this.assertReclaimable(observed);
      await this.withGuard(async guard => {
        const current = await this.observeLock();
        if (current !== undefined) {
          this.assertReclaimable(current);
          await this.assertDirectory(guard);
          await this.io.rm(`${this.filePath}.lock`, { recursive: true });
        }
        const lockPath = `${this.filePath}.lock`;
        await this.io.mkdir(lockPath, { mode: 0o700 });
        const directory = await this.openDirectory(lockPath);
        const owner: LockOwner = { pid: process.pid, createdAt: Date.now(), token: randomUUID() };
        this.lease = { ...directory, owner };
        try {
          const marker = await this.io.open(`${lockPath}/owner`, 'wx', 0o600);
          try {
            await marker.writeFile(JSON.stringify(owner), 'utf8');
            await marker.sync();
          } finally {
            await marker.close();
          }
          await directory.handle.sync();
          let parsed: z.infer<typeof envelopeSchema>;
          try {
            const raw: unknown = JSON.parse(await this.io.readFile(this.filePath, 'utf8'));
            const currentEnvelope = envelopeSchema.safeParse(raw);
            const previous = previousEnvelopeSchema.safeParse(raw);
            if (currentEnvelope.success) {
              parsed = currentEnvelope.data;
              this.dirty = false;
            } else if (previous.success) {
              parsed = { schemaVersion: 2, revision: 0, state: previous.data.state };
              this.dirty = true;
            } else {
              throw new NoOrgError('STATE_SCHEMA_INVALID', 'State file has an invalid schema');
            }
          } catch (error) {
            if (!isMissingFile(error)) throw error;
            parsed = { schemaVersion: 2, revision: 0, state: {} };
            this.dirty = true;
          }
          await this.assertOwnership(guard);
          this.values = new Map(Object.entries(parsed.state).map(([key, value]) => [key, clone(value)]));
          this.currentRevision = parsed.revision;
          this.loaded = true;
        } catch (error) {
          try {
            await this.releaseLock(guard);
          } catch (cleanupError) {
            this.fence('STATE_LOCK_LOST', 'State lock ownership became ambiguous', cleanupError);
            throw new AggregateError([error, cleanupError], 'State acquisition and owned cleanup failed');
          }
          if (error instanceof NoOrgError) throw error;
          const failure = new NoOrgError('STATE_LOAD_FAILED', `Unable to load state from ${this.filePath}`);
          failure.cause = error;
          throw failure;
        }
      });
    });
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
    this.assertAdmission();
    const admitted = clone(jsonValueSchema.parse(value));
    await this.schedule(async () => {
      this.assertAvailable();
      const candidate = new Map(this.values);
      candidate.set(key, admitted);
      const revision = this.currentRevision + 1;
      await this.withGuard(guard => this.writeCandidate(candidate, revision, guard));
      this.values = candidate;
      this.currentRevision = revision;
      this.dirty = false;
    });
  }

  public async update<T extends JsonValue>(
    key: string,
    updater: (current: T | undefined) => T
  ): Promise<T> {
    this.assertAdmission();
    return this.schedule(async () => {
      this.assertAvailable();
      const current = this.values.get(key);
      const next = clone(jsonValueSchema.parse(updater(current === undefined ? undefined : clone(current) as T))) as T;
      const candidate = new Map(this.values);
      candidate.set(key, next);
      const revision = this.currentRevision + 1;
      await this.withGuard(guard => this.writeCandidate(candidate, revision, guard));
      this.values = candidate;
      this.currentRevision = revision;
      this.dirty = false;
      return clone(next);
    });
  }

  public async flush(): Promise<void> {
    this.assertAdmission();
    await this.schedule(() => this.flushCommitted());
  }

  public async close(): Promise<void> {
    if (this.closePromise !== undefined) return this.closePromise;
    if (this.closed) return;
    this.closing = true;
    this.closePromise = this.schedule(async () => {
      let failure: unknown;
      try {
        if (this.failure !== undefined) throw this.failure;
        if (this.lease !== undefined) {
          await this.flushCommitted();
          await this.withGuard(guard => this.releaseLock(guard));
        }
      } catch (error) {
        failure = error;
      }
      this.closed = true;
      if (this.lease !== undefined) {
        try {
          await this.lease.handle.close();
        } catch (error) {
          failure = failure === undefined ? error : new AggregateError([failure, error], 'State close and handle cleanup failed');
        }
      }
      if (failure !== undefined) throw failure;
    });
    return this.closePromise;
  }

  private assertAvailable(requireLoaded = true): void {
    if (this.failure !== undefined) throw this.failure;
    if (this.closed) throw new NoOrgError('STATE_STORE_CLOSED', 'State store is closed');
    if (requireLoaded && !this.loaded) throw new NoOrgError('STATE_NOT_LOADED', 'State store must be loaded before mutation');
  }

  private assertAdmission(): void {
    this.assertAvailable();
    if (this.closing) throw new NoOrgError('STATE_STORE_CLOSED', 'State store is closing');
  }

  private schedule<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.mutation.then(operation);
    this.mutation = next.then(() => undefined, () => undefined);
    return next;
  }

  private async flushCommitted(): Promise<void> {
    this.assertAvailable();
    await this.withGuard(async guard => {
      await this.assertOwnership(guard);
      if (this.dirty) await this.writeCandidate(this.values, this.currentRevision, guard);
    });
    this.dirty = false;
  }

  private async writeCandidate(values: ReadonlyMap<string, JsonValue>, revision: number, guard: DirectoryLease): Promise<void> {
    await this.assertOwnership(guard);
    const temporaryPath = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    const body = JSON.stringify({ schemaVersion: 2, revision, state: Object.fromEntries(values) }, null, 2);
    const handle = await this.io.open(temporaryPath, 'wx', 0o600);
    let identity: Stats | undefined;
    let failure: unknown;
    try {
      identity = await handle.stat();
      await handle.writeFile(body, 'utf8');
      await handle.sync();
    } catch (error) {
      failure = error;
    }
    try {
      await handle.close();
    } catch (error) {
      failure = failure === undefined ? error : new AggregateError([failure, error], 'State write and close failed');
    }
    if (failure === undefined) {
      try {
        await this.assertOwnership(guard);
      } catch (error) {
        failure = error;
      }
    }
    if (failure === undefined) {
      // A failed rename may already have replaced the destination. Never
      // publish or automatically unlock an outcome that cannot be confirmed.
      try {
        await this.io.rename(temporaryPath, this.filePath);
        await this.syncParent();
        return;
      } catch (error) {
        this.retainGuard = true;
        throw this.fence('STATE_COMMIT_UNCERTAIN', 'State replacement durability is uncertain; store is fenced', error);
      }
    }
    try {
      await this.assertDirectory(guard);
      const current = await this.io.lstat(temporaryPath);
      if (identity !== undefined && sameIdentity(current, identity)) await this.io.rm(temporaryPath);
    } catch (cleanupError) {
      if (!isMissingFile(cleanupError)) {
        throw new AggregateError([failure, cleanupError], 'State write and owned temporary cleanup failed');
      }
    }
    throw failure;
  }

  private fence(code: string, message: string, cause: unknown): NoOrgError {
    const failure = new NoOrgError(code, message);
    failure.cause = cause;
    this.failure = failure;
    return failure;
  }

  private async openDirectory(path: string): Promise<DirectoryLease> {
    const handle = await this.io.open(path, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
    try {
      const identity = await handle.stat();
      return { path, handle, dev: identity.dev, ino: identity.ino };
    } catch (error) {
      await handle.close();
      throw error;
    }
  }

  private async syncParent(): Promise<void> {
    const parent = await this.openDirectory(dirname(this.filePath));
    try {
      await parent.handle.sync();
    } finally {
      await parent.handle.close();
    }
  }

  private async assertDirectory(lease: DirectoryLease): Promise<void> {
    let current: Stats;
    try {
      current = await this.io.lstat(lease.path);
    } catch (error) {
      throw this.fence('STATE_LOCK_LOST', 'State ownership directory is missing', error);
    }
    if (!current.isDirectory() || !sameIdentity(current, lease)) {
      throw this.fence('STATE_LOCK_LOST', 'State ownership directory was replaced', undefined);
    }
  }

  private async withGuard<T>(operation: (guard: DirectoryLease) => Promise<T>): Promise<T> {
    const path = `${this.filePath}.lock.guard`;
    try {
      await this.io.mkdir(path, { mode: 0o700 });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'EEXIST') {
        throw new NoOrgError('STATE_LOCKED', `State file ${this.filePath} is already in use or requires guard recovery`);
      }
      throw error;
    }
    let guard: DirectoryLease;
    try {
      guard = await this.openDirectory(path);
    } catch (error) {
      throw this.fence('STATE_LOCK_LOST', 'State namespace guard acquisition is incomplete', error);
    }
    let result!: T;
    let failure: unknown;
    try {
      await guard.handle.sync();
      await this.syncParent();
      result = await operation(guard);
    } catch (error) {
      failure = error;
    }
    let owned = true;
    try {
      await this.assertDirectory(guard);
    } catch (error) {
      owned = false;
      failure = failure === undefined ? error : new AggregateError([failure, error], 'State operation and namespace identity check failed');
    }
    try {
      await guard.handle.close();
    } catch (error) {
      owned = false;
      this.retainGuard = true;
      const cleanup = this.fence('STATE_LOCK_LOST', 'State namespace guard handle could not be closed', error);
      failure = failure === undefined ? cleanup : new AggregateError([failure, cleanup], 'State operation and handle cleanup failed');
    }
    if (owned && !this.retainGuard) {
      try {
        await this.io.rmdir(path);
      } catch (error) {
        const cleanup = this.fence('STATE_LOCK_LOST', 'State namespace guard could not be released safely', error);
        failure = failure === undefined ? cleanup : new AggregateError([failure, cleanup], 'State operation and namespace release failed');
      }
    }
    if (failure !== undefined) throw failure;
    return result;
  }

  private async observeLock(): Promise<ObservedLock | undefined> {
    const path = `${this.filePath}.lock`;
    let identity: Stats;
    try {
      identity = await this.io.lstat(path);
    } catch (error) {
      if (isMissingFile(error)) return undefined;
      throw error;
    }
    if (!identity.isDirectory()) throw new NoOrgError('STATE_LOCKED', 'State lock path is not an owned directory');
    let owner: LockOwner | undefined;
    try {
      owner = parseOwner(await this.io.readFile(`${path}/owner`, 'utf8'));
    } catch (error) {
      if (!isMissingFile(error)) throw error;
    }
    return { identity, owner };
  }

  private assertReclaimable(lock: ObservedLock): void {
    const owner = lock.owner;
    if (owner === undefined) throw new NoOrgError('STATE_LOCKED', 'State lock owner is incomplete or ambiguous');
    const age = Date.now() - (owner.createdAt === 0 ? lock.identity.mtimeMs : owner.createdAt);
    if (age < staleLockMs || isLiveProcess(owner.pid)) {
      throw new NoOrgError('STATE_LOCKED', `State file ${this.filePath} is already in use`);
    }
  }

  private async assertOwnership(guard: DirectoryLease): Promise<void> {
    await this.assertDirectory(guard);
    const lease = this.lease;
    if (lease === undefined) throw this.fence('STATE_LOCK_LOST', 'State store has no acquired lock', undefined);
    const current = await this.observeLock();
    if (current === undefined || !sameIdentity(current.identity, lease) ||
      current.owner?.token !== lease.owner.token || current.owner.pid !== lease.owner.pid) {
      throw this.fence('STATE_LOCK_LOST', 'State lock no longer belongs to this store', undefined);
    }
  }

  private async releaseLock(guard: DirectoryLease): Promise<void> {
    await this.assertOwnership(guard);
    const lease = this.lease!;
    await lease.handle.close();
    await this.io.rm(lease.path, { recursive: true });
    this.lease = undefined;
    this.loaded = false;
  }
}

export class MemoryStateStore implements StateStore {
  private readonly values = new Map<string, JsonValue>();
  private mutation = Promise.resolve();
  private closed = false;
  private closing = false;
  private closePromise: Promise<void> | undefined;
  private currentRevision = 0;

  public isOpen(): boolean {
    return !this.closed && !this.closing;
  }

  public async load(): Promise<void> {
    if (this.closed || this.closing) throw new NoOrgError('STATE_STORE_CLOSED', 'State store is closed');
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
    if (this.closed || this.closing) throw new NoOrgError('STATE_STORE_CLOSED', 'State store is closed');
    const admitted = clone(jsonValueSchema.parse(value));
    await this.enqueue(() => {
      this.values.set(key, admitted);
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
  }

  public async close(): Promise<void> {
    if (this.closePromise !== undefined) return this.closePromise;
    this.closing = true;
    this.closePromise = this.mutation.then(() => { this.closed = true; });
    this.mutation = this.closePromise;
    return this.closePromise;
  }

  private async enqueue(operation: () => void): Promise<void> {
    if (this.closed || this.closing) throw new NoOrgError('STATE_STORE_CLOSED', 'State store is closed');
    const next = this.mutation.then(operation);
    this.mutation = next.catch(() => undefined);
    await next;
  }
}
