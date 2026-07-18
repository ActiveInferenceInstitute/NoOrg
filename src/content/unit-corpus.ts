import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { NoOrgError } from '../domain/errors';
import { computeUnitManifest, parseUnitManifest, type UnitManifest } from './unit-manifest';

export interface UnitDocument {
  readonly path: string;
  readonly content: string;
  readonly sha256: string;
  readonly provenance: {
    readonly sourceRoot: string;
    readonly manifestSha256: string;
  };
}

export interface UnitCorpusOptions {
  readonly root?: string;
  readonly maxDocumentBytes?: number;
}

export class UnitCorpus {
  private readonly root: string;
  private readonly maxDocumentBytes: number;
  private loadedManifest?: UnitManifest;
  private allowedPaths?: Set<string>;
  private readonly documentDigests = new Map<string, string>();

  public constructor(options: UnitCorpusOptions = {}) {
    this.root = resolve(options.root ?? resolve(process.cwd(), 'units'));
    this.maxDocumentBytes = options.maxDocumentBytes ?? 1_048_576;
    if (this.maxDocumentBytes < 1)
      throw new NoOrgError('INVALID_UNIT_LIMIT', 'Unit document limit must be positive');
  }

  public async manifest(): Promise<UnitManifest> {
    await this.ensureLoaded();
    return { ...this.loadedManifest!, files: { ...this.loadedManifest!.files } };
  }

  public async list(): Promise<string[]> {
    await this.ensureLoaded();
    return [...this.allowedPaths!];
  }

  public async get(path: string): Promise<UnitDocument> {
    await this.ensureLoaded();
    const normalized = this.safePath(path);
    if (!this.allowedPaths!.has(normalized))
      throw new NoOrgError('UNIT_NOT_FOUND', `Unit document ${path} was not found`);
    const absolute = resolve(this.root, normalized);
    const buffer = await readFile(absolute);
    if (buffer.byteLength > this.maxDocumentBytes)
      throw new NoOrgError(
        'UNIT_DOCUMENT_TOO_LARGE',
        'Unit document exceeds the configured size limit'
      );
    const content = buffer.toString('utf8');
    if (this.documentDigests.get(normalized) !== digest(buffer))
      throw new NoOrgError(
        'UNIT_MANIFEST_MISMATCH',
        'Unit document changed after manifest verification'
      );
    return {
      path: normalized,
      content,
      sha256: digest(buffer),
      provenance: {
        sourceRoot: this.root,
        manifestSha256: this.loadedManifest!.contentSha256,
      },
    };
  }

  public async search(query: string, limit = 20): Promise<UnitDocument[]> {
    if (!query.trim())
      throw new NoOrgError('INVALID_UNIT_QUERY', 'Unit search query must not be empty');
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new NoOrgError('INVALID_UNIT_QUERY', 'Unit search limit must be between 1 and 100');
    const documents: UnitDocument[] = [];
    for (const path of await this.list()) {
      const document = await this.get(path);
      if (document.content.toLocaleLowerCase().includes(query.toLocaleLowerCase())) {
        documents.push(document);
        if (documents.length >= limit) break;
      }
    }
    return documents;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loadedManifest !== undefined) return;
    let raw: unknown;
    try {
      raw = JSON.parse(await readFile(resolve(this.root, 'manifest.json'), 'utf8')) as unknown;
    } catch {
      throw new NoOrgError('UNIT_MANIFEST_INVALID', 'Unit corpus manifest is missing or invalid');
    }
    let manifest: UnitManifest;
    try {
      manifest = parseUnitManifest(raw);
    } catch {
      throw new NoOrgError('UNIT_MANIFEST_INVALID', 'Unit manifest is invalid');
    }
    const computed = computeUnitManifest(this.root);
    if (
      computed.fileCount !== manifest.fileCount ||
      computed.linkCount !== manifest.linkCount ||
      computed.contentSha256 !== manifest.contentSha256 ||
      JSON.stringify(computed.files) !== JSON.stringify(manifest.files)
    )
      throw new NoOrgError('UNIT_MANIFEST_MISMATCH', 'Unit manifest does not match the corpus');
    for (const [path, hash] of Object.entries(computed.files)) this.documentDigests.set(path, hash);
    this.loadedManifest = manifest;
    this.allowedPaths = new Set(Object.keys(manifest.files).sort());
  }

  private safePath(path: string): string {
    const normalized = path.replaceAll('\\', '/');
    const absolute = resolve(this.root, normalized);
    if (
      isAbsolute(path) ||
      relative(this.root, absolute).startsWith('..') ||
      !normalized.endsWith('.md')
    )
      throw new NoOrgError('UNIT_PATH_INVALID', 'Unit paths must be relative Markdown files');
    return normalized;
  }
}

function digest(value: Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}
