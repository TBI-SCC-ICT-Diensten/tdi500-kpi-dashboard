import type { StatusSemantic } from './statusColors';

/**
 * Status-iconen (Material-paden, 24×24 viewBox) voor gemigreerde
 * Tailwind-componenten — inline SVG's op `currentColor`, zodat componenten
 * MUI-vrij blijven (het Material-icoonpakket sleept SvgIcon + Emotion mee).
 * Eigen module (geen export vanuit een component-bestand): houdt
 * react-refresh/only-export-components schoon en deelt de paden tussen
 * StatusPill, ErrorCodeRow en toekomstige migraties.
 */
export const ICON_PATHS: Record<StatusSemantic, string> = {
  // check-circle
  healthy:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  // waarschuwingsdriehoek
  warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  // error-cirkel
  danger:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  // slash-cirkel (geblokkeerd/offline)
  offline:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z',
};
