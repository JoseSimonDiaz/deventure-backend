import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./tests/contract/migrateTestDatabase.js'],
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'postgresql://deventure:deventure@localhost:5432/postgres?schema=progress_test',
      INTERNAL_TOKEN: 'test-internal-token',
    },
  },
});
