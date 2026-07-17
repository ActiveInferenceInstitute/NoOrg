import { loadConfig } from '../../src/config/config';

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
  });
});
