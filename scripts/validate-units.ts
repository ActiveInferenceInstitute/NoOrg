import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import {
  computeUnitManifest,
  diffUnitManifests,
  parseUnitManifest,
  type UnitManifest,
} from '../src/content/unit-manifest';

const root = resolve(process.cwd());
const unitsRoot = resolve(root, 'units');
const manifestPath = resolve(unitsRoot, 'manifest.json');
const required = ['README.md', 'AGENTS.md', 'unitdirectory.md'];

function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(absolute);
    return entry.isFile() && entry.name.endsWith('.md') ? [absolute] : [];
  });
}

const files = markdownFiles(unitsRoot).map(file => relative(root, file));
const violations: string[] = [];

let manifest: UnitManifest | undefined;
try {
  manifest = parseUnitManifest(JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown);
} catch {
  violations.push('units/manifest.json: reviewed integrity manifest is missing or invalid');
}

for (const requiredPath of required) {
  if (!existsSync(resolve(unitsRoot, requiredPath)))
    violations.push(`units/${requiredPath}: required file missing`);
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function resolvedTarget(source: string, target: string): string {
  if (target.startsWith('#')) return resolve(root, source);
  if (target.startsWith('/')) return resolve(root, target.slice(1));
  const withoutAnchor = target.split('#')[0] ?? target;
  const absolute = resolve(dirname(resolve(root, source)), withoutAnchor);
  const candidates = [
    absolute,
    `${absolute}.md`,
    resolve(absolute, 'README.md'),
    resolve(absolute, 'index.md'),
  ];
  return (
    candidates.find(candidate => existsSync(candidate) && statSync(candidate).isFile()) ?? absolute
  );
}

function anchors(file: string): Set<string> {
  const content = readFileSync(file, 'utf8');
  const result = new Set<string>();
  for (const explicit of content.matchAll(/\{#([A-Za-z0-9_-]+)\}/g)) {
    if (explicit[1]) result.add(explicit[1]);
  }
  for (const heading of content.matchAll(/^#{1,6}\s+(.+?)(?:\s+#+)?$/gm)) {
    if (heading[1]) result.add(slug(heading[1]));
  }
  return result;
}

for (const file of files) {
  const absolute = resolve(root, file);
  if (!existsSync(absolute)) continue;
  const content = readFileSync(absolute, 'utf8');
  if (/(^|\/)(src\/core|agents\/system|src\/agents)(\/|$)/m.test(content))
    violations.push(`${file}: stale runtime-tree reference`);
  const markdownLinks = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;
  for (const match of content.matchAll(markdownLinks)) {
    const target = match[1]?.replace(/^<|>$/g, '');
    if (!target || /^(https?:|mailto:)/i.test(target)) continue;
    if (isAbsolute(target) || target.includes('..')) {
      const candidate = resolvedTarget(file, target);
      const outside = relative(unitsRoot, candidate).startsWith('..');
      if (outside && !existsSync(candidate)) {
        violations.push(`${file}: unresolved link ${target}`);
        continue;
      }
    }
    const targetFile = resolvedTarget(file, target);
    if (!existsSync(targetFile)) {
      violations.push(`${file}: unresolved link ${target}`);
      continue;
    }
    const anchor = target.split('#')[1];
    if (anchor) {
      const normalizedAnchor = anchor.replace(/-+/g, '-');
      const found = [...anchors(targetFile)].some(
        candidate => candidate.replace(/-+/g, '-') === normalizedAnchor
      );
      if (!found) violations.push(`${file}: unresolved anchor ${target}`);
    }
  }
}

const unitFileCount = files.length;
const linkCount = files.reduce((total, file) => {
  const content = readFileSync(resolve(root, file), 'utf8');
  return total + [...content.matchAll(/!?\[[^\]]*\]\([^)]*\)/g)].length;
}, 0);
const computedManifest = computeUnitManifest(unitsRoot);
if (manifest !== undefined && unitFileCount !== manifest.fileCount)
  violations.push(
    `units: unexpected corpus size ${unitFileCount}; manifest records ${manifest.fileCount}`
  );
if (manifest !== undefined && linkCount !== manifest.linkCount)
  violations.push(
    `units: link graph changed: manifest records ${manifest.linkCount}, found ${linkCount}`
  );
if (manifest !== undefined && computedManifest.contentSha256 !== manifest.contentSha256)
  violations.push('units: content digest does not match the reviewed integrity manifest');
if (manifest !== undefined) {
  const diff = diffUnitManifests(manifest, computedManifest);
  for (const file of diff.added) violations.push(`units: unreviewed file added ${file}`);
  for (const file of diff.removed) violations.push(`units: reviewed file removed ${file}`);
  for (const file of diff.changed) violations.push(`units: unreviewed file changed ${file}`);
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.info(
    `Unit corpus validation passed for ${unitFileCount} Markdown files and ${linkCount} links.`
  );
}
