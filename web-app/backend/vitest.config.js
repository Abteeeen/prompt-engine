import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
    fileParallelism: false,   // tests mutate process.env
    testTimeout: 20000,
    env: { LOG_LEVEL: 'error' },
  },
});
