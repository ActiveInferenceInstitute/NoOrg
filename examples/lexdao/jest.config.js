/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testTimeout: 30000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  errorOnDeprecated: true,
  maxWorkers: '50%',
  cache: true,
  collectCoverage: true,
  coverageProvider: 'v8',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      }
    }
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ]
};
