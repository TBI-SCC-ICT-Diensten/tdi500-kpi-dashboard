import { defineConfig } from 'vitest/config';

// Self-contained test config for the Functions project (node env — no jsdom).
// Handler unit/integration tests import the pure handlers and mock global fetch;
// they never hit live Hupie/BAG/EP.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
