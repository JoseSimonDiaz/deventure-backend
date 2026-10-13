export class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos inválidos', { code = 'VALIDATION_ERROR', details } = {}) {
    super(message, { status: 400, code, details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado', { code = 'UNAUTHORIZED', details } = {}) {
    super(message, { status: 401, code, details });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado', { code = 'FORBIDDEN', details } = {}) {
    super(message, { status: 403, code, details });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', { code = 'NOT_FOUND', details } = {}) {
    super(message, { status: 404, code, details });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto', { code = 'CONFLICT', details } = {}) {
    super(message, { status: 409, code, details });
  }
}

export class LockedError extends AppError {
  constructor(message = 'Recurso bloqueado', { code = 'LOCKED', details } = {}) {
    super(message, { status: 423, code, details });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Servicio no disponible', { code = 'SERVICE_UNAVAILABLE', details } = {}) {
    super(message, { status: 503, code, details });
  }
}
