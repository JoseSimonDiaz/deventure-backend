import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'postgresql://deventure:deventure@localhost:5432/postgres?schema=public',
      INTERNAL_TOKEN: 'test-internal-token',
    },
  },
});
