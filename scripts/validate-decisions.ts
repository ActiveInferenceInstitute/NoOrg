import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const required: Record<string, readonly string[]> = {
  'docs/decisions/0001-storage-boundary.md': [
    'Status: evidence-required',
    'SQLite',
    'p50/p95/p99',
    'StateStore',
  ],
  'docs/decisions/0002-distributed-boundary.md': [
    'Status: evidence-required',
    'failure model',
    'exactly-once external effects',
    'rollback plan',
  ],
};
const violations: string[] = [];
for (const [file, markers] of Object.entries(required)) {
  const path = resolve(root, file);
  if (!existsSync(path)) {
    violations.push(`${file}: decision record is missing`);
    continue;
  }
  const content = readFileSync(path, 'utf8');
  for (const marker of markers)
    if (!content.includes(marker)) violations.push(`${file}: missing ${marker}`);
}
if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.info('Architecture decision records passed evidence-boundary validation.');
}
