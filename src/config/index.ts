export const config = {
  api: {
    // The client calls the server-side proxy (api/hupie.ts), which holds the
    // Hupie URL + token. The key is no longer read in the browser (VV-26).
    baseUrl: '/api/hupie',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    detailTimeout: 30000,
  },
} as const;
