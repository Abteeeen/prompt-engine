import logger from '../utils/logger.js';
import { config } from '../config.js';

/**
 * Global error handler. Registered last. Never leaks provider or database
 * error text to clients in production; the request id lets you find it in logs.
 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || (err.type === 'entity.too.large' ? 413 : 500);
  const code = err.code && typeof err.code === 'string' && /^[A-Z_]+$/.test(err.code) ? err.code : undefined;

  if (status >= 500 && !code) {
    logger.error('Unhandled error', {
      requestId: req.id, method: req.method, path: req.path, status,
      error: err.message, stack: config.isProd ? undefined : err.stack,
    });
  } else if (status !== 404) {
    logger.warn('Request error', { requestId: req.id, method: req.method, path: req.path, status, error: err.message });
  }

  const publicMessage = status >= 500 && config.isProd
    ? 'Something went wrong on our side. Please try again.'
    : (err.message || 'Request failed');

  res.status(status).json({
    error: publicMessage,
    ...(code && { code }),
    ...(err.extra && typeof err.extra === 'object' ? err.extra : {}),
    requestId: req.id,
  });
}

export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}`, code: 'NOT_FOUND' });
}
