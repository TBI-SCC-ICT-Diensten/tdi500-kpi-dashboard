/**
 * Inregel command value ranges (Hupie SET). Single source of truth shared by the
 * write-path validation (heatPumpCommandService.validateRange), the command UI
 * (HeatPumpCommandPanel), AND the server-side proxy guard (api/hupie.ts, RSEC-1).
 *
 * ⚠ BUNDLED SERVER-SIDE: the Vercel serverless function (api/hupie.ts) imports
 * COMMAND_RANGES, so this module must stay DEPENDENCY-FREE — no browser-only
 * imports (import.meta.env, MUI, DOM), or the function build breaks.
 */
export const COMMAND_RANGES = {
  /** Temperatuur setpoint (°C). */
  setpoint: { min: 10, max: 30 },
  /** Stooklijn basiswaarde / aanvoertemperatuur (°C). */
  curveBase: { min: 20, max: 60 },
  /** Stooklijn helling (Hupie-conventie, negatief). */
  curveSlope: { min: -4.0, max: -0.1 },
} as const;
