import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseEnv, promisify } from 'node:util';
import { z } from 'zod';
import { loadConfig } from '../../src/config/config';

const runFile = promisify(execFile);

describe('Explicit configuration admission', () => {
  it('accepts the actual example without inventing provider credentials or a URL', async () => {
    const example = parseEnv(await readFile(resolve(__dirname, '../../.env.example'), 'utf8'));
    const config = loadConfig(example);
    expect(config.provider).toBe('local');
    expect(config.openai.apiKey).toBeUndefined();
    expect(config.openai.baseUrl).toBeUndefined();
    expect(config.server.authToken).toBeUndefined();
    expect(config.providerGovernance.budgetUsd).toBeUndefined();
  });

  it.each(['', '   ', '\t\n'])('treats optional blank values as absent (%j)', blank => {
    expect(loadConfig({
      NOORG_LLM_PROVIDER: 'local',
      OPENAI_API_KEY: blank,
      OPENAI_BASE_URL: blank,
      NOORG_HOST: blank,
      NOORG_HTTP_AUTH_TOKEN: blank,
      NOORG_PROVIDER_BUDGET_USD: blank,
    })).toEqual(loadConfig({ NOORG_LLM_PROVIDER: 'local' }));
  });

  it('preserves nonempty validation and explicit provider/production-auth requirements', () => {
    expect(() => loadConfig({ OPENAI_API_KEY: 'unused-test-key' })).toThrow();
    expect(() => loadConfig({ NOORG_LLM_PROVIDER: 'openai', OPENAI_API_KEY: '   ' })).toThrow();
    expect(() => loadConfig({ NOORG_LLM_PROVIDER: 'local', OPENAI_BASE_URL: 'not a URL' })).toThrow();
    expect(() => loadConfig({ NOORG_LLM_PROVIDER: 'local', NOORG_PROVIDER_BUDGET_USD: 'not a number' })).toThrow();
    expect(() => loadConfig({ NODE_ENV: 'production', NOORG_LLM_PROVIDER: 'local', NOORG_HTTP_AUTH_TOKEN: ' ' })).toThrow();
    const secured = loadConfig({ NODE_ENV: 'production', NOORG_LLM_PROVIDER: 'local', NOORG_HTTP_AUTH_TOKEN: 'test-secret' });
    expect(secured.server.authToken).toBe('test-secret');
    expect(secured.server.host).toBe('0.0.0.0');
  });

  it('loads only an explicitly supplied Node env-file and keeps inherited environment precedence', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'noorg-env-file-'));
    const envFile = join(directory, '.env');
    try {
      await writeFile(envFile, 'NOORG_LLM_PROVIDER=local\nOPENAI_MODEL=file-model\nOPENAI_API_KEY=\nOPENAI_BASE_URL=\nNOORG_HTTP_AUTH_TOKEN=\nNOORG_PROVIDER_BUDGET_USD=\n');
      const configModule = require.resolve('../../src/config/config');
      const script = `const { loadConfig } = require(${JSON.stringify(configModule)}); const config = loadConfig(process.env); process.stdout.write(JSON.stringify({ provider: config.provider, model: config.openai.model }));`;
      const result = await runFile(process.execPath, ['--env-file=' + envFile, '--import', require.resolve('tsx'), '-e', script], {
        cwd: directory,
        env: { PATH: process.env.PATH, NODE_ENV: 'test', OPENAI_MODEL: 'inherited-model' },
        timeout: 5000,
      });
      expect(z.object({ provider: z.literal('local'), model: z.string() }).parse(JSON.parse(result.stdout))).toEqual({
        provider: 'local', model: 'inherited-model',
      });
      await expect(runFile(process.execPath, ['--import', require.resolve('tsx'), '-e', script], {
        cwd: directory,
        env: { PATH: process.env.PATH, NODE_ENV: 'test' },
        timeout: 5000,
      })).rejects.toMatchObject({ code: 1 });
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
});
