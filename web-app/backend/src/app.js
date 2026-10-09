import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { config } from './config.js';
import { publicLimiter, generateLimiter, authLimiter, writeLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { optionalAuth } from './middleware/auth.js';
import { hasDatabase, isDatabaseHealthy } from './models/database.js';
import { configuredProviders } from './services/llm/providers.js';
import logger from './utils/logger.js';

import templateRoutes from './routes/templates.js';
import formRoutes from './routes/forms.js';
import promptRoutes from './routes/prompts.js';
import qualityRoutes from './routes/qualityScore.js';
import authRoutes from './routes/auth.js';
import usageRoutes from './routes/usage.js';
import generationRoutes from './routes/generations.js';
import profileRoutes from './routes/profile.js';
import feedbackRoutes from './routes/feedback.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// ── Request id + access log ──────────────────────────────────────────────────
app.use((req, res, next) => {
  req.id = req.headers['x-request-id']?.toString().slice(0, 64) || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  const started = Date.now();
  res.on('finish', () => {
    if (req.path === '/health') return;
    logger.info('request', { id: req.id, method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - started, user: req.user?.id });
  });
  next();
});

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── CORS: only the configured frontend origins ───────────────────────────────
app.use(cors({
  origin(origin, callback) {
    // Non-browser clients (curl, server-to-server) send no Origin header.
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.includes(origin)) return callback(null, true);
    if (!config.isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: false,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 600,
}));

app.use(express.json({ limit: '128kb' }));
app.use(optionalAuth);

// ── Root + health ────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ name: 'Prompt Engine API', version: '2.0.0', health: '/health' }));

app.get('/health', (req, res) => {
  const providers = configuredProviders();
  const ok = (!hasDatabase || isDatabaseHealthy()) && providers.length > 0;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    database: !hasDatabase ? 'not_configured' : (isDatabaseHealthy() ? 'ok' : 'unreachable'),
    providers: providers.length,
    ts: new Date().toISOString(),
  });
});

// ── API ──────────────────────────────────────────────────────────────────────
app.use('/api/templates',     publicLimiter,   templateRoutes);
app.use('/api/forms',         publicLimiter,   formRoutes);
app.use('/api/quality-score', publicLimiter,   qualityRoutes);
app.use('/api/auth',          authLimiter,     authRoutes);
app.use('/api/usage',         publicLimiter,   usageRoutes);
app.use('/api/generations',   publicLimiter,   generationRoutes);
app.use('/api/profile',       writeLimiter,    profileRoutes);
app.use('/api/feedback',      writeLimiter,    feedbackRoutes);
app.use('/api/analytics',     publicLimiter,   analyticsRoutes);
app.use('/api/prompts',       writeLimiter,    promptRoutes);
app.use('/api/ai',            generateLimiter, aiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
