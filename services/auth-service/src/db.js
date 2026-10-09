import { PrismaClient } from '@prisma/client';

/**
 * Único PrismaClient del servicio. `passwordHash` se omite en TODAS las consultas por defecto;
 * solo el login lo pide explícitamente (`omit: { passwordHash: false }`).
 */
export const prisma = new PrismaClient({
  omit: { user: { passwordHash: true } },
});
