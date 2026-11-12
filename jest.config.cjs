/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['clover', 'json', 'json-summary', 'lcov', 'text'],
  coverageThreshold: {
    global: { lines: 90, branches: 80 },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  detectOpenHandles: true,
  testTimeout: 10000
};
