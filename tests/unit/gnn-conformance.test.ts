import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const script = resolve(__dirname, '../../scripts/gnn-conformance.py');

// Loads the hyphen-named script as a module and runs main() against a fixture `gnn`
// package whose type checker returns TYPE_CHECK_RESULT. No network, no pip.
const harness = `
import importlib.util, json, os, sys
from pathlib import Path
spec = importlib.util.spec_from_file_location("gnn_conformance", sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.ROOT = Path(os.environ["FAKE_ROOT"])
module.verify_dependencies = lambda: None
module.install_parser = lambda pin: None
if os.environ["WITH_SKETCH"] == "0":
    module.urllib.request.urlretrieve = lambda url, target: Path(target).write_text("## GNNSection\\nX\\n")
module.main()
`;

function fixturePackage(root: string, typeCheckResult: string, version: string): void {
  const pkg = join(root, 'fixture', 'gnn');
  mkdirSync(join(pkg, 'parsers'), { recursive: true });
  mkdirSync(join(pkg, 'type_checker'), { recursive: true });
  writeFileSync(join(pkg, '__init__.py'), `__version__ = ${JSON.stringify(version)}\n`);
  writeFileSync(join(pkg, 'parsers', '__init__.py'), '');
  writeFileSync(
    join(pkg, 'parsers', 'basic.py'),
    [
      'class _Parsed:',
      '    parse_errors = []',
      'def parse_gnn_formal(path):',
      '    return _Parsed()',
      'def validate_gnn_syntax(text, is_content=False):',
      '    assert is_content is True, "is_content=True required"',
      '    return True, []',
      '',
    ].join('\n')
  );
  writeFileSync(
    join(pkg, 'type_checker', '__init__.py'),
    `class GNNTypeChecker:\n    def validate_gnn_files(self, *args, **kwargs):\n        return ${typeCheckResult}\n`
  );
}

function run(typeCheckResult: string, withSketch: boolean) {
  const root = mkdtempSync(join(tmpdir(), 'noorg-gnn-'));
  try {
    const pin = JSON.parse(
      readFileSync(resolve(__dirname, '../../.github/gnn-pin.json'), 'utf8')
    ) as { tag: string };
    fixturePackage(root, typeCheckResult, pin.tag.replace(/^v/, ''));
    if (withSketch) writeFileSync(join(root, 'model.gnn.md'), '## GNNSection\nX\n');
    return spawnSync('python3', ['-B', '-c', harness, script], {
      encoding: 'utf8',
      env: {
        PATH: process.env.PATH ?? '',
        PYTHONPATH: join(root, 'fixture'),
        FAKE_ROOT: root,
        WITH_SKETCH: withSketch ? '1' : '0',
      },
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe('scripts/gnn-conformance.py', () => {
  it.each(['2', 'False', 'None'])('fails closed when the type checker returns %s', value => {
    const result = run(value, true);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`returned ${value}`);
    expect(result.stdout).not.toContain('"result"');
  });

  it('fails closed on the pinned exemplar path too', () => {
    const result = run('2', false);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('did not pass the pinned exemplar');
    expect(result.stdout).not.toContain('"result"');
  });

  it('labels a repository-sketch pass as repository content', () => {
    const result = run('True', true);
    expect(result.status).toBe(0);
    const receipt = JSON.parse(result.stdout) as Record<string, unknown>;
    expect(receipt).toMatchObject({
      source: 'repository',
      scope: 'repository sketches',
      result: 'repository-content-passed',
    });
  });

  it('labels an exemplar-only pass as a baseline, not a repository pass', () => {
    const result = run('True', false);
    expect(result.status).toBe(0);
    const receipt = JSON.parse(result.stdout) as Record<string, unknown>;
    expect(receipt).toMatchObject({
      source: 'pinned-exemplar',
      scope: 'pinned GNN exemplar baseline',
      result: 'pinned-exemplar-baseline-passed',
    });
  });
});
