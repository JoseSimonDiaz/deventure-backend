import { execSync } from 'node:child_process';
import { TEST_ENV } from './test-env.js';

/** Antes de todos los tests: aplica las migraciones a la base de test (la crea si no existe). */
export default function setup() {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, ...TEST_ENV },
    stdio: 'pipe',
  });
}
