import { ZodError } from 'zod';
import { AppError } from '../errors.js';
import { logger } from '../logger.js';

const PRISMA_KNOWN_ERRORS = new Map([
  ['P2002', { status: 409, code: 'CONFLICT', message: 'El recurso ya existe' }],
  ['P2025', { status: 404, code: 'NOT_FOUND', message: 'Recurso no encontrado' }],
]);

const BODY_PARSER_ERRORS = new Map([
  [
    'entity.parse.failed',
    { status: 400, code: 'INVALID_JSON', message: 'El cuerpo del pedido no es un JSON válido' },
  ],
  [
    'entity.too.large',
    {
      status: 413,
      code: 'PAYLOAD_TOO_LARGE',
      message: 'El cuerpo del pedido es demasiado grande',
    },
  ],
]);

function sendError(res, { status, code, message, details }) {
  res.status(status).json({ error: { code, message, details } });
}

export function notFoundHandler(req, res) {
  sendError(res, {
    status: 404,
    code: 'NOT_FOUND',
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
}

const isPrismaKnownError = (error) =>
  error?.name === 'PrismaClientKnownRequestError' && PRISMA_KNOWN_ERRORS.has(error.code);

export function errorHandler(error, req, res, _next) {
  if (error instanceof AppError) {
    return sendError(res, error);
  }

  if (error instanceof ZodError || error?.name === 'ZodError') {
    return sendError(res, {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
      details: error.flatten().fieldErrors,
    });
  }

  if (BODY_PARSER_ERRORS.has(error?.type)) {
    return sendError(res, BODY_PARSER_ERRORS.get(error.type));
  }

  if (isPrismaKnownError(error)) {
    return sendError(res, {
      ...PRISMA_KNOWN_ERRORS.get(error.code),
      details: error.meta?.target ? { fields: error.meta.target } : undefined,
    });
  }

  (req.log ?? logger).error({ err: error }, 'Error no controlado');
  return sendError(res, {
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'Error interno del servidor',
  });
}
