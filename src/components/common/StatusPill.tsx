import { statusClasses, type StatusSemantic } from '../../theme/statusColors';
import { ICON_PATHS } from '../../theme/statusIcons';

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
