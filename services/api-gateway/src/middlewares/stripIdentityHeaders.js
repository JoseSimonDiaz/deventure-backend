import { INTERNAL_TOKEN_HEADER } from '@deventure/service-kit';

export const USER_ID_HEADER = 'x-user-id';
export const USER_ROLE_HEADER = 'x-user-role';
export const USER_NAME_HEADER = 'x-user-name';

export function stripIdentityHeaders(req, _res, next) {
  delete req.headers[USER_ID_HEADER];
  delete req.headers[USER_ROLE_HEADER];
  delete req.headers[USER_NAME_HEADER];
  delete req.headers[INTERNAL_TOKEN_HEADER];
  next();
}
