import { NotFoundError } from '@deventure/service-kit';

const INTERNAL_SEGMENT = /\/internal(\/|$)/i;

function decodePathOrKeepRaw(rawPath) {
  try {
    return decodeURIComponent(rawPath);
  } catch (_malformedPathError) {
    return rawPath;
  }
}

export function blockInternal(req, _res, next) {
  const decodedPath = decodePathOrKeepRaw(req.path);
  if (INTERNAL_SEGMENT.test(req.path) || INTERNAL_SEGMENT.test(decodedPath)) {
    return next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.path}`));
  }
  next();
}
