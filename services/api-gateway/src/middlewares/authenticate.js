import { jwtPayloadSchema } from '@deventure/contracts';
import { UnauthorizedError } from '@deventure/service-kit';
import jwt from 'jsonwebtoken';

/** Rutas que NO piden JWT (método + ruta completa). */
export const PUBLIC_ROUTES = [
  { method: 'POST', path: '/api/auth/register' },
  { method: 'POST', path: '/api/auth/login' },
];

const isPublic = (req) =>
  PUBLIC_ROUTES.some(
    (route) => route.method === req.method && route.path === req.originalUrl.split('?')[0],
  );

/**
 * Verifica el JWT (`Authorization: Bearer <token>`, HS256) y deja `req.user = { id, role, username }`.
 * Sin token, token inválido o vencido → 401 UNAUTHORIZED.
 * @param {string} secret JWT_SECRET
 */
export function authenticate(secret) {
  return (req, _res, next) => {
    if (req.method === 'OPTIONS' || isPublic(req)) return next();

    const [scheme, token] = (req.get('authorization') ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) return next(new UnauthorizedError());

    try {
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
      const payload = jwtPayloadSchema.parse(decoded);
      req.user = { id: payload.sub, role: payload.role, username: payload.username };
      next();
    } catch (err) {
      const message = err?.name === 'TokenExpiredError' ? 'La sesión expiró' : 'No autorizado';
      next(new UnauthorizedError(message));
    }
  };
}
