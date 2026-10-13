export const TEST_ENV = {
  NODE_ENV: 'test',
  DATABASE_URL:
    process.env.TEST_DATABASE_URL ??
    'postgresql://deventure:deventure@localhost:5432/auth_db_test?schema=public',
  JWT_SECRET: 'test-secret-de-al-menos-32-caracteres-xx',
  JWT_EXPIRES_IN: '24h',
  BCRYPT_ROUNDS: '4',
};
