import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

const FORBIDDEN_ARRAY_METHODS =
  '^(map|filter|some|every|find|findIndex|findLast|findLastIndex|reduce|reduceRight|forEach|sort|toSorted|flatMap)$';

const BACKEND_RESTRICTED_SYNTAX = [
  'error',
  {
    selector: 'ForStatement, ForInStatement, ForOfStatement, WhileStatement, DoWhileStatement',
    message:
      'Sin loops en el backend: resolverlo en la base (where, upsert, groupBy, $queryRaw) o con un Map/Set.',
  },
  {
    selector: `CallExpression[callee.property.name=/${FORBIDDEN_ARRAY_METHODS}/]`,
    message:
      'Sin map/filter/some/find/reduce/forEach/sort en el backend: que la consulta devuelva la forma final, o usar un Map/Set.',
  },
  {
    selector: 'IfStatement > BlockStatement IfStatement',
    message: 'Sin if anidados: usar early return.',
  },
  {
    selector: "BinaryExpression[operator=/^[!=]==?$/] > Literal[raw='null']",
    message: 'No comparar contra null: delegar en Zod, usar Object.hasOwn o un type guard.',
  },
  {
    selector: "BinaryExpression[operator=/^[!=]==?$/] > Identifier[name='undefined']",
    message: 'No comparar contra undefined: delegar en Zod, usar Object.hasOwn o un type guard.',
  },
  {
    selector: 'BinaryExpression[operator=/^[!=]==?$/] > Literal[value=/^(true|false)$/]',
    message: "No comparar contra 'true'/'false' como string: que Zod lo convierta a boolean.",
  },
];

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'id-length': ['error', { min: 2, properties: 'never', exceptions: ['_'] }],
      'no-nested-ternary': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
    },
  },
  {
    files: ['services/**/*.js', 'packages/**/*.js'],
    ignores: ['**/tests/**', '**/*.test.js', '**/vitest.config.js'],
    rules: { 'no-restricted-syntax': BACKEND_RESTRICTED_SYNTAX },
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
