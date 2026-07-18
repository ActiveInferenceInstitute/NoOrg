import { NoOrgError } from '../domain/errors';
import type { AgentDescriptor } from '../domain/types';

export function descriptor(id: string, name: string, capabilities: string[]): AgentDescriptor {
  return { id, name, capabilities, maxConcurrentTasks: 2, contractVersion: 1 };
}

export function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z0-9'-]{2,}/g) ?? [];
}

export function keyTerms(text: string): string[] {
  const counts = new Map<string, number>();
  for (const word of words(text)) counts.set(word, (counts.get(word) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([word]) => word);
}

export function textAnalysis(text: string) {
  const sentenceCount = text
    .split(/[.!?]+/)
    .map(part => part.trim())
    .filter(Boolean).length;
  return {
    wordCount: words(text).length,
    sentenceCount,
    keyTerms: keyTerms(text),
    findings: [`Input contains ${words(text).length} words across ${sentenceCount} sentences.`],
  };
}

export function narrative(text: string, operation: string) {
  const normalized = text.trim();
  return { text: `${operation}: ${normalized}`, keyPoints: keyTerms(normalized) };
}

export function recordsFromInput(input: unknown): Array<Record<string, unknown>> {
  if (
    Array.isArray(input) &&
    input.every(row => typeof row === 'object' && row !== null && !Array.isArray(row))
  )
    return input as Array<Record<string, unknown>>;
  if (typeof input === 'object' && input !== null && 'records' in input) {
    const records = (input as { records?: unknown }).records;
    if (
      Array.isArray(records) &&
      records.every(row => typeof row === 'object' && row !== null && !Array.isArray(row))
    )
      return records as Array<Record<string, unknown>>;
  }
  throw new NoOrgError(
    'INVALID_DATA_INPUT',
    'Expected an array of record objects or an object with records'
  );
}

export function dataAnalysis(input: unknown) {
  const records = recordsFromInput(input);
  const numeric = new Map<string, number[]>();
  for (const row of records) {
    for (const [key, value] of Object.entries(row)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) continue;
      const values = numeric.get(key) ?? [];
      values.push(value);
      numeric.set(key, values);
    }
  }
  const numericColumns: Record<
    string,
    { count: number; minimum: number; maximum: number; mean: number }
  > = {};
  for (const [key, values] of numeric) {
    numericColumns[key] = {
      count: values.length,
      minimum: Math.min(...values),
      maximum: Math.max(...values),
      mean: values.reduce((sum, value) => sum + value, 0) / values.length,
    };
  }
  return {
    rows: records.length,
    numericColumns,
    findings: [`Analysed ${records.length} records and ${numeric.size} numeric columns.`],
    visualizationSuggestions:
      numeric.size > 0
        ? [
            'Use a distribution plot for numeric columns.',
            'Use a comparison plot for related numeric columns.',
          ]
        : ['Use a categorical frequency table for non-numeric fields.'],
  };
}
