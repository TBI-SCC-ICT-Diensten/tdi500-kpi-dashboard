import {
  kpiStatusToSemantic,
  STATUS_TINT_BG_CLASSES,
  STATUS_ICON_CLASSES,
} from '../../theme/statusColors';
import { ICON_PATHS } from '../../theme/statusIcons';
import type { KpiStatus } from '../../types/heatpump';

/**
 * KpiStatusIcon — de KPI-status-indicator uit KpiOverviewPanel (vijfde
 * puur-Tailwind component, #172-sjabloon; de status-familie-CLOSER). Rendert
 * één KpiStatus als tint-chip met status-icoon: een tint-SURFACE
 * (STATUS_TINT_BG_CLASSES — achtergrond-only, bg-*-100 licht / 15%-alpha donker)
 * die een inline SVG-icoon host (gevuld pad uit statusIcons.ts, currentColor),
 * gekleurd met de levendige -600 (STATUS_ICON_CLASSES, modus-invariant).
 *
 * LEAVES-ONLY: alléén deze status-leaf migreert. De MUI Card/Grid/Divider-shell,
 * de sectiekop, de neutrale Typography én de linker accent-rand van de Card
 * (nog STATUS_COLORS-hex via sx) blijven MUI — uitgesteld naar de
 * shared-primitives-migratie.
 *
 * KpiStatus (good/warning/critical) buckett via kpiStatusToSemantic (gesloten
 * drietal, géén offline — als de factorscore). Styling via seam-literals
 * (JIT-veto), géén @mui/*.
 *
 * DARK is de winst: de oude chip hardcodeerde `success.light` #DCFCE7 modus-BLIND
 * (een fel lichtgroen vlak op donker); STATUS_TINT_BG_CLASSES geeft nu de nette
 * dark:bg-*-600/15 (subtiele 15%-tint) — consistent met StatusPill/ErrorCodeRow
 * na de dark-unificatie. Licht = strikte no-op (bg-*-100 = de oude `*.light`);
 * dark = de correcte tint.
 *
 * Iconen zijn de GEVULDE set uit statusIcons.ts (good→check-circle,
 * warning→driehoek, critical→error-cirkel) — was outline in de MUI-versie,
 * nu één iconentaal over alle migraties.
 */

interface Props {
  status: KpiStatus;
}

const KpiStatusIcon = ({ status }: Props) => {
  const semantic = kpiStatusToSemantic(status);

  return (
    <span
      data-semantic={semantic}
      className={`inline-flex items-center rounded px-1.5 py-0.5 ${STATUS_TINT_BG_CLASSES[semantic]}`}
    >
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        focusable="false"
        className={`shrink-0 ${STATUS_ICON_CLASSES[semantic]}`}
      >
        <path d={ICON_PATHS[semantic]} />
      </svg>
    </span>
  );
};

export default KpiStatusIcon;
