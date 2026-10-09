import deventure from '@deventure/eslint-config';

export default [
  {
    ignores: ['**/node_modules/**', '**/coverage/**', '**/dist/**', '**/prisma/migrations/**'],
  },
  ...deventure,
];
