/**
 * Inregel command value ranges (Hupie SET). Single source of truth shared by the
 * write-path validation (heatPumpCommandService.validateRange) and the command UI
 * (HeatPumpCommandPanel), so the bounds cannot drift between logic and display.
 */
export const COMMAND_RANGES = {
  /** Temperatuur setpoint (°C). */
  setpoint: { min: 10, max: 30 },
  /** Stooklijn basiswaarde / aanvoertemperatuur (°C). */
  curveBase: { min: 20, max: 60 },
  /** Stooklijn helling (Hupie-conventie, negatief). */
  curveSlope: { min: -4.0, max: -0.1 },
} as const;
