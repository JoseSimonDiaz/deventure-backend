import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup-env.js'],
    globalSetup: ['./tests/global-setup.js'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: ['src/index.js'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
