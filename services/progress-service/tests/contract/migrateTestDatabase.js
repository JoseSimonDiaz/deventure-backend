import { execSync } from 'node:child_process';

export default function migrateTestDatabase(project) {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: project.config.env.DATABASE_URL },
    stdio: 'ignore',
  });
}
