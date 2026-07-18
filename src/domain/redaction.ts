import type { JsonValue } from './types';

const sensitiveKey = /(api[_-]?key|authorization|cookie|credential|password|secret|token)/i;
const sensitiveText =
  /((?:api[_-]?key|authorization|credential|password|secret|token)\s*[:=]\s*(?:bearer\s+)?|bearer\s+)([^\s,;]+)/gi;

export function redactText(value: string): string {
  return value.replace(sensitiveText, '$1[REDACTED]');
}

export function redactUnknown(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: redactText(value.message) };
  }
  if (typeof value === 'string') return redactText(value);
  if (Array.isArray(value)) return value.map(redactUnknown);
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        sensitiveKey.test(key) ? '[REDACTED]' : redactUnknown(nested),
      ])
    );
  }
  return value;
}

export function redactJsonValue(value: JsonValue): JsonValue {
  return redactUnknown(value) as JsonValue;
}
