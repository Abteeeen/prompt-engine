import 'dotenv/config';
import { config, assertProductionReady } from './config.js';
import app from './app.js';
import { hasDatabase, testConnection, closeDatabase } from './models/database.js';
import { runMigrations } from './models/migrate.js';
import { loadTemplates } from './services/TemplateService.js';
import { configuredProviders } from './services/llm/providers.js';
import { seedExemplars } from './services/KnowledgeService.js';
import { embeddingModelId } from './services/llm/embeddings.js';
import logger from './utils/logger.js';

async function start() {
  if (config.isProd) assertProductionReady();

  if (hasDatabase) {
    await testConnection();
    if (process.env.AUTO_MIGRATE !== 'false') {
      const r = await runMigrations();
      if (r.ran.length) logger.info(`Applied ${r.ran.length} migration(s)`);
    }
  } else {
    logger.warn('DATABASE_URL not set: running without a database (sign-in, library and history disabled; quotas kept in memory)');
  }

  if (hasDatabase) {
    await seedExemplars().catch(err => logger.warn('Seeding exemplars failed', { error: err.message }));
    logger.info(`Retrieval: keyword search${embeddingModelId() ? ` + vectors (${embeddingModelId()})` : ' only (set CF_ACCOUNT_ID/CF_API_TOKEN or GEMINI_API_KEY for semantic search)'}`);
  }

  const templates = loadTemplates();
  logger.info(`Templates ready: ${templates.length} loaded`);

  const providers = configuredProviders();
  if (providers.length === 0) {
    logger.error('No LLM provider configured. Set at least one *_API_KEY (see .env.example). Generation will return 503.');
  } else {
    logger.info(`LLM providers in order: ${providers.join(' -> ')}`);
  }

  const server = app.listen(config.PORT, () => {
    logger.info(`Server listening on port ${config.PORT} (${config.NODE_ENV})`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => { await closeDatabase(); process.exit(0); });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { error: reason instanceof Error ? reason.message : String(reason) });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception, exiting', { error: err.message, stack: err.stack });
  process.exit(1);
});

start().catch((err) => {
  logger.error('Startup failed', { error: err.message });
  process.exit(1);
});
