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
