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
      // Baseline thresholds — set to match current coverage so CI passes
      // cleanly. These are a ratchet: when Path A adds component render
      // tests, raise these numbers so coverage cannot regress. Target
      // long-term: lines 70, branches 60.
      // Current baseline: lines 45.79, functions 36.97, branches 34.9, statements 44.48
      thresholds: {
        lines:      40,
        functions:  30,
        branches:   30,
        statements: 40,
      },
    },
  },
});
