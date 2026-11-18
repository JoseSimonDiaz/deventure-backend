import { jwtPayloadSchema } from '@deventure/contracts';
import { UnauthorizedError } from '@deventure/service-kit';
import jwt from 'jsonwebtoken';

export const PUBLIC_ROUTES = new Set(['POST /api/auth/register', 'POST /api/auth/login']);

const BEARER_SCHEME = 'Bearer';
const JWT_ALGORITHMS = ['HS256'];
const EXPIRED_TOKEN_ERROR_NAME = 'TokenExpiredError';
const PREFLIGHT_METHOD = 'OPTIONS';

const isPublicRoute = (req) => {
  const [pathWithoutQuery] = req.originalUrl.split('?');
  return PUBLIC_ROUTES.has(`${req.method} ${pathWithoutQuery}`);
};

function readBearerToken(req) {
  const [scheme, token] = (req.get('authorization') ?? '').split(' ');
  if (scheme !== BEARER_SCHEME || !token) throw new UnauthorizedError();
  return token;
}

function verifyToken(token, secret) {
  try {
    return jwtPayloadSchema.parse(jwt.verify(token, secret, { algorithms: JWT_ALGORITHMS }));
  } catch (verificationError) {
    const isExpired = verificationError.name === EXPIRED_TOKEN_ERROR_NAME;
    throw new UnauthorizedError(isExpired ? 'La sesión expiró' : 'No autorizado');
  }
}

export function authenticate({ secret, assertSessionIsCurrent }) {
  return async (req, _res, next) => {
    if (req.method === PREFLIGHT_METHOD || isPublicRoute(req)) return next();

    const tokenPayload = verifyToken(readBearerToken(req), secret);
    await assertSessionIsCurrent({
      userId: tokenPayload.sub,
      tokenVersion: tokenPayload.ver,
      correlationId: req.correlationId,
    });
    req.user = { id: tokenPayload.sub, role: tokenPayload.role, username: tokenPayload.username };
    next();
  };
}
