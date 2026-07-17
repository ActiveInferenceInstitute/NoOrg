export type LogFields = Readonly<Record<string, unknown>>;

export interface Logger {
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
}

function write(level: string, message: string, fields?: LogFields): void {
  const record = { timestamp: new Date().toISOString(), level, message, ...(fields ?? {}) };
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
    this.entries.push({ level: 'info', message, ...(fields === undefined ? {} : { fields }) });
  }

  public warn(message: string, fields?: LogFields): void {
    this.entries.push({ level: 'warn', message, ...(fields === undefined ? {} : { fields }) });
  }

  public error(message: string, fields?: LogFields): void {
    this.entries.push({ level: 'error', message, ...(fields === undefined ? {} : { fields }) });
  }
}
