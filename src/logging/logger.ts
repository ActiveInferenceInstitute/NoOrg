import { redactUnknown } from '../domain/redaction';

export type LogFields = Readonly<Record<string, unknown>>;

export interface Logger {
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
}

function write(level: string, message: string, fields?: LogFields): void {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    message: redactUnknown(message),
    ...(fields === undefined ? {} : (redactUnknown(fields) as Record<string, unknown>)),
  };
  const line = JSON.stringify(record);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export const consoleLogger: Logger = {
  info: (message, fields) => write('info', message, fields),
  warn: (message, fields) => write('warn', message, fields),
  error: (message, fields) => write('error', message, fields),
};

export class MemoryLogger implements Logger {
  public readonly entries: Array<{ level: string; message: string; fields?: LogFields }> = [];

  public info(message: string, fields?: LogFields): void {
    this.entries.push({
      level: 'info',
      message: redactUnknown(message) as string,
      ...(fields === undefined ? {} : { fields: redactUnknown(fields) as LogFields }),
    });
  }

  public warn(message: string, fields?: LogFields): void {
    this.entries.push({
      level: 'warn',
      message: redactUnknown(message) as string,
      ...(fields === undefined ? {} : { fields: redactUnknown(fields) as LogFields }),
    });
  }

  public error(message: string, fields?: LogFields): void {
    this.entries.push({
      level: 'error',
      message: redactUnknown(message) as string,
      ...(fields === undefined ? {} : { fields: redactUnknown(fields) as LogFields }),
    });
  }
}
