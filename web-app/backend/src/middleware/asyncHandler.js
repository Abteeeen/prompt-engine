/**
 * Express 4 does not forward rejected promises from async handlers to the
 * error middleware; an unhandled rejection takes the whole process down.
 * Wrap every async route with this.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/** Create an error with an HTTP status and a stable machine-readable code. */
export class HttpError extends Error {
  constructor(status, message, code = undefined, extra = undefined) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}
