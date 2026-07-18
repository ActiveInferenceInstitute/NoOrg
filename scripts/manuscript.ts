import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { z } from 'zod';
import { AnalysisAgent } from '../src/agents/builtins';
import { AgentRegistry } from '../src/agents/registry';
import { Coordinator } from '../src/coordination/coordinator';
import { SystemClock } from '../src/domain/clock';
import { EventBus } from '../src/events/event-bus';
import { MemoryLogger } from '../src/logging/logger';
import { Metrics } from '../src/metrics/metrics';
import { DeterministicProvider } from '../src/providers/provider';
import { MemoryStateStore } from '../src/state/state-store';
import { UnitCorpus } from '../src/content/unit-corpus';

const root = resolve(process.cwd());
const manuscriptRoot = resolve(root, 'docs/manuscript');
const outputRoot = resolve(manuscriptRoot, 'output');
const evidenceRoot = resolve(outputRoot, 'evidence');
const hydratedRoot = resolve(outputRoot, 'manuscript');
const figureRoot = resolve(outputRoot, 'figures');
const chapters = [
  '00_abstract.md',
  '01_introduction.md',
  '02_system_model.md',
  '03_architecture.md',
  '04_execution_semantics.md',
  '05_evaluation.md',
  '06_reproducibility.md',
  '07_scope_and_related_work.md',
  '08_appendix_contracts.md',
  '09_claims_and_evidence.md',
  '98_glossary.md',
  '99_references.md',
];
const figures = ['architecture', 'lifecycle', 'provider', 'persistence', 'verification'];

interface RuntimeEvidence {
  readonly generatedAt: string;
  readonly releaseDate: string;
  readonly testCount: number;
  readonly passedTestCount: number;
  readonly unitFiles: number;
  readonly linkCount: number;
  readonly completedStatus: string;
  readonly totalTokens: number;
  readonly costUsd: number;
  readonly stateRevision: number;
  readonly eventDeliveries: number;
  readonly ready: boolean;
  readonly provider: string;
}

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true });
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}

function numberProperty(value: unknown, key: string): number {
  if (typeof value !== 'object' || value === null || !(key in value))
    throw new Error(`Evidence field ${key} is missing`);
  const field = (value as Record<string, unknown>)[key];
  if (typeof field !== 'number' || !Number.isFinite(field))
    throw new Error(`Evidence field ${key} is not finite`);
  return field;
}

function testCountFromJest(path: string): { total: number; passed: number } {
  const value = readJson(path);
  return {
    total: numberProperty(value, 'numTotalTests'),
    passed: numberProperty(value, 'numPassedTests'),
  };
}

function findExecutable(directory: string, executableName: string): string | undefined {
  if (!existsSync(directory)) return undefined;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isFile() && entry.name === executableName) return path;
    if (entry.isDirectory()) {
      const nested = findExecutable(path, executableName);
      if (nested) return nested;
    }
  }
  return undefined;
}

function findFigureBrowser(): string | undefined {
  const headlessShell = findExecutable(
    resolve(process.env.HOME ?? root, '.cache/puppeteer/chrome-headless-shell'),
    'chrome-headless-shell'
  );
  if (headlessShell) return headlessShell;
  const systemChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return existsSync(systemChrome) ? systemChrome : undefined;
}

async function collectEvidence(): Promise<void> {
  ensureDirectory(evidenceRoot);
  const jestPath = resolve(evidenceRoot, 'jest.json');
  const state = new MemoryStateStore();
  const registry = new AgentRegistry();
  registry.register(new AnalysisAgent());
  const events = new EventBus();
  let deliveries = 0;
  events.subscribe('task.completed', () => {
    deliveries += 1;
  });
  const provider = new DeterministicProvider();
  const coordinator = new Coordinator({
    state,
    registry,
    provider,
    events,
    metrics: new Metrics(),
    logger: new MemoryLogger(),
    clock: new SystemClock(),
    pollIntervalMs: 2,
    maxConcurrentTasks: 1,
    defaultTaskTimeoutMs: 2000,
    agentConfiguration: { provider: 'local', environment: 'test' },
  });
  try {
    await coordinator.start();
    const task = await coordinator.submitTask({
      agentId: 'analysis',
      name: 'Manuscript evidence task',
      description: 'Execute the registered analysis agent against a complete input',
      input: 'NoOrg evidence records a complete task execution.',
    });
    const deadline = Date.now() + 5000;
    let completed = coordinator.getTask(task.id);
    while (completed?.status === 'queued' || completed?.status === 'running') {
      if (Date.now() > deadline) throw new Error('Evidence task did not reach a terminal state');
      await new Promise(resolvePromise => setTimeout(resolvePromise, 5));
      completed = coordinator.getTask(task.id);
    }
    if (!completed || completed.status !== 'completed')
      throw new Error(`Evidence task ended with ${completed?.status ?? 'missing'} status`);
    const usageProbe = await provider.complete(
      {
        operation: 'manuscript-usage-probe',
        input: { purpose: 'release-evidence' },
        localDerivation: () => ({ ok: true }),
      },
      z.object({ ok: z.boolean() })
    );
    execFileSync('npm', ['test', '--', '--runInBand', '--json', `--outputFile=${jestPath}`], {
      cwd: root,
      env: { ...process.env, NOORG_LLM_PROVIDER: 'local' },
      stdio: 'pipe',
    });
    const tests = testCountFromJest(jestPath);
    const health = coordinator.getHealth();
    const unitManifest = await new UnitCorpus().manifest();
    const evidence: RuntimeEvidence = {
      generatedAt: new Date().toISOString(),
      releaseDate: new Date().toISOString().slice(0, 10),
      testCount: tests.total,
      passedTestCount: tests.passed,
      unitFiles: unitManifest.fileCount,
      linkCount: unitManifest.linkCount,
      completedStatus: completed.status,
      totalTokens: usageProbe.usage.totalTokens,
      costUsd: usageProbe.usage.costUsd,
      stateRevision: health.stateRevision,
      eventDeliveries: deliveries,
      ready:
        health.status === 'running' &&
        health.registryReady &&
        health.providerReady &&
        health.stateReady,
      provider: health.provider,
    };
    writeFileSync(
      resolve(evidenceRoot, 'runtime.json'),
      `${JSON.stringify(evidence, null, 2)}\n`,
      'utf8'
    );
  } finally {
    await coordinator.shutdown();
  }
}

function renderFigures(): void {
  ensureDirectory(figureRoot);
  const browser = findFigureBrowser();
  const puppeteerConfig = {
    ...(browser ? { executablePath: browser } : {}),
    timeout: 120000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };
  const puppeteerConfigPath = resolve(outputRoot, 'puppeteer-config.json');
  writeFileSync(puppeteerConfigPath, `${JSON.stringify(puppeteerConfig, null, 2)}\n`, 'utf8');
  for (const figure of figures) {
    const input = resolve(manuscriptRoot, 'figures', `${figure}.mmd`);
    const output = resolve(figureRoot, `${figure}.png`);
    execFileSync(
      'mmdc',
      ['-i', input, '-o', output, '-b', 'transparent', '-p', puppeteerConfigPath],
      {
        cwd: root,
        stdio: 'pipe',
      }
    );
  }
}

function sourceFiles(): string[] {
  return [...chapters, 'config.yaml', 'references.bib'].map(file => resolve(manuscriptRoot, file));
}

function hydrate(): void {
  const evidencePath = resolve(evidenceRoot, 'runtime.json');
  if (!existsSync(evidencePath))
    throw new Error('Run manuscript:evidence before manuscript:hydrate');
  const evidence = readJson(evidencePath) as RuntimeEvidence;
  const values: Record<string, string> = {
    RELEASE_DATE: evidence.releaseDate,
    EVIDENCE_TEST_COUNT: String(evidence.passedTestCount),
    EVIDENCE_UNIT_FILES: String(evidence.unitFiles),
    EVIDENCE_LINK_COUNT: String(evidence.linkCount),
    EVIDENCE_COMPLETED_STATUS: evidence.completedStatus,
    EVIDENCE_TOTAL_TOKENS: String(evidence.totalTokens),
    EVIDENCE_COST_USD: evidence.costUsd.toFixed(6),
    EVIDENCE_STATE_REVISION: String(evidence.stateRevision),
    EVIDENCE_EVENT_DELIVERIES: String(evidence.eventDeliveries),
  };
  rmSync(hydratedRoot, { recursive: true, force: true });
  ensureDirectory(hydratedRoot);
  for (const source of sourceFiles()) {
    const file = relative(manuscriptRoot, source);
    let content = readFileSync(source, 'utf8');
    for (const [key, value] of Object.entries(values))
      content = content.replaceAll(`{{${key}}}`, value);
    content = content.replaceAll('output/figures/', '../figures/');
    writeFileSync(resolve(hydratedRoot, file), content, 'utf8');
  }
}

function labelsIn(content: string): string[] {
  return [...content.matchAll(/\{#([A-Za-z0-9:_-]+)\}/g)].flatMap(match =>
    match[1] ? [match[1]] : []
  );
}

function validateManuscript(): void {
  const evidencePath = resolve(evidenceRoot, 'runtime.json');
  if (!existsSync(evidencePath)) throw new Error('Evidence is missing');
  const allSource = sourceFiles()
    .map(file => readFileSync(file, 'utf8'))
    .join('\n');
  const hydratedFiles = chapters.map(file => resolve(hydratedRoot, file));
  if (hydratedFiles.some(file => !existsSync(file)))
    throw new Error('Hydrated manuscript is incomplete');
  const hydrated = hydratedFiles.map(file => readFileSync(file, 'utf8')).join('\n');
  const violations: string[] = [];
  const labels = labelsIn(allSource);
  const duplicates = labels.filter((label, index) => labels.indexOf(label) !== index);
  if (duplicates.length > 0)
    violations.push(`duplicate labels: ${[...new Set(duplicates)].join(', ')}`);
  if (/\\(?:ref|eqref)\{/.test(allSource)) violations.push('raw LaTeX reference macro found');
  if (/\{\{[A-Z0-9_]+\}\}/.test(hydrated)) violations.push('unresolved hydrated token found');
  const sourceTokens = [...allSource.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].flatMap(match =>
    match[1] ? [match[1]] : []
  );
  const allowedTokens = new Set([
    'RELEASE_DATE',
    'EVIDENCE_TEST_COUNT',
    'EVIDENCE_UNIT_FILES',
    'EVIDENCE_LINK_COUNT',
    'EVIDENCE_COMPLETED_STATUS',
    'EVIDENCE_TOTAL_TOKENS',
    'EVIDENCE_COST_USD',
    'EVIDENCE_STATE_REVISION',
    'EVIDENCE_EVENT_DELIVERIES',
  ]);
  for (const token of sourceTokens)
    if (!allowedTokens.has(token)) violations.push(`unknown token ${token}`);
  const bib = readFileSync(resolve(manuscriptRoot, 'references.bib'), 'utf8');
  const citationKeys = new Set(
    [...bib.matchAll(/^@\w+\{([^,]+),/gm)].flatMap(match => (match[1] ? [match[1]] : []))
  );
  for (const match of allSource.matchAll(/\[@([^\]]+)\]/g)) {
    for (const key of (match[1] ?? '')
      .split(';')
      .map(value => value.trim().replace(/^@/, ''))
      .filter(Boolean)) {
      if (/^(sec|eq|fig|tbl):/.test(key)) {
        if (!labels.includes(key)) violations.push(`missing label ${key}`);
      } else if (!citationKeys.has(key)) {
        violations.push(`missing citation key ${key}`);
      }
    }
  }
  for (const figure of figures) {
    if (!existsSync(resolve(manuscriptRoot, 'figures', `${figure}.mmd`)))
      violations.push(`missing figure source ${figure}`);
    if (!existsSync(resolve(figureRoot, `${figure}.png`)))
      violations.push(`missing figure asset ${figure}`);
  }
  if (violations.length > 0)
    throw new Error(`Manuscript validation failed:\n${violations.join('\n')}`);
}

function render(): void {
  const inputFiles = chapters.map(file => resolve(hydratedRoot, file));
  const metadata = resolve(hydratedRoot, 'config.yaml');
  const html = resolve(outputRoot, 'noorg-manuscript.html');
  const pdf = resolve(outputRoot, 'noorg-manuscript.pdf');
  const common = [
    '--from=markdown+yaml_metadata_block+tex_math_dollars',
    `--metadata-file=${metadata}`,
    '--filter=pandoc-crossref',
    '--citeproc',
    '--standalone',
    '--resource-path',
    `${hydratedRoot}:${figureRoot}`,
  ];
  execFileSync('pandoc', [...common, '--mathjax', ...inputFiles, '-o', html], {
    cwd: root,
    stdio: 'pipe',
  });
  execFileSync(
    'pandoc',
    [
      ...common,
      '--pdf-engine=xelatex',
      `--include-in-header=${resolve(manuscriptRoot, 'preamble.md')}`,
      ...inputFiles,
      '-o',
      pdf,
    ],
    { cwd: root, stdio: 'pipe' }
  );
}

function writeChecksums(): void {
  writeFileSync(
    resolve(outputRoot, 'provenance.json'),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim(),
        commands: [
          'manuscript:evidence',
          'manuscript:figures',
          'manuscript:hydrate',
          'manuscript:validate',
          'manuscript:render',
        ],
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  const files: string[] = [];
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name !== 'checksums.sha256') files.push(path);
    }
  };
  walk(outputRoot);
  const lines = files
    .sort()
    .map(
      file =>
        `${createHash('sha256').update(readFileSync(file)).digest('hex')}  ${relative(outputRoot, file)}`
    );
  writeFileSync(resolve(outputRoot, 'checksums.sha256'), `${lines.join('\n')}\n`, 'utf8');
}

async function runCheck(): Promise<void> {
  rmSync(outputRoot, { recursive: true, force: true });
  try {
    await collectEvidence();
    renderFigures();
    hydrate();
    validateManuscript();
    render();
    inspectRendered();
    writeChecksums();
  } catch (error) {
    rmSync(outputRoot, { recursive: true, force: true });
    throw error;
  }
}

function inspectRendered(): void {
  const html = readFileSync(resolve(outputRoot, 'noorg-manuscript.html'), 'utf8');
  if (/\{\{|\[\?/.test(html))
    throw new Error('Rendered HTML contains unresolved tokens or references');
  if (existsSync(resolve(outputRoot, 'noorg-manuscript.pdf'))) {
    execFileSync('pdftotext', [resolve(outputRoot, 'noorg-manuscript.pdf'), '-'], {
      cwd: root,
      stdio: 'pipe',
    });
  }
}

async function main(): Promise<void> {
  const command = process.argv[2];
  switch (command) {
    case 'evidence':
      await collectEvidence();
      break;
    case 'figures':
      renderFigures();
      break;
    case 'hydrate':
      hydrate();
      break;
    case 'validate':
      validateManuscript();
      break;
    case 'render':
      render();
      break;
    case 'check':
      await runCheck();
      break;
    default:
      throw new Error('Usage: manuscript.ts evidence|figures|hydrate|validate|render|check');
  }
}

void main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
