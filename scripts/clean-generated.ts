import { existsSync, rmSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const root = resolve(process.cwd());
const generatedPaths = ['dist', 'coverage', 'docs/manuscript/output'];

function assertInsideRepository(path: string): void {
  const relativePath = relative(root, path);
  if (relativePath === '' || relativePath.startsWith('..') || relativePath.startsWith('/')) {
    throw new Error(`Refusing to remove path outside repository: ${path}`);
  }
}

for (const entry of generatedPaths) {
  const path = resolve(root, entry);
  assertInsideRepository(path);
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
    process.stdout.write(`removed ${entry}\n`);
  }
}
