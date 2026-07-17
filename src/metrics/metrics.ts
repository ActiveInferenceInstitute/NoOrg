export class Metrics {
  private readonly counters = new Map<string, number>();
  private readonly gauges = new Map<string, number>();
  private readonly durations = new Map<string, number[]>();

  public increment(name: string, amount = 1): void {
    this.counters.set(name, (this.counters.get(name) ?? 0) + amount);
  }

  public setGauge(name: string, value: number): void {
    this.gauges.set(name, value);
  }

  public observe(name: string, milliseconds: number): void {
    const values = this.durations.get(name) ?? [];
    values.push(milliseconds);
    if (values.length > 1000) values.shift();
    this.durations.set(name, values);
  }

  public renderPrometheus(): string {
    const lines: string[] = [];
    for (const [name, value] of this.counters) lines.push(`${safeName(name)} ${value}`);
    for (const [name, value] of this.gauges) lines.push(`${safeName(name)} ${value}`);
    for (const [name, values] of this.durations) {
      if (values.length === 0) continue;
      const total = values.reduce((sum, value) => sum + value, 0);
      lines.push(`${safeName(name)}_count ${values.length}`);
      lines.push(`${safeName(name)}_sum ${total}`);
    }
    return `${lines.join('\n')}\n`;
  }
}

function safeName(name: string): string {
  return `noorg_${name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
}
