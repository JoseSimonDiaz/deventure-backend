import { jwtPayloadSchema } from '@deventure/contracts';
import { UnauthorizedError } from '@deventure/service-kit';
import jwt from 'jsonwebtoken';

export const PUBLIC_ROUTES = new Set(['POST /api/auth/register', 'POST /api/auth/login']);

const isPublicRoute = (req) => {
  const [pathWithoutQuery] = req.originalUrl.split('?');
  return PUBLIC_ROUTES.has(`${req.method} ${pathWithoutQuery}`);
};

export function authenticate(secret) {
  return (req, _res, next) => {
    if (req.method === 'OPTIONS' || isPublicRoute(req)) return next();

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
