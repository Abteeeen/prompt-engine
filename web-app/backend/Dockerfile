# Prompt Engine API
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY src ./src
COPY migrations ./migrations
COPY templates ./templates

EXPOSE 3001
USER node
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:${PORT:-3001}/health || exit 1
CMD ["node", "src/server.js"]
