import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(process.cwd());
const trackedFiles = execFileSync('git', ['ls-files', '*.md'], { cwd: root })
  .toString()
  .split('\n')
  .filter(Boolean);
const manuscriptFiles = execFileSync('find', ['docs', '-type', 'f', '-name', '*.md'], { cwd: root })
  .toString()
  .split('\n')
  .filter(Boolean);
const files = [...new Set([...trackedFiles, ...manuscriptFiles])];
const broken: string[] = [];
const markdownLink = /!?\[[^\]]+\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;
const headingSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-');

function isGeneratedManuscriptAsset(file: string, target: string): boolean {
  return file.startsWith('docs/manuscript/') && target.startsWith('output/figures/');
}

function existsWithExactCase(path: string): boolean {
  const relativePath = relative(root, path);
  if (relativePath === '' || relativePath.startsWith('..') || relativePath.startsWith(sep))
    return false;
  let current = root;
  for (const segment of relativePath.split(sep)) {
    let entry: string | undefined;
    try {
      entry = readdirSync(current).find(candidate => candidate === segment);
    } catch {
      return false;
    }
    if (entry === undefined) return false;
    current = join(current, entry);
  }
  return true;
}

for (const file of files) {
  if (!existsSync(resolve(root, file))) continue;
  const content = readFileSync(resolve(root, file), 'utf8')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '');
  for (const match of content.matchAll(markdownLink)) {
    const target = match[1];
    if (!target || /^https?:\/\//.test(target) || target.startsWith('mailto:')) continue;
    if (isGeneratedManuscriptAsset(file, target)) continue;
    const [pathPart, anchor] = target.split('#');
    const targetPath = pathPart ? resolve(root, file, '..', pathPart) : resolve(root, file);
    const candidates = [
      targetPath,
      `${targetPath}.md`,
      resolve(targetPath, 'README.md'),
      resolve(targetPath, 'index.md'),
    ];
    const resolved = candidates.find(
      candidate => existsWithExactCase(candidate) && statSync(candidate).isFile()
    );
    if (!anchor && existsWithExactCase(targetPath)) continue;
    if (!resolved) {
      broken.push(`${file}: ${target}`);
      continue;
    }
    if (anchor) {
      const targetContent = readFileSync(resolved, 'utf8');
      const anchors = new Set(
        [
          ...targetContent.matchAll(/\{#([A-Za-z0-9_-]+)\}/g),
          ...targetContent.matchAll(/^#{1,6}\s+(.+?)(?:\s+#+)?$/gm),
        ].flatMap(match => (match[1] ? [match[1], headingSlug(match[1])] : []))
      );
      const normalizedAnchor = anchor.replace(/-+/g, '-');
      if (![...anchors].some(candidate => candidate.replace(/-+/g, '-') === normalizedAnchor))
        broken.push(`${file}: unresolved anchor ${target}`);
    }
  }
}

if (broken.length > 0) {
  console.error(broken.join('\n'));
  process.exitCode = 1;
} else {
  console.info(`Documentation validation passed for ${files.length} markdown files.`);
}
