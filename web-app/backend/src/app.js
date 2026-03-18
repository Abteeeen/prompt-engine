import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { publicLimiter, generateLimiter, authLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { optionalAuth } from './middleware/auth.js';

import templateRoutes from './routes/templates.js';
import formRoutes from './routes/forms.js';
import promptRoutes from './routes/prompts.js';
import qualityRoutes from './routes/qualityScore.js';
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';

const app = express();
app.set('trust proxy', 1);

// ── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    return callback(null, true);
  },
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '64kb' }));

// ── Attach user from token if present (all routes) ──────────────────────────
app.use(optionalAuth);

// ── Root route ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ 
  message: 'Prompt Engine API is live.', 
  version: '1.0.0',
  documentation: 'Check /health for status' 
}));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/templates', publicLimiter, templateRoutes);
app.use('/api/forms', publicLimiter, formRoutes);
app.use('/api/prompts', generateLimiter, promptRoutes);
app.use('/api/quality-score', generateLimiter, qualityRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', authLimiter, authRoutes);   // /api/users/profile shares auth router
app.use('/api/analytics', publicLimiter, analyticsRoutes);
app.use('/api/ai', generateLimiter, aiRoutes);

// ── 404 + Error handling ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
