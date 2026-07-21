import { Metrics } from '../../src/metrics/metrics';

describe('Metrics', () => {
  it('ignores invalid duration observations', () => {
    const metrics = new Metrics();
    metrics.observe('task_duration_ms', Number.NaN);
    metrics.observe('task_duration_ms', -1);

    expect(metrics.renderPrometheus()).toBe('\n');
  });
});
