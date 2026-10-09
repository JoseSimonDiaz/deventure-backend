/**
 * Middleware de validación con Zod.
 * - `body` y `params` validados reemplazan a `req.body` / `req.params`.
 * - Todo lo validado queda también en `req.validated` (en Express 5 `req.query` es de solo lectura).
 * Si algo no cumple el esquema responde 400 VALIDATION_ERROR (lo traduce el errorHandler).
 *
 * @param {{ body?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny }} schemas
 * @returns {import('express').RequestHandler}
 */
export function validate(schemas) {
  return (req, _res, next) => {
    try {
      req.validated = {};
      if (schemas.params) {
        req.validated.params = schemas.params.parse(req.params);
        req.params = req.validated.params;
      }
      if (schemas.query) {
        req.validated.query = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        req.validated.body = schemas.body.parse(req.body ?? {});
        req.body = req.validated.body;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
