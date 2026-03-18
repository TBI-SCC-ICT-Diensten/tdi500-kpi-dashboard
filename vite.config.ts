import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    define[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins: [react()],
    server: { port: 3000 },
    define,
    test: {
      globals: true,
      environment: 'jsdom',
    },
  };
});
