import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MemoryStateStore } from '../../src/state/state-store';
import { FileStateStore } from '../../src/state/state-store';

describe('MemoryStateStore', () => {
  it('returns defensive copies', async () => {
    const state = new MemoryStateStore();
    await state.set('value', { nested: { count: 1 } });
    const snapshot = state.get<{ nested: { count: number } }>('value');
    expect(snapshot).toEqual({ nested: { count: 1 } });
    snapshot!.nested.count = 99;
    expect(state.get<{ nested: { count: number } }>('value')!.nested.count).toBe(1);
  });

  it('updates values through a single typed operation', async () => {
    const state = new MemoryStateStore();
    await state.set('count', 1);
    await expect(state.update<number>('count', current => (current ?? 0) + 1)).resolves.toBe(2);
    expect(state.get<number>('count')).toBe(2);
  });

  it('persists a versioned state envelope atomically', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-state-'));
    const filePath = join(directory, 'state.json');
    const first = new FileStateStore(filePath);
    await first.load();
    await first.set('count', 7);
    await first.close();
    const second = new FileStateStore(filePath);
    await second.load();
    expect(second.get<number>('count')).toBe(7);
    await second.close();
    await rm(directory, { recursive: true, force: true });
  });

  it('migrates the previous envelope and protects the single-writer boundary', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-lock-'));
    const filePath = join(directory, 'state.json');
    await writeFile(filePath, JSON.stringify({ schemaVersion: 1, state: { count: 3 } }));
    const first = new FileStateStore(filePath);
    await first.load();
    expect(first.revision()).toBe(0);
    const second = new FileStateStore(filePath);
    await expect(second.load()).rejects.toThrow('already in use');
    await first.close();
    await second.load();
    expect(second.get<number>('count')).toBe(3);
    await second.close();
    await rm(directory, { recursive: true, force: true });
  });
});
