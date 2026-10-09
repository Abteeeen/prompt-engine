import { HttpError } from './asyncHandler.js';

/**
 * validate({ body?, query?, params? }) — each a zod schema.
 * Replaces req.body / req.query / req.params with the parsed (and stripped) value.
 */
export function validate(schemas) {
  return (req, res, next) => {
    for (const key of ['params', 'query', 'body']) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key] ?? {});
      if (!result.success) {
        const first = result.error.issues[0];
        const where = first.path.length ? `${first.path.join('.')}: ` : '';
        return next(new HttpError(400, `${where}${first.message}`, 'VALIDATION_ERROR'));
      }
      req[key] = result.data;
    }
    next();
  };
}
