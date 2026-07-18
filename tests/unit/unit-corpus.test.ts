import { UnitCorpus } from '../../src/content/unit-corpus';
import {
  computeUnitManifest,
  diffUnitManifests,
  parseUnitManifest,
} from '../../src/content/unit-manifest';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('UnitCorpus', () => {
  it('verifies the reviewed manifest and preserves document provenance', async () => {
    const corpus = new UnitCorpus();
    await expect(corpus.manifest()).resolves.toEqual(
      expect.objectContaining({ manifestVersion: 1, fileCount: 1816, linkCount: 4593 })
    );
    const document = await corpus.get('Administration/Charter.md');
    expect(document.provenance.manifestSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(document.content).toContain('#');
  });

  it('rejects path traversal and searches only Markdown content', async () => {
    const corpus = new UnitCorpus();
    await expect(corpus.get('../README.md')).rejects.toMatchObject({ code: 'UNIT_PATH_INVALID' });
    await expect(corpus.get('missing.md')).rejects.toMatchObject({ code: 'UNIT_NOT_FOUND' });
    await expect(corpus.search('')).rejects.toMatchObject({ code: 'INVALID_UNIT_QUERY' });
    await expect(corpus.search('charter', 0)).rejects.toMatchObject({ code: 'INVALID_UNIT_QUERY' });
    await expect(corpus.search('charter', 1)).resolves.toHaveLength(1);
    await expect(
      new UnitCorpus({ maxDocumentBytes: 1 }).get('Administration/Charter.md')
    ).rejects.toMatchObject({
      code: 'UNIT_DOCUMENT_TOO_LARGE',
    });
  });

  it('computes, parses, and diffs per-file integrity manifests', async () => {
    const root = await mkdtemp(join(tmpdir(), 'noorg-manifest-'));
    try {
      await mkdir(join(root, 'nested'));
      await writeFile(join(root, 'a.md'), '# A');
      await writeFile(join(root, 'nested', 'b.md'), '# B');
      const original = computeUnitManifest(root);
      expect(parseUnitManifest(original)).toEqual(original);
      await writeFile(join(root, 'a.md'), '# Changed');
      await writeFile(join(root, 'c.md'), '# C');
      const changed = computeUnitManifest(root);
      expect(diffUnitManifests(original, changed)).toEqual({
        added: ['c.md'],
        removed: [],
        changed: ['a.md'],
      });
      expect(() => parseUnitManifest(null)).toThrow('Invalid unit manifest');
      expect(() => parseUnitManifest({ ...original, files: { 'a.md': 'bad' } })).toThrow(
        'Invalid unit manifest file digest'
      );
      expect(() => parseUnitManifest({ ...original, fileCount: original.fileCount + 1 })).toThrow(
        'file count'
      );
      expect(await readFile(join(root, 'a.md'), 'utf8')).toContain('Changed');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
