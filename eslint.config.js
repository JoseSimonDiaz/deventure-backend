import deventure from '@deventure/eslint-config';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      '**/prisma/migrations/**',
      'Dev-venture/**',
      '.claude/**',
    ],
  },
  ...deventure,
];
