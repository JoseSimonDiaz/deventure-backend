/**
 * Error base de la API. Todo error que se lance con esta clase (o sus hijas) se responde como
 * `{ "error": { "code", "message", "details" } }` con el status HTTP correspondiente.
 */
export class AppError extends Error {
  /**
   * @param {string} message Mensaje para el cliente (en español).
   * @param {{ status?: number, code?: string, details?: unknown }} [options]
   */
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** 400 · datos inválidos. */
export class ValidationError extends AppError {
  constructor(message = 'Datos inválidos', { code = 'VALIDATION_ERROR', details } = {}) {
    super(message, { status: 400, code, details });
  }
}

/** 401 · falta autenticación o es inválida. */
export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado', { code = 'UNAUTHORIZED', details } = {}) {
    super(message, { status: 401, code, details });
  }
}

/** 403 · autenticado pero sin permiso. */
export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado', { code = 'FORBIDDEN', details } = {}) {
    super(message, { status: 403, code, details });
  }
}

/** 404 · recurso inexistente. */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', { code = 'NOT_FOUND', details } = {}) {
    super(message, { status: 404, code, details });
  }
}

/** 409 · conflicto con el estado actual (ej. username ya usado). */
export class ConflictError extends AppError {
  constructor(message = 'Conflicto', { code = 'CONFLICT', details } = {}) {
    super(message, { status: 409, code, details });
  }
}

/** 423 · recurso bloqueado (ej. cuenta bloqueada por intentos fallidos). */
export class LockedError extends AppError {
  constructor(message = 'Recurso bloqueado', { code = 'LOCKED', details } = {}) {
    super(message, { status: 423, code, details });
  }
}

/** 503 · dependencia caída (base de datos u otro servicio). */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Servicio no disponible', { code = 'SERVICE_UNAVAILABLE', details } = {}) {
    super(message, { status: 503, code, details });
  }
}
