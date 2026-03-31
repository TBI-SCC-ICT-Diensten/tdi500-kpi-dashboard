export const config = {
  api: {
    baseUrl: import.meta.env.VITE_HUPIE_API_URL ?? '',
    apiKey: import.meta.env.VITE_HUPIE_API_KEY ?? '',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },
} as const;

if (!config.api.baseUrl || !config.api.apiKey) {
  console.warn(
    '[TDI500] Missing API configuration. Set VITE_HUPIE_API_URL and VITE_HUPIE_API_KEY in .env'
  );
}
