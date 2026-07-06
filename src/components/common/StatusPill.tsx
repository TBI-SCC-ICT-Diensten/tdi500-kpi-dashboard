import { statusClasses, type StatusSemantic } from '../../theme/statusColors';

/**
 * StatusPill — eerste puur-Tailwind component (patroonzetter van de
 * MUI→Tailwind-migratie). Rendert een pompstatus als pil met icoon + label
 * (J2: status-kleur is de levendige success-ramp, nooit het accent-sage;
 * altijd icoon+label gepaard).
 *
 * Migratieregels die dit component voorbeeldig maakt:
 *  - GEEN @mui/*-imports — iconen zijn inline SVG's op `currentColor`, zodat
 *    ze de tekstkleur van het tint-paar erven.
 *  - Styling komt via de seam (statusClasses in theme/statusColors.ts) als
 *    volledige class-literals — nooit dynamisch samengesteld (JIT-veto).
 *  - Tint-paar (-100/-800 licht, 600/15 + -300 donker); de `dark:`-varianten
 *    slapen tot de dark-unificatie een `dark`-class op <html> zet.
 */

export type PumpStatus = 'active' | 'warning' | 'error' | 'offline' | 'unknown';

const SEMANTIC: Record<PumpStatus, StatusSemantic> = {
  active: 'healthy',
  warning: 'warning',
  error: 'danger',
  offline: 'offline',
  unknown: 'offline', // eigen label, zelfde neutrale styling als offline
};

const LABEL: Record<PumpStatus, string> = {
  active: 'Gezond',
  warning: 'Waarschuwing',
  error: 'Storing',
  offline: 'Offline',
  unknown: 'Onbekend',
};

/** 12px-iconen (Material-paden), inline zodat het component MUI-vrij blijft. */
const ICON_PATHS: Record<StatusSemantic, string> = {
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

interface Props {
  status: PumpStatus;
}

const StatusPill = ({ status }: Props) => {
  const semantic = SEMANTIC[status];
  return (
    <span
      data-status={status}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-bold ${statusClasses(semantic)}`}
    >
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="currentColor"
        focusable="false"
      >
        <path d={ICON_PATHS[semantic]} />
      </svg>
      {LABEL[status]}
    </span>
  );
};

export default StatusPill;
