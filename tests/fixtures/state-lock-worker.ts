import { on, once } from 'node:events';
import { z } from 'zod';
import { NoOrgError } from '../../src/domain/errors';
import {
  FileStateStore,
  nodeStateStoreIO,
  type FileStateStoreIO,
} from '../../src/state/state-store';

async function main(): Promise<void> {
  const file = z.string().min(1).parse(process.argv[2]);
  const mode = z.enum(['pause-stale-read', 'writer']).parse(process.argv[3]);
  const send = process.send?.bind(process);
  if (send === undefined) throw new Error('Lock worker requires its parent IPC channel');
  let observed = false;
  // Preserve native readFile overloads: the barrier forwards arguments/results unchanged.
  const readOwnedFile = (async (...args: Parameters<typeof nodeStateStoreIO.readFile>) => {
    const contents = await nodeStateStoreIO.readFile(...args);
    if (mode === 'pause-stale-read' && !observed && String(args[0]) === `${file}.lock/owner`) {
      observed = true;
      const resumed = once(process, 'message', { signal: AbortSignal.timeout(5000) });
      send({ type: 'observed' });
      const [message] = await resumed;
      z.object({ type: z.literal('resume') }).parse(message);
    }
    return contents;
  }) as typeof nodeStateStoreIO.readFile;
  const io: FileStateStoreIO = { ...nodeStateStoreIO, readFile: readOwnedFile };
  const store = new FileStateStore(file, io);
  try {
    try {
      await store.load();
    } catch (error) {
      if (!(error instanceof NoOrgError)) throw error;
      send({ type: 'rejected', code: error.code });
      return;
    }
    if (mode === 'pause-stale-read') {
      send({ type: 'unexpected-acquisition' });
      return;
    }
    await store.set('writer', 'A');
    send({ type: 'owned', pid: process.pid, revision: store.revision() });
    for await (const [message] of on(process, 'message', { signal: AbortSignal.timeout(10_000) })) {
      const command = z.object({ type: z.enum(['flush', 'close']) }).parse(message);
      if (command.type === 'close') break;
      await store.flush();
      send({ type: 'flushed', revision: store.revision(), value: store.get('writer') });
    }
  } finally {
    await store.close();
    if (process.connected && process.disconnect !== undefined) process.disconnect();
  }
}

void main().catch(error => {
  process.stderr.write(String(error) + '\n');
  process.exitCode = 1;
  if (process.connected && process.disconnect !== undefined) process.disconnect();
});
