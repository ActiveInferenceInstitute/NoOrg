/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: { lines: 90, branches: 80 },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  detectOpenHandles: true,
  testTimeout: 10000
};
