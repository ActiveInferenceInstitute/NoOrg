import eslint from '@eslint/js';
import parser from '@typescript-eslint/parser';
import plugin from '@typescript-eslint/eslint-plugin';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
    languageOptions: {
      parser,
      parserOptions: { project: './tsconfig.test.json', tsconfigRootDir: process.cwd() },
    },
    plugins: { '@typescript-eslint': plugin },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/require-await': 'off',
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
];
