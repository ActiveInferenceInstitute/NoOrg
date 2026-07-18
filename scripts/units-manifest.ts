import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  computeUnitManifest,
  diffUnitManifests,
  parseUnitManifest,
  type UnitManifest,
} from '../src/content/unit-manifest';

const mode = process.argv[2] ?? 'check';
const root = resolve(process.cwd());
const unitsRoot = resolve(root, 'units');
const manifestPath = resolve(unitsRoot, 'manifest.json');
const actual = computeUnitManifest(unitsRoot);

function readExpected(): UnitManifest {
  if (!existsSync(manifestPath)) throw new Error('units/manifest.json is missing');
  return parseUnitManifest(JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown);
}

function printDiff(expected: UnitManifest, candidate: UnitManifest): boolean {
  const diff = diffUnitManifests(expected, candidate);
  const changed =
    diff.added.length > 0 ||
    diff.removed.length > 0 ||
    diff.changed.length > 0 ||
    expected.contentSha256 !== candidate.contentSha256 ||
    expected.linkCount !== candidate.linkCount;
  if (!changed) {
    console.info('Unit manifest is current.');
    return false;
  }
  for (const path of diff.added) console.info(`ADDED ${path}`);
  for (const path of diff.removed) console.info(`REMOVED ${path}`);
  for (const path of diff.changed) console.info(`CHANGED ${path}`);
  if (expected.linkCount !== candidate.linkCount)
    console.info(`LINKS ${expected.linkCount} -> ${candidate.linkCount}`);
  if (expected.contentSha256 !== candidate.contentSha256)
    console.info(`CONTENT ${expected.contentSha256} -> ${candidate.contentSha256}`);
  return true;
}

try {
  if (mode === 'write') {
    writeFileSync(manifestPath, `${JSON.stringify(actual, null, 2)}\n`, 'utf8');
    console.info(`Wrote ${manifestPath}`);
  } else if (mode === 'diff') {
    if (printDiff(readExpected(), actual)) process.exitCode = 1;
  } else if (mode === 'check') {
    const expected = readExpected();
    if (printDiff(expected, actual)) process.exitCode = 1;
  } else {
    throw new Error('Usage: units-manifest.ts check|diff|write');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
