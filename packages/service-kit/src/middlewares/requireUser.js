import { ForbiddenError, UnauthorizedError } from '../errors.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROLES = new Set(['player', 'admin']);

/**
 * Lee el usuario que el api-gateway ya autenticó (headers `x-user-id` y `x-user-role`) y lo deja
 * en `req.user = { id, role }`. Los servicios NO validan el JWT: confían en el gateway, que borra
 * esos headers si vienen del cliente. Si faltan o son inválidos → 401.
 */
export function requireUser(req, _res, next) {
  const id = req.get('x-user-id');
  const role = req.get('x-user-role');
  if (!id || !UUID.test(id) || !ROLES.has(role)) {
    return next(new UnauthorizedError());
  }
  req.user = { id, role };
  next();
}

/**
 * Exige un rol. Usar después de `requireUser`.
 * @param {...('player'|'admin')} roles
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError());
    next();
  };
}
