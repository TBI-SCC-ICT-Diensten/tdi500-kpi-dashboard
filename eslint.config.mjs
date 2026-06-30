// Flat ESLint config — the project's quality gate (CFG-1).
//
// Scope: src/ and api/ only. Type-aware (typescript-eslint projectService).
// NOT wired into the build/CI yet — runnable via `npm run lint`. The findings
// this surfaces are baseline technical debt; they are fixed in later PRs
// (PR-3 dead code, PR-7 types, …), not here.
//
// Named .mjs so it loads as ESM regardless of package.json "type".
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  // Only src/ and api/ are linted; everything else is ignored.
  {
    ignores: [
      'dist/**',
      'dist-api/**',
      'coverage/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'e2e/**',
      '*.config.{js,mjs,cjs,ts}',
    ],
  },

  // Type-aware base for all application TS/TSX in src/ and api/.
  {
    files: ['src/**/*.{ts,tsx}', 'api/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Browser client code: React hooks + a11y + react-refresh.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'react-refresh': reactRefresh,
    },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Server (Vercel serverless functions): Node globals.
  {
    files: ['api/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },

  // Tests + test helpers: Node/vitest globals; type-aware rules relaxed
  // (mocks and casts are legitimate in tests).
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node } },
  },
);
