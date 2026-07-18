import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

export interface UnitManifest {
  readonly manifestVersion: 1;
  readonly fileCount: number;
  readonly linkCount: number;
  readonly contentSha256: string;
  readonly files: Readonly<Record<string, string>>;
}

export function computeUnitManifest(root: string): UnitManifest {
  const resolvedRoot = resolve(root);
  const paths = markdownFiles(resolvedRoot).sort();
  const files: Record<string, string> = {};
  const contentHash = createHash('sha256');
  let linkCount = 0;
  for (const path of paths) {
    const content = readFileSync(resolve(resolvedRoot, path));
    files[path] = digest(content);
    linkCount += [...content.toString('utf8').matchAll(/!?\[[^\]]*\]\([^)]*\)/g)].length;
    contentHash.update(path);
    contentHash.update('\0');
    contentHash.update(content);
    contentHash.update('\0');
  }
  return {
    manifestVersion: 1,
    fileCount: paths.length,
    linkCount,
    contentSha256: contentHash.digest('hex'),
    files,
  };
}

export function parseUnitManifest(value: unknown): UnitManifest {
  if (typeof value !== 'object' || value === null) throw new Error('Invalid unit manifest');
  const candidate = value as Partial<UnitManifest>;
  if (
    candidate.manifestVersion !== 1 ||
    typeof candidate.fileCount !== 'number' ||
    !Number.isInteger(candidate.fileCount) ||
    candidate.fileCount < 0 ||
    typeof candidate.linkCount !== 'number' ||
    !Number.isInteger(candidate.linkCount) ||
    candidate.linkCount < 0 ||
    typeof candidate.contentSha256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(candidate.contentSha256) ||
    typeof candidate.files !== 'object' ||
    candidate.files === null ||
    Array.isArray(candidate.files)
  )
    throw new Error('Invalid unit manifest');
  const files: Record<string, string> = {};
  for (const [path, hash] of Object.entries(candidate.files)) {
    if (!path.endsWith('.md') || !/^[a-f0-9]{64}$/.test(hash))
      throw new Error('Invalid unit manifest file digest');
    files[path] = hash;
  }
  if (Object.keys(files).length !== candidate.fileCount)
    throw new Error('Unit manifest file count does not match file digests');
  return { ...candidate, files } as UnitManifest;
}

export interface UnitManifestDiff {
  readonly added: readonly string[];
  readonly removed: readonly string[];
  readonly changed: readonly string[];
}

export function diffUnitManifests(expected: UnitManifest, actual: UnitManifest): UnitManifestDiff {
  const expectedPaths = new Set(Object.keys(expected.files));
  const actualPaths = new Set(Object.keys(actual.files));
  const added = [...actualPaths].filter(path => !expectedPaths.has(path)).sort();
  const removed = [...expectedPaths].filter(path => !actualPaths.has(path)).sort();
  const changed = [...actualPaths]
    .filter(path => expectedPaths.has(path) && actual.files[path] !== expected.files[path])
    .sort();
  return { added, removed, changed };
}

function markdownFiles(root: string, directory = root): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(root, absolute);
    return entry.isFile() && entry.name.endsWith('.md')
      ? [relative(root, absolute).replaceAll('\\', '/')]
      : [];
  });
}

function digest(value: Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}
