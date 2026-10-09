import { z } from 'zod';

/** Id de cualquier entidad (todas las tablas usan uuid). */
export const idSchema = z.string().uuid();

/** `?page=1&limit=20` (limit máximo 50). */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/** Forma de TODAS las respuestas de error de la API. */
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

/**
 * Envuelve un esquema en la forma de respuesta exitosa `{ data: ... }`.
 * @template {z.ZodTypeAny} T
 * @param {T} schema
 */
export const dataResponse = (schema) => z.object({ data: schema });

/** @typedef {z.infer<typeof paginationSchema>} Pagination */
/** @typedef {z.infer<typeof errorResponseSchema>} ErrorResponse */
