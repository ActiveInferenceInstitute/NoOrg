import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { openApiDocument } from '../src/http/openapi';

const path = resolve(process.cwd(), 'docs/api/openapi.json');
const expected = `${JSON.stringify(openApiDocument, null, 2)}\n`;
if (process.argv[2] === 'check') {
  if (!existsSync(path) || readFileSync(path, 'utf8') !== expected) {
    console.error('Generated OpenAPI description is stale; run npm run api:openapi');
    process.exitCode = 1;
  } else console.info('Generated OpenAPI description is current.');
} else {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, expected, 'utf8');
  console.info(`Wrote ${path}`);
}
