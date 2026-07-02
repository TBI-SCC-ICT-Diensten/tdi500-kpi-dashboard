import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/index.tsx',
        'src/vite-env.d.ts',
        'src/test/**',
      ],
      // Regression floor — a few points below the achieved coverage so CI fails
      // on regressions, not on noise. Raise as later PRs add tests.
      // Achieved at PR-8 (test backfill): statements 68.08, branches 51.48,
      // functions 58.77, lines 69.63 (was lines 45.79 / branches 34.9 before).
      thresholds: {
        lines:      66,
        functions:  55,
        branches:   48,
        statements: 65,
      },
    },
  },
});
