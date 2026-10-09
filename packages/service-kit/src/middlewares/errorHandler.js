import { ZodError } from 'zod';
import { AppError } from '../errors.js';

/**
 * @param {import('express').Response} res
 * @param {number} status
 * @param {string} code
 * @param {string} message
 * @param {unknown} [details]
 */
function send(res, status, code, message, details) {
  const error = { code, message };
  if (details !== undefined) error.details = details;
  res.status(status).json({ error });
}

/** Handler para rutas inexistentes (va antes del errorHandler). */
export function notFoundHandler(req, res) {
  send(res, 404, 'NOT_FOUND', `Ruta no encontrada: ${req.method} ${req.path}`);
}

/**
 * Último middleware de la app. Traduce cualquier error al formato
 * `{ "error": { "code", "message", "details" } }`. Nunca expone el stack trace.
 */
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return send(res, err.status, err.code, err.message, err.details);
  }

  if (err instanceof ZodError || err?.name === 'ZodError') {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return send(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', details);
  }

  // Errores de express.json()
  if (err?.type === 'entity.parse.failed') {
    return send(res, 400, 'INVALID_JSON', 'El cuerpo del pedido no es un JSON válido');
  }
  if (err?.type === 'entity.too.large') {
    return send(res, 413, 'PAYLOAD_TOO_LARGE', 'El cuerpo del pedido es demasiado grande');
  }

  // Errores conocidos de Prisma
  if (err?.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return send(res, 409, 'CONFLICT', 'El recurso ya existe', { fields: err.meta?.target });
    }
    if (err.code === 'P2025') {
      return send(res, 404, 'NOT_FOUND', 'Recurso no encontrado');
    }
  }

  (req.log ?? console).error({ err }, 'Error no controlado');
  return send(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}
