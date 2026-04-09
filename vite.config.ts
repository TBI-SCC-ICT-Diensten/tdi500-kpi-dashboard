import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
    ],
    define: {
      ...Object.fromEntries(
        Object.entries(env).map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])
      ),
    },
    server: {
      proxy: {
        '/ep-online': {
          target: 'https://public.ep-online.nl',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ep-online/, ''),
          headers: {
            'Authorization': `Bearer ${env.VITE_EP_ONLINE_API_KEY ?? ''}`,
          },
        },
      },
    },
  };
});
