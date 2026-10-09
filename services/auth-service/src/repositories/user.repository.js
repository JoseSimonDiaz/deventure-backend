import { prisma } from '../db.js';

/** Acceso a la tabla `users`. Es la ÚNICA capa que usa Prisma directamente. */
export const userRepository = {
  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  /** Devuelve qué dato ya está en uso (username sin mayúsculas o email), o null. */
  findTaken({ usernameLower, email }) {
    return prisma.user.findFirst({
      where: { OR: [{ usernameLower }, { email }] },
      select: { usernameLower: true, email: true },
    });
  },

  /** Busca por email (si tiene @) o por username. Incluye passwordHash para verificar. */
  findForLogin(identifier) {
    const value = identifier.toLowerCase();
    const where = value.includes('@') ? { email: value } : { usernameLower: value };
    return prisma.user.findUnique({ where, omit: { passwordHash: false } });
  },

  create(data) {
    return prisma.user.create({ data });
  },

  update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },
};
