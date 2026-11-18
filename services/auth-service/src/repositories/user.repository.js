import { prisma } from '../db.js';

const PUBLIC_USER_SELECT = Object.freeze({
  id: true,
  username: true,
  email: true,
  role: true,
  introSeen: true,
  avatarBase: true,
  avatarRewardId: true,
  createdAt: true,
  sessionVersion: true,
});

export const userRepository = {
  findPublicById(userId) {
    return prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_SELECT });
  },

  findByUsernameOrEmail({ usernameLower, email }) {
    return prisma.user.findFirst({
      where: { OR: [{ usernameLower }, { email }] },
      select: { usernameLower: true, email: true },
    });
  },

  findWithPasswordById(userId) {
    return prisma.user.findUnique({ where: { id: userId }, omit: { passwordHash: false } });
  },

  findSettings(userId) {
    return prisma.user.findUnique({ where: { id: userId }, select: { settings: true } });
  },

  async mergeSettings(userId, settingsPatch) {
    const [updatedUser] = await prisma.$queryRaw`
      UPDATE users
         SET settings = settings || ${JSON.stringify(settingsPatch)}::jsonb,
             updated_at = now()
       WHERE id = ${userId}::uuid
      RETURNING settings
    `;
    return updatedUser;
  },

  updatePasswordAndRevokeSessions(userId, passwordHash) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash, sessionVersion: { increment: 1 } },
      select: PUBLIC_USER_SELECT,
    });
  },

  findSessionVersion(userId) {
    return prisma.user.findUnique({ where: { id: userId }, select: { sessionVersion: true } });
  },

  deleteById(userId) {
    return prisma.user.delete({ where: { id: userId }, select: { id: true } });
  },

  async countUsers({ from, to, activeSince }) {
    const [userStats] = await prisma.$queryRaw`
      SELECT
        count(*) FILTER (WHERE role = 'player')::int AS "totalUsers",
        count(*) FILTER (WHERE role = 'player' AND created_at BETWEEN ${from} AND ${to})::int
          AS "newUsers",
        count(*) FILTER (WHERE role = 'player' AND last_login_at >= ${activeSince})::int
          AS "activeUsers7d"
      FROM users
    `;
    return userStats;
  },

  findForLogin(identifier) {
    const normalizedIdentifier = identifier.toLowerCase();
    const where = normalizedIdentifier.includes('@')
      ? { email: normalizedIdentifier }
      : { usernameLower: normalizedIdentifier };
    return prisma.user.findUnique({ where, omit: { passwordHash: false } });
  },

  createPublic(userData) {
    return prisma.user.create({ data: userData, select: PUBLIC_USER_SELECT });
  },

  updatePublic(userId, userData) {
    return prisma.user.update({
      where: { id: userId },
      data: userData,
      select: PUBLIC_USER_SELECT,
    });
  },

  updateLoginAttempts(userId, loginAttemptsData) {
    return prisma.user.update({
      where: { id: userId },
      data: loginAttemptsData,
      select: { id: true },
    });
  },
};
