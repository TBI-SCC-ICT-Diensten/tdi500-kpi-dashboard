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
    server: {
      proxy: {
        // Dev only — production uses api/ep-online.ts serverless function
        '/ep-online': {
          target: 'https://public.ep-online.nl',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ep-online/, ''),
          headers: {
            'Authorization': env.VITE_EP_ONLINE_API_KEY ?? '',
          },
        },
        '/knmi-dataplatform': {
          target: 'https://api.dataplatform.knmi.nl',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/knmi-dataplatform/, ''),
          headers: {
            'Authorization': env.VITE_KNMI_API_KEY ?? '',
          },
        },
      },
    },
  };
});
