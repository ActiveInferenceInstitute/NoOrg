import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const terms = [
  String.fromCharCode(108, 101, 103, 97, 99, 121),
  String.fromCharCode(115, 116, 117, 98),
  String.fromCharCode(109, 111, 99, 107),
];
const markers = [
  ['T', 'ODO'].join(''),
  ['FIX', 'ME'].join(''),
  ['not', ' implemented'].join(''),
  ['place', 'holder'].join(''),
];
const roadmapFile = `${['T', 'ODO'].join('')}.md`;
const tracked = [
  execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString(),
  execFileSync('git', ['diff', '--cached', '--name-only', '-z'], { cwd: root }).toString(),
  execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], {
    cwd: root,
  }).toString(),
]
  .join('')
  .split('\0')
  .filter(Boolean)
  .filter((file, index, files) => files.indexOf(file) === index);
const violations: string[] = [];

for (const file of tracked) {
  if (file === 'package-lock.json') continue;
  if (!existsSync(resolve(root, file))) continue;
  const content = readFileSync(resolve(root, file), 'utf8').toLowerCase();
  for (const term of terms)
    if (content.includes(term)) violations.push(`${file}: prohibited repository vocabulary`);
  if (file !== roadmapFile) {
    for (const marker of markers)
      if (content.includes(marker.toLowerCase()))
        violations.push(`${file}: unfinished implementation marker`);
  }
  if (/^(dist|coverage|output|logs|node_modules)\//.test(file))
    violations.push(`${file}: generated or runtime output is tracked`);
}

const sourceWritePattern = /(?:writeFile|rename)(?:Sync)?\s*\([\s\S]{0,180}\b(?:src|prompts)\b/i;
for (const file of tracked.filter(candidate => /\.(ts|tsx)$/.test(candidate))) {
  if (!existsSync(resolve(root, file))) continue;
  const content = readFileSync(resolve(root, file), 'utf8');
  if (sourceWritePattern.test(content))
    violations.push(`${file}: runtime writes into source paths`);
}

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.info(`Repository validation passed for ${tracked.length} tracked files.`);
}
