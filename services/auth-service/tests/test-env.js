// Variables de entorno de los tests. La base de test es SEPARADA de la de desarrollo (se borra
// en cada corrida). Se puede cambiar con TEST_DATABASE_URL.
export const TEST_ENV = {
  NODE_ENV: 'test',
  DATABASE_URL:
    process.env.TEST_DATABASE_URL ??
    'postgresql://deventure:deventure@localhost:5432/auth_db_test?schema=public',
  JWT_SECRET: 'test-secret-de-al-menos-32-caracteres-xx',
  JWT_EXPIRES_IN: '24h',
  BCRYPT_ROUNDS: '4',
};
