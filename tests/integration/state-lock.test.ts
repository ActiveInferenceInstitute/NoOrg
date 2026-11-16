import { fork, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import { runtimeStateSchema } from '../../src/domain/types';
import { FileStateStore } from '../../src/state/state-store';
import { StateBoundary } from '../fixtures/state-boundary';

const messageSchema = z.object({
  type: z.string(),
  code: z.string().optional(),
  pid: z.number().optional(),
  revision: z.number().optional(),
  value: z.unknown().optional(),
});
interface LockChild {
  readonly process: ChildProcess;
  readonly exited: Promise<number | null>;
  readonly initial: Promise<z.infer<typeof messageSchema>>;
}

async function nextMessage(child: ChildProcess): Promise<z.infer<typeof messageSchema>> {
  const [message] = await once(child, 'message', { signal: AbortSignal.timeout(5000) });
  return messageSchema.parse(message);
}

function contender(file: string, mode: 'pause-stale-read' | 'writer'): LockChild {
  const child = fork(require.resolve('../fixtures/state-lock-worker'), [file, mode], {
    execPath: process.execPath,
    execArgv: ['--import', require.resolve('tsx')],
    env: { PATH: process.env.PATH, NODE_ENV: 'test' },
    stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
  });
  child.stderr?.resume();
  const exited = once(child, 'exit').then(([code]) => z.number().nullable().parse(code));
  return { process: child, exited, initial: nextMessage(child) };
}

async function stopChildren(children: readonly LockChild[]): Promise<void> {
  for (const child of children) {
    if (child.process.exitCode === null && child.process.signalCode === null)
      child.process.kill('SIGKILL');
  }
  await Promise.all(children.map(child => child.exited));
}

describe('Physical state lock ownership', () => {
  it.each([0, 1, 2])(
    'rechecks stale O under arbitration after A replaces it while B is paused (%i)',
    async () => {
      const directory = await mkdtemp(join(tmpdir(), 'noorg-lock-race-'));
      const file = join(directory, 'state.json');
      const lock = `${file}.lock`;
      const children: LockChild[] = [];
      const third = new FileStateStore(file);
      try {
        await mkdir(lock);
        await writeFile(
          join(lock, 'owner'),
          JSON.stringify({ pid: 99999999, createdAt: Date.now() - 120_000, token: 'stale-O' })
        );
        const b = contender(file, 'pause-stale-read');
        children.push(b);
        expect(await b.initial).toEqual({ type: 'observed' });
        const a = contender(file, 'writer');
        children.push(a);
        expect(await a.initial).toEqual(
          expect.objectContaining({ type: 'owned', pid: a.process.pid, revision: 1 })
        );
        const ownerA = await readFile(join(lock, 'owner'), 'utf8');
        const inodeA = await lstat(lock);
        const rejected = nextMessage(b.process);
        b.process.send({ type: 'resume' });
        expect(await rejected).toEqual({ type: 'rejected', code: 'STATE_LOCKED' });
        expect(await b.exited).toBe(0);
        expect(await readFile(join(lock, 'owner'), 'utf8')).toBe(ownerA);
        expect(await lstat(lock)).toEqual(
          expect.objectContaining({ dev: inodeA.dev, ino: inodeA.ino })
        );
        await expect(third.load()).rejects.toMatchObject({ code: 'STATE_LOCKED' });
        const flushed = nextMessage(a.process);
        a.process.send({ type: 'flush' });
        expect(await flushed).toEqual({ type: 'flushed', revision: 1, value: 'A' });
        expect(
          runtimeStateSchema.parse(JSON.parse(await readFile(file, 'utf8'))).state.writer
        ).toBe('A');
        a.process.send({ type: 'close' });
        expect(await a.exited).toBe(0);
      } finally {
        await stopChildren(children);
        await third.close();
        await rm(directory, { recursive: true, force: true });
      }
    },
    15_000
  );

  it('cannot flush or close through a replacement physical owner, even when the replacement advertises the same pid', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-lock-replace-'));
    const file = join(directory, 'state.json');
    const state = new FileStateStore(file);
    try {
      await state.load();
      await state.set('accepted', 1);
      const before = await readFile(file, 'utf8');
      await rename(`${file}.lock`, `${file}.lock.detached`);
      await mkdir(`${file}.lock`);
      const replacement = JSON.stringify({
        pid: process.pid,
        createdAt: Date.now(),
        token: 'replacement',
      });
      await writeFile(`${file}.lock/owner`, replacement);
      await expect(state.set('accepted', 99)).rejects.toMatchObject({ code: 'STATE_LOCK_LOST' });
      expect(state.get('accepted')).toBe(1);
      expect(state.isOpen()).toBe(false);
      await expect(state.flush()).rejects.toMatchObject({ code: 'STATE_LOCK_LOST' });
      await expect(state.close()).rejects.toMatchObject({ code: 'STATE_LOCK_LOST' });
      expect(await readFile(file, 'utf8')).toBe(before);
      expect(await readFile(`${file}.lock/owner`, 'utf8')).toBe(replacement);
    } finally {
      await Promise.allSettled([state.close()]);
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('removes only its owned temporary file if the main owner is replaced during a paused write', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-lock-write-replace-'));
    const file = join(directory, 'state.json');
    const boundary = new StateBoundary(file);
    const state = new FileStateStore(file, boundary.io);
    let release: (() => void) | undefined;
    try {
      await state.load();
      await state.set('accepted', 1);
      const before = await readFile(file, 'utf8');
      const barrier = boundary.pauseNextWrite();
      release = barrier.release;
      const pending = state.set('rejected', 99);
      const rejection = expect(pending).rejects.toMatchObject({ code: 'STATE_LOCK_LOST' });
      await barrier.entered;
      await rename(`${file}.lock`, `${file}.lock.detached`);
      await mkdir(`${file}.lock`);
      const replacement = JSON.stringify({
        pid: process.pid,
        createdAt: Date.now(),
        token: 'foreign-during-write',
      });
      await writeFile(`${file}.lock/owner`, replacement);
      barrier.release();
      await rejection;
      await expect(state.close()).rejects.toMatchObject({ code: 'STATE_LOCK_LOST' });
      expect(await readFile(file, 'utf8')).toBe(before);
      expect(await readFile(`${file}.lock/owner`, 'utf8')).toBe(replacement);
    } finally {
      release?.();
      await Promise.allSettled([state.close()]);
      await rm(directory, { recursive: true, force: true });
    }
  });

  it.each(['missing', 'invalid', 'numeric-junk', 'guard'] as const)(
    'fails closed for an ambiguous %s owner without deleting evidence',
    async kind => {
      const directory = await mkdtemp(join(tmpdir(), 'noorg-lock-ambiguous-'));
      const file = join(directory, 'state.json');
      const state = new FileStateStore(file);
      const evidencePath = kind === 'guard' ? `${file}.lock.guard` : `${file}.lock`;
      try {
        await mkdir(evidencePath);
        if (kind === 'invalid') await writeFile(join(evidencePath, 'owner'), '{not-json');
        if (kind === 'numeric-junk') await writeFile(join(evidencePath, 'owner'), '99999999#');
        const identity = await lstat(evidencePath);
        await expect(state.load()).rejects.toMatchObject({ code: 'STATE_LOCKED' });
        expect(await lstat(evidencePath)).toEqual(
          expect.objectContaining({ dev: identity.dev, ino: identity.ino })
        );
        expect(state.isOpen()).toBe(false);
      } finally {
        await state.close();
        await rm(directory, { recursive: true, force: true });
      }
    }
  );
});

describe('Durable state commit failure boundaries', () => {
  it.each(['write', 'sync'] as const)(
    'keeps rejected %s candidates out of get/snapshot/revision and later flush/close/reload',
    async fault => {
      const directory = await mkdtemp(join(tmpdir(), 'noorg-commit-failure-'));
      const file = join(directory, 'state.json');
      const boundary = new StateBoundary(file);
      const state = new FileStateStore(file, boundary.io);
      try {
        await state.load();
        await state.set('accepted', { value: 1 });
        const revision = state.revision();
        boundary.failNext(fault);
        await expect(state.set('accepted', { value: 99 })).rejects.toBe(boundary.error);
        expect(state.get('accepted')).toEqual({ value: 1 });
        expect(state.snapshot()).toEqual({ accepted: { value: 1 } });
        expect(state.revision()).toBe(revision);
        const updaterError = new Error('Rejected updater');
        await expect(
          state.update<{ value: number }>('accepted', current => {
            if (current === undefined) throw new Error('Missing fixture');
            current.value = 77;
            throw updaterError;
          })
        ).rejects.toBe(updaterError);
        await state.flush();
        await state.close();
        const reopened = new FileStateStore(file);
        try {
          await reopened.load();
          expect(reopened.snapshot()).toEqual({ accepted: { value: 1 } });
          expect(reopened.revision()).toBe(revision);
        } finally {
          await reopened.close();
        }
      } finally {
        await state.close();
        await rm(directory, { recursive: true, force: true });
      }
    }
  );

  it.each(['rename-before', 'rename-after', 'directory-sync'] as const)(
    'quarantines uncertain %s outcomes without publishing or automatically unlocking them',
    async fault => {
      const directory = await mkdtemp(join(tmpdir(), 'noorg-commit-uncertain-'));
      const file = join(directory, 'state.json');
      const boundary = new StateBoundary(file);
      const state = new FileStateStore(file, boundary.io);
      const follower = new FileStateStore(file);
      try {
        await state.load();
        await state.set('accepted', 1);
        const revision = state.revision();
        boundary.failNext(fault);
        await expect(state.set('accepted', 99)).rejects.toMatchObject({
          code: 'STATE_COMMIT_UNCERTAIN',
          cause: boundary.error,
        });
        expect(state.snapshot()).toEqual({ accepted: 1 });
        expect(state.revision()).toBe(revision);
        expect(state.isOpen()).toBe(false);
        expect((await lstat(`${file}.lock.guard`)).isDirectory()).toBe(true);
        await expect(state.flush()).rejects.toMatchObject({ code: 'STATE_COMMIT_UNCERTAIN' });
        await expect(state.close()).rejects.toMatchObject({ code: 'STATE_COMMIT_UNCERTAIN' });
        await expect(follower.load()).rejects.toMatchObject({ code: 'STATE_LOCKED' });
        const disk = runtimeStateSchema.parse(JSON.parse(await readFile(file, 'utf8')));
        expect(disk.state.accepted).toBe(fault === 'rename-before' ? 1 : 99);
        // A post-effect file is evidence of uncertainty, not an accepted repository revision.
        expect(state.revision()).toBe(revision);
      } finally {
        await Promise.allSettled([state.close(), follower.close()]);
        await rm(directory, { recursive: true, force: true });
      }
    }
  );

  it('does not expose a pending candidate and drains it before a concurrent close', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-commit-close-'));
    const file = join(directory, 'state.json');
    const boundary = new StateBoundary(file);
    const state = new FileStateStore(file, boundary.io);
    let release: (() => void) | undefined;
    try {
      await state.load();
      await state.set('accepted', 1);
      const barrier = boundary.pauseNextWrite();
      release = barrier.release;
      const pending = state.set('accepted', 2);
      await barrier.entered;
      const closing = state.close();
      expect(state.snapshot()).toEqual({ accepted: 1 });
      expect(state.revision()).toBe(1);
      await expect(state.set('late', true)).rejects.toMatchObject({ code: 'STATE_STORE_CLOSED' });
      barrier.release();
      await pending;
      await closing;
      expect(runtimeStateSchema.parse(JSON.parse(await readFile(file, 'utf8'))).state).toEqual({
        accepted: 2,
      });
    } finally {
      release?.();
      await state.close();
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe('Incomplete namespace acquisition', () => {
  it('fences an unopenable guard without reporting readiness or deleting ownership evidence', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-guard-open-'));
    const file = join(directory, 'state.json');
    const boundary = new StateBoundary(file);
    const state = new FileStateStore(file, boundary.io);
    const follower = new FileStateStore(file);
    try {
      await state.load();
      await state.set('accepted', 1);
      const revision = state.revision();
      boundary.failNext('guard-open');
      await expect(state.set('rejected', 99)).rejects.toMatchObject({
        code: 'STATE_LOCK_LOST',
        cause: boundary.error,
      });
      expect(state.snapshot()).toEqual({ accepted: 1 });
      expect(state.revision()).toBe(revision);
      expect(state.isOpen()).toBe(false);
      expect((await lstat(`${file}.lock.guard`)).isDirectory()).toBe(true);
      await expect(state.close()).rejects.toMatchObject({ code: 'STATE_LOCK_LOST' });
      await expect(follower.load()).rejects.toMatchObject({ code: 'STATE_LOCKED' });
      expect(runtimeStateSchema.parse(JSON.parse(await readFile(file, 'utf8'))).state).toEqual({
        accepted: 1,
      });
    } finally {
      await Promise.allSettled([state.close(), follower.close()]);
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe('Retained owner identities', () => {
  it.each(['token', 'guard'] as const)(
    'does not publish or clean through a changed %s identity during a real write',
    async kind => {
      const directory = await mkdtemp(join(tmpdir(), 'noorg-retained-identity-'));
      const file = join(directory, 'state.json');
      const boundary = new StateBoundary(file);
      const state = new FileStateStore(file, boundary.io);
      let release: (() => void) | undefined;
      try {
        await state.load();
        await state.set('accepted', 1);
        const before = await readFile(file, 'utf8');
        const barrier = boundary.pauseNextWrite();
        release = barrier.release;
        const pending = state.set('rejected', 99);
        const rejection =
          kind === 'token'
            ? expect(pending).rejects.toMatchObject({ code: 'STATE_LOCK_LOST' })
            : expect(pending).rejects.toBeInstanceOf(AggregateError);
        await barrier.entered;
        let evidencePath: string;
        let evidence: string;
        if (kind === 'token') {
          evidencePath = `${file}.lock/owner`;
          evidence = JSON.stringify({
            pid: process.pid,
            createdAt: Date.now(),
            token: 'new-token-same-directory',
          });
        } else {
          await rename(`${file}.lock.guard`, `${file}.lock.guard.detached`);
          await mkdir(`${file}.lock.guard`);
          evidencePath = `${file}.lock.guard/foreign.txt`;
          evidence = 'Foreign guard evidence';
        }
        await writeFile(evidencePath, evidence);
        barrier.release();
        await rejection;
        expect(state.snapshot()).toEqual({ accepted: 1 });
        expect(state.isOpen()).toBe(false);
        await expect(state.close()).rejects.toMatchObject({ code: 'STATE_LOCK_LOST' });
        expect(await readFile(file, 'utf8')).toBe(before);
        expect(await readFile(evidencePath, 'utf8')).toBe(evidence);
      } finally {
        release?.();
        await Promise.allSettled([state.close()]);
        await rm(directory, { recursive: true, force: true });
      }
    }
  );
});
