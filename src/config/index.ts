export const config = {
  api: {
    baseUrl: process.env.REACT_APP_HUPIE_API_URL || '',
    apiKey: process.env.REACT_APP_HUPIE_API_KEY || '',
    timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
  },
} as const;

if (!config.api.baseUrl || !config.api.apiKey) {
  console.warn(
    '[TDI500] Missing API configuration. Set REACT_APP_HUPIE_API_URL and REACT_APP_HUPIE_API_KEY in .env'
  );
}