import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** Config compartida de ESLint (flat config) para todo el monorepo. */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'warn',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
    },
  },
  {
    files: ['**/tests/**/*.js', '**/*.test.js', '**/vitest.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.vitest } },
  },
  {
    files: ['apps/web/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.browser } },
  },
  prettier,
];
