import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HttpError } from './asyncHandler.js';

const JWT_ALGS = ['HS256'];

export function signToken(user) {
  if (!config.JWT_SECRET) throw new HttpError(503, 'Sign-in is not configured on this server.', 'AUTH_NOT_CONFIGURED');
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, plan: user.plan || 'free', role: user.role || 'user' },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN, algorithm: 'HS256' }
  );
}

function readToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token || !config.JWT_SECRET) return null;
  try {
    const payload = jwt.verify(token, config.JWT_SECRET, { algorithms: JWT_ALGS });
    return { id: payload.sub || payload.id, email: payload.email, name: payload.name, plan: payload.plan || 'free', role: payload.role || 'user' };
  } catch {
    return null;
  }
}

/** Attach req.user when a valid token is present; never blocks. */
export function optionalAuth(req, _res, next) {
  const user = readToken(req);
  if (user) req.user = user;
  next();
}

/** Require a valid token. */
export function requireAuth(req, _res, next) {
  const user = req.user || readToken(req);
  if (!user) return next(new HttpError(401, 'Sign in to continue.', 'UNAUTHENTICATED'));
  req.user = user;
  next();
}

/** Require admin role (from the token, or ADMIN_EMAILS). Use after requireAuth. */
export function requireAdmin(req, _res, next) {
  const isAdmin = req.user?.role === 'admin' || (req.user?.email && config.adminEmails.includes(req.user.email.toLowerCase()));
  if (!isAdmin) return next(new HttpError(403, 'Admin access required.', 'FORBIDDEN'));
  next();
}

/** Stable identity for quota: user id, else the browser session id, else the IP. */
export function actorKey(req) {
  if (req.user?.id) return `user:${req.user.id}`;
  const sid = req.headers['x-session-id'];
  if (typeof sid === 'string' && /^[A-Za-z0-9_-]{6,100}$/.test(sid)) return `session:${sid}`;
  return `ip:${req.ip}`;
}
