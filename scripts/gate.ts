import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(process.cwd());
const reportPath = resolve(root, 'docs/_generated/gate-timings.md');
const baselinePath = resolve(root, 'docs/_generated/gate-baseline.json');

type Command =
  | { readonly kind: 'script'; readonly name: string }
  | { readonly kind: 'program'; readonly name: string; readonly args: readonly string[] };

interface Arm {
  readonly description: string;
  readonly commands?: readonly Command[];
  readonly includes?: readonly string[];
  readonly measured: boolean;
}

const script = (name: string): Command => ({ kind: 'script', name });
const program = (name: string, args: readonly string[]): Command => ({
  kind: 'program',
  name,
  args,
});

const arms: Record<string, Arm> = {
  types: {
    description: 'TypeScript type check of source, tests, and scripts',
    commands: [script('type-check')],
    measured: true,
  },
  lint: {
    description: 'ESLint over source, tests, and scripts',
    commands: [script('lint')],
    measured: true,
  },
  format: {
    description: 'Prettier format check',
    commands: [script('format:check')],
    measured: true,
  },
  'test:fast': {
    description: 'Unit suite only (tests/unit), the fastest test selection',
    commands: [script('test:fast')],
    measured: true,
  },
  'test:offline': {
    description: 'Unit and integration suites without coverage instrumentation',
    commands: [script('test')],
    measured: false,
  },
  'test:full': {
    description: 'Complete offline suite with the enforced coverage thresholds',
    commands: [script('test:coverage')],
    measured: true,
  },
  docs: {
    description: 'Relative Markdown links and anchors across the repository',
    commands: [script('validate:docs')],
    measured: true,
  },
  policy: {
    description: 'Tracked-file, corpus, OpenAPI, contract, and decision-record gates',
    commands: [
      script('validate:text'),
      script('validate:units'),
      script('units:manifest:check'),
      script('api:openapi:check'),
      script('validate:contracts'),
      script('validate:decisions'),
    ],
    measured: true,
  },
  build: {
    description: 'Compile dist/ with tsc',
    commands: [script('build')],
    measured: true,
  },
  gnn: {
    description: 'Pinned GNN conformance check from .github/gnn-pin.json',
    commands: [program('python3', ['scripts/gnn-conformance.py'])],
    measured: true,
  },
  manuscript: {
    description: 'Evidence, figures, hydration, validation, and rendered manuscript check',
    commands: [script('manuscript:check')],
    measured: true,
  },
  security: {
    description: 'High-severity dependency audit',
    commands: [script('audit')],
    measured: false,
  },
  container: {
    description: 'Container image build and readiness probe',
    commands: [program('bash', ['scripts/container-check.sh'])],
    measured: false,
  },
  live: {
    description: 'Live OpenAI provider suite; requires the openai profile and an API key',
    commands: [script('test:live')],
    measured: false,
  },
  fast: {
    description: 'Default fast loop: types, lint, format, unit tests, docs',
    includes: ['types', 'lint', 'format', 'test:fast', 'docs'],
    measured: false,
  },
  all: {
    description: 'Ordinary gate: every offline arm except live, container, and manuscript',
    includes: ['types', 'lint', 'format', 'test:full', 'docs', 'policy', 'build'],
    measured: false,
  },
};

function label(command: Command): string {
  return command.kind === 'script'
    ? `npm run ${command.name}`
    : `${command.name} ${command.args.join(' ')}`;
}

function expand(name: string): readonly Command[] {
  const arm = arms[name];
  if (arm === undefined) throw new Error(`Unknown gate arm: ${name}`);
  if (arm.commands !== undefined) return arm.commands;
  return (arm.includes ?? []).flatMap(expand);
}

function execute(command: Command, capture: boolean): number {
  const result =
    command.kind === 'script'
      ? spawnSync('npm', ['run', command.name], {
          cwd: root,
          stdio: capture ? 'pipe' : 'inherit',
          encoding: 'utf8',
        })
      : spawnSync(command.name, [...command.args], {
          cwd: root,
          stdio: capture ? 'pipe' : 'inherit',
          encoding: 'utf8',
        });
  if (result.error !== undefined) throw new Error(`${label(command)}: ${result.error.message}`);
  const status = result.status ?? 1;
  if (status !== 0 && capture) {
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
    if (output !== '') console.error(output);
  }
  return status;
}

function runArm(name: string, capture = false): number {
  const arm = arms[name];
  if (arm === undefined) throw new Error(`Unknown gate arm: ${name}`);
  console.info(`gate: ${name} — ${arm.description}`);
  for (const command of expand(name)) {
    const started = Date.now();
    const status = execute(command, capture);
    if (status !== 0) {
      console.error(`gate: ${name} failed in ${label(command)}`);
      return status;
    }
    if (capture)
      console.info(`  ${label(command)}: ${((Date.now() - started) / 1000).toFixed(2)}s`);
  }
  return 0;
}

function listArms(): void {
  const rows = Object.entries(arms).map(([name, arm]) => {
    const commands =
      arm.commands?.map(label).join('; ') ??
      (arm.includes ?? []).map(item => `arm:${item}`).join('; ');
    return `| \`${name}\` | ${arm.description} | ${commands} |`;
  });
  console.info('| Arm | Purpose | Commands |');
  console.info('| --- | --- | --- |');
  for (const row of rows) console.info(row);
}

interface Baseline {
  readonly captured?: string;
  readonly note?: string;
  readonly arms?: Record<string, number>;
}

interface TestEvidence {
  readonly total: number;
  readonly passed: number;
  readonly skipped: number;
}

function readJsonIfPresent(path: string): unknown {
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}

function numberField(value: unknown, key: string): number | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined;
}

function percentage(value: unknown, key: string): number | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const node = (value as Record<string, unknown>)[key];
  return numberField(node, 'pct');
}

function testEvidence(): TestEvidence | undefined {
  const results = readJsonIfPresent(resolve(root, 'coverage/jest-results.json'));
  const total = numberField(results, 'numTotalTests');
  const passed = numberField(results, 'numPassedTests');
  if (total === undefined || passed === undefined) return undefined;
  return {
    total,
    passed,
    skipped: numberField(results, 'numPendingTests') ?? total - passed,
  };
}

function coverageSummary(): { lines: number | undefined; branches: number | undefined } {
  const summary = readJsonIfPresent(resolve(root, 'coverage/coverage-summary.json'));
  const totals =
    typeof summary === 'object' && summary !== null
      ? (summary as Record<string, unknown>).total
      : undefined;
  return { lines: percentage(totals, 'lines'), branches: percentage(totals, 'branches') };
}

function platform(): string {
  return `${process.platform} ${process.arch}, Node ${process.version}`;
}

function writeReport(timings: Record<string, number>, baseline: Baseline): void {
  const captured = new Date().toISOString();
  const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root })
    .toString()
    .trim();
  const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: root }).toString().trim();
  const state = dirty === '' ? 'clean working tree' : 'working tree had uncommitted changes';
  const lines: string[] = [
    '# Gate arm measurements',
    '',
    '<!-- Generated by `./run.sh report` (scripts/gate.ts). Never edit this file by hand. -->',
    '',
    'One run per arm on one host; wall time covers process startup and every step of the arm.',
    'A single run is a point measurement, not a controlled benchmark: small deltas on an unchanged command are variance, not improvement.',
    'The two columns come from separate passes over a shared host; see the baseline file for how its column was produced.',
    `Captured ${captured} at commit \`${commit}\` (${state}) on ${platform()}.`,
    '',
    '| Arm | Commands | Baseline (s, earlier pass) | Measured (s) |',
    '| --- | --- | --- | --- |',
  ];
  for (const [name, seconds] of Object.entries(timings)) {
    const commands = expand(name).map(label).join('<br>');
    const before = baseline.arms?.[name];
    lines.push(
      `| \`${name}\` | ${commands} | ${before === undefined ? '—' : before.toFixed(2)} | ${seconds.toFixed(2)} |`
    );
  }
  if (baseline.captured !== undefined || baseline.note !== undefined) {
    lines.push(
      '',
      'Baseline column: ' + [baseline.captured, baseline.note].filter(Boolean).join(' — '),
      'The baseline is a separate earlier pass over the same host. It is an order-of-magnitude reference for the pre-change commands, not a delta claim: an arm whose command did not change should read as equal.'
    );
  }
  const evidence = testEvidence();
  const coverage = coverageSummary();
  lines.push('', '## Test evidence', '');
  if (evidence !== undefined) {
    lines.push(
      `- Tests: ${evidence.total} total, ${evidence.passed} passed, ${evidence.skipped} skipped.`
    );
  } else {
    lines.push('- Tests: unavailable; run `./run.sh test:full` with the report.');
  }
  if (coverage.lines !== undefined && coverage.branches !== undefined) {
    lines.push(
      `- Coverage: ${coverage.lines.toFixed(2)}% lines, ${coverage.branches.toFixed(2)}% branches (thresholds 90% and 80%).`
    );
  } else {
    lines.push('- Coverage: unavailable; run `./run.sh test:full` with the report.');
  }
  lines.push('');
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${lines.join('\n').trimEnd()}\n`, 'utf8');
  console.info(`gate: wrote ${reportPath}`);
}

function report(): number {
  const baseline = (readJsonIfPresent(baselinePath) ?? {}) as Baseline;
  const timings: Record<string, number> = {};
  for (const [name, arm] of Object.entries(arms)) {
    if (!arm.measured) continue;
    const started = process.hrtime.bigint();
    const status = runArm(name, true);
    const seconds = Number(process.hrtime.bigint() - started) / 1e9;
    if (status !== 0) {
      console.error(`gate: arm ${name} failed; prior report preserved`);
      return status;
    }
    timings[name] = seconds;
  }
  writeReport(timings, baseline);
  return 0;
}

function main(): number {
  const requested = process.argv.slice(2);
  if (requested[0] === '--list') {
    listArms();
    return 0;
  }
  if (requested[0] === 'report') return report();
  const names = requested.length === 0 ? ['fast'] : requested;
  for (const name of names) {
    const status = runArm(name);
    if (status !== 0) return status;
  }
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
