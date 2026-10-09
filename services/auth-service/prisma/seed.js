import { SEED_USER_IDS } from '@deventure/contracts';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Usuarios de desarrollo con ids FIJOS (ver @deventure/contracts/fixtures.js).
// Se puede correr muchas veces: hace upsert y no duplica.
const prisma = new PrismaClient();

const users = [
  {
    id: SEED_USER_IDS.admin,
    username: 'admin',
    email: 'admin@deventure.dev',
    role: 'admin',
    introSeen: true,
    password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234',
  },
  {
    id: SEED_USER_IDS.demo,
    username: 'demo',
    email: 'demo@deventure.dev',
    role: 'player',
    introSeen: true,
    password: process.env.SEED_DEMO_PASSWORD ?? 'Demo1234',
  },
];

async function main() {
  for (const { password, ...user } of users) {
    const passwordHash = await bcrypt.hash(password, 10);
    const data = { ...user, usernameLower: user.username.toLowerCase(), passwordHash };
    await prisma.user.upsert({ where: { id: user.id }, update: data, create: data });
  }
  // eslint-disable-next-line no-console
  console.log(`Seed auth: ${users.map((u) => u.username).join(', ')}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
