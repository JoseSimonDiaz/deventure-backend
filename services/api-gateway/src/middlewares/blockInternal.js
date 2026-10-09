import { NotFoundError } from '@deventure/service-kit';

const INTERNAL_SEGMENT = /\/internal(\/|$)/i;

/**
 * Las rutas /internal/* son solo para comunicación entre servicios: desde afuera no existen (404).
 * Se revisa la ruta cruda y la decodificada para que `%2Finternal` tampoco pase.
 */
export function blockInternal(req, _res, next) {
  let decoded = req.path;
  try {
    decoded = decodeURIComponent(req.path);
  } catch {
    // ruta mal codificada: se evalúa tal cual
  }
  if (INTERNAL_SEGMENT.test(req.path) || INTERNAL_SEGMENT.test(decoded)) {
    return next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.path}`));
  }
  next();
}
