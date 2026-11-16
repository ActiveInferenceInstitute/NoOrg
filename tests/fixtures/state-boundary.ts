/// <reference lib="es2024.promise" />
import type { FileHandle } from 'node:fs/promises';
import { dirname } from 'node:path';
import { nodeStateStoreIO, type FileStateStoreIO } from '../../src/state/state-store';

export type StateFault =
  'write' | 'sync' | 'rename-before' | 'rename-after' | 'directory-sync' | 'guard-open';
export interface CommitBarrier {
  readonly entered: Promise<void>;
  release(): void;
}

/** Faults/barriers surround real native file effects; successful effects are never simulated. */
export class StateBoundary {
  public readonly io: FileStateStoreIO;
  private fault: StateFault | undefined;
  private renamed = false;
  private barrier: { enter(): void; readonly released: Promise<void> } | undefined;

  public constructor(
    private readonly filePath: string,
    public readonly error = new Error('controlled state I/O failure')
  ) {
    this.io = {
      ...nodeStateStoreIO,
      open: async (path, flags, mode) => {
        if (String(path) === `${this.filePath}.lock.guard` && this.fault === 'guard-open') {
          this.fault = undefined;
          throw this.error;
        }
        const handle = await nodeStateStoreIO.open(path, flags, mode);
        const temporary =
          String(path).startsWith(`${this.filePath}.`) && String(path).endsWith('.tmp');
        const parent = String(path) === dirname(this.filePath);
        return new Proxy(handle, {
          get: (target, property) => {
            if (property === 'writeFile')
              return async (...args: Parameters<FileHandle['writeFile']>) => {
                if (temporary) {
                  const barrier = this.barrier;
                  this.barrier = undefined;
                  if (barrier !== undefined) {
                    barrier.enter();
                    await barrier.released;
                  }
                  if (this.fault === 'write') {
                    this.fault = undefined;
                    throw this.error;
                  }
                }
                return target.writeFile(...args);
              };
            if (property === 'sync')
              return async () => {
                if (
                  (temporary && this.fault === 'sync') ||
                  (parent && this.renamed && this.fault === 'directory-sync')
                ) {
                  this.fault = undefined;
                  throw this.error;
                }
                await target.sync();
              };
            const value: unknown = Reflect.get(target, property, target);
            return typeof value === 'function' ? value.bind(target) : value;
          },
        });
      },
      rename: async (from, to) => {
        if (this.fault === 'rename-before') {
          this.fault = undefined;
          throw this.error;
        }
        await nodeStateStoreIO.rename(from, to);
        this.renamed = true;
        if (this.fault === 'rename-after') {
          this.fault = undefined;
          throw this.error;
        }
      },
    };
  }

  public failNext(fault: StateFault): void {
    this.fault = fault;
    this.renamed = false;
  }

  public pauseNextWrite(): CommitBarrier {
    if (this.barrier !== undefined) throw new Error('A state write barrier is already armed');
    const { promise: entered, resolve: enter } = Promise.withResolvers<void>();
    const { promise: released, resolve: release } = Promise.withResolvers<void>();
    this.barrier = { enter, released };
    return { entered, release };
  }
}
