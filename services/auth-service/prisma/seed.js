import { SEED_USER_IDS } from '@deventure/contracts';
import { logger } from '@deventure/service-kit';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const SEED_BCRYPT_ROUNDS = 10;

const prisma = new PrismaClient();

const adminSeedUser = {
  id: SEED_USER_IDS.admin,
  username: 'admin',
  email: 'admin@deventure.dev',
  role: 'admin',
  introSeen: true,
  password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234',
};

const demoSeedUser = {
  id: SEED_USER_IDS.demo,
  username: 'demo',
  email: 'demo@deventure.dev',
  role: 'player',
  introSeen: true,
  password: process.env.SEED_DEMO_PASSWORD ?? 'Demo1234',
};

async function upsertSeedUser({ password, ...seedUser }) {
  const passwordHash = await bcrypt.hash(password, SEED_BCRYPT_ROUNDS);
  const userData = { ...seedUser, usernameLower: seedUser.username.toLowerCase(), passwordHash };
  await prisma.user.upsert({ where: { id: seedUser.id }, update: userData, create: userData });
}

async function seedAuthUsers() {
  await upsertSeedUser(adminSeedUser);
  await upsertSeedUser(demoSeedUser);
  logger.info(`Seed auth: ${adminSeedUser.username}, ${demoSeedUser.username}`);
}

seedAuthUsers()
  .catch((seedError) => {
    logger.error({ err: seedError }, 'Falló el seed de auth');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
