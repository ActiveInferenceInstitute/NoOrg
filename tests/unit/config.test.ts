import { loadConfig } from '../../src/config/config';
import { resolve } from 'node:path';

describe('configuration', () => {
  it('loads a local profile without a provider key', () => {
    const config = loadConfig({
      NODE_ENV: 'test',
      NOORG_LLM_PROVIDER: 'local',
      NOORG_METRICS_ENABLED: 'false',
    });
    expect(config.provider).toBe('local');
    expect(config.metricsEnabled).toBe(false);
  });

  it('requires credentials for the live provider', () => {
    expect(() => loadConfig({ NODE_ENV: 'production', NOORG_LLM_PROVIDER: 'openai' })).toThrow(
      'OPENAI_API_KEY'
    );
  });

  it('requires an explicit provider profile', () => {
    expect(() => loadConfig({ NODE_ENV: 'test' })).toThrow('NOORG_LLM_PROVIDER');
  });

  it('rejects runtime state paths inside source trees', () => {
    expect(() =>
      loadConfig({
        NODE_ENV: 'test',
        NOORG_LLM_PROVIDER: 'local',
        NOORG_STATE_PATH: 'src/state.json',
      })
    ).toThrow('outside source');
  });

  it('parses booleans without accepting arbitrary text', () => {
    expect(() =>
      loadConfig({
        NODE_ENV: 'test',
        NOORG_LLM_PROVIDER: 'local',
        NOORG_METRICS_ENABLED: 'yes',
      })
    ).toThrow('NOORG_METRICS_ENABLED');
  });

  it('rejects invalid numeric settings', () => {
    expect(() => loadConfig({ NODE_ENV: 'test', NOORG_PORT: 'not-a-port' })).toThrow('NOORG_PORT');
    expect(() =>
      loadConfig({
        NODE_ENV: 'test',
        NOORG_LLM_PROVIDER: 'local',
        NOORG_MAX_WORKFLOW_DEPTH: '65',
      })
    ).toThrow('NOORG_MAX_WORKFLOW_DEPTH');
  });

  it('uses a loopback development host and requires production API authentication', () => {
    expect(loadConfig({ NODE_ENV: 'test', NOORG_LLM_PROVIDER: 'local' }).server.host).toBe(
      '127.0.0.1'
    );
    expect(() => loadConfig({ NODE_ENV: 'production', NOORG_LLM_PROVIDER: 'local' })).toThrow(
      'NOORG_HTTP_AUTH_TOKEN'
    );
    expect(
      loadConfig({
        NODE_ENV: 'production',
        NOORG_LLM_PROVIDER: 'local',
        NOORG_HTTP_AUTH_TOKEN: 'secret',
      }).server.host
    ).toBe('0.0.0.0');
  });

  it('loads provider governance and configured agent modules', () => {
    expect(
      loadConfig({
        NODE_ENV: 'test',
        NOORG_LLM_PROVIDER: 'local',
        NOORG_PROVIDER_BUDGET_USD: '5',
        NOORG_AGENT_MODULES: 'a.js, b.js',
        NOORG_AGENT_MODULE_TRUSTED_SHA256: 'a.js=' + 'a'.repeat(64),
        NOORG_MAX_WORKFLOW_DEPTH: '8',
      })
    ).toEqual(
      expect.objectContaining({
        providerGovernance: expect.objectContaining({ budgetUsd: 5 }),
        agentModules: ['a.js', 'b.js'],
        agentModuleDigests: expect.objectContaining({
          [resolve('a.js')]: 'a'.repeat(64),
        }),
        maxWorkflowDepth: 8,
      })
    );
    expect(() =>
      loadConfig({
        NODE_ENV: 'test',
        NOORG_LLM_PROVIDER: 'local',
        NOORG_AGENT_MODULE_TRUSTED_SHA256: 'a.js=invalid',
      })
    ).toThrow('path=64-character-sha256');
  });
});
