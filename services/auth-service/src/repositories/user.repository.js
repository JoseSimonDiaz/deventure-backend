import { prisma } from '../db.js';

const PUBLIC_USER_SELECT = Object.freeze({
  id: true,
  username: true,
  email: true,
  role: true,
  introSeen: true,
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
