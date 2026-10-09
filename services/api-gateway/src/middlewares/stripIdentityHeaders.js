/** Headers que SOLO puede poner el gateway. Si vienen del cliente se borran (no se pueden falsificar). */
export const TRUSTED_HEADERS = ['x-user-id', 'x-user-role', 'x-user-name', 'x-internal-token'];

export function stripIdentityHeaders(req, _res, next) {
  for (const header of TRUSTED_HEADERS) delete req.headers[header];
  next();
}
