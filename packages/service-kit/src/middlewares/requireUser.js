import { ForbiddenError, UnauthorizedError } from '../errors.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROLES = new Set(['player', 'admin']);

export function requireUser(req, _res, next) {
  const id = req.get('x-user-id');
  const role = req.get('x-user-role');
  if (!id || !UUID.test(id) || !ROLES.has(role)) {
    return next(new UnauthorizedError());
  }
  req.user = { id, role };
  next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError());
    next();
  };
}
