import {
  statusClasses,
  severityToSemantic,
  STATUS_ACCENT_BORDER_CLASSES,
  STATUS_SOLID_CHIP_CLASSES,
  STATUS_TEXT_SAFE_CLASSES,
} from '../../theme/statusColors';
import { ICON_PATHS } from '../../theme/statusIcons';
import type { ErrorCodeWithTermijn } from '../../hooks/useHeatPumpDetail';
import type { Oplostermijn } from '../../utils/oplostermijn';

/**
 * ErrorCodeRow — storingsrij (tweede puur-Tailwind component, volgt het
 * #172-sjabloon). Rendert één foutcode als tint-rij met 3px accent-rand,
 * waarschuwingsicoon (inline SVG, currentColor — erft de tint-tekstkleur),
 * code + optionele melding, de oplostermijn-chip en de solide ernst-chip.
 *
 * Ernst hergebruikt de status-semantiek via severityToSemantic (geen eigen
 * vocabulaire): critical/high/error→danger, warning→warning, rest→neutraal.
 * Styling volledig via seam-literals (JIT-veto). De oplostermijn-chip
 * gebruikt de TEXT-SAFE `-700`-stap (kleine tekst op kaal vlak); de
 * `dark:`-varianten slapen tot de dark-unificatie.
 * Tooltip is het native title-attribuut (puur leaf — geen MUI).
 */

/** Oplostermijn-status → semantiek: 'open' is waarschuwing, 'direct' en
 *  'overschreden' zijn urgent — zelfde afbeelding als het oude
 *  oplostermijnKleur, nu in seam-vocabulaire. Bewust smal getypeerd
 *  (subset van StatusSemantic): de chip-maps hoeven alleen deze twee. */
const termijnSemantic = (status: Oplostermijn['status']): 'warning' | 'danger' =>
  status === 'open' ? 'warning' : 'danger';

/** Rand van de omlijnde oplostermijn-chip — volledige literals (JIT-veto);
 *  licht de main-600-rand, donker de zachtere -500 (de status-ramps hebben
 *  géén -400-stap — 100/300/500/600/700/800). Alleen de twee semantieken die
 *  termijnSemantic kan opleveren. */
const TERMIJN_BORDER_CLASSES: Record<'warning' | 'danger', string> = {
  warning: 'border-warning-600 dark:border-warning-500',
  danger: 'border-danger-600 dark:border-danger-500',
};

interface Props {
  errorCodeWithTermijn: ErrorCodeWithTermijn;
}

const ErrorCodeRow = ({ errorCodeWithTermijn }: Props) => {
  const { errorCode: ec, termijn } = errorCodeWithTermijn;
  const semantic = severityToSemantic(ec.severity);
  const tSemantic = termijnSemantic(termijn.status);

  return (
    <div
      data-testid="pump-error-code"
      data-severity={semantic}
      className={`mb-1 flex items-start gap-1.5 rounded-r border-l-3 px-2.5 py-1.5 ${statusClasses(semantic)} ${STATUS_ACCENT_BORDER_CLASSES[semantic]}`}
    >
      <svg
        aria-hidden="true"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="currentColor"
        focusable="false"
        className="mt-0.5 shrink-0"
      >
        <path d={ICON_PATHS.warning} />
      </svg>
      <div className="min-w-0 flex-1">
        <span className="font-mono text-xs font-bold">{ec.code}</span>
        {ec.message && <span className="block text-2xs">{ec.message}</span>}
        <span
          data-testid="pump-oplostermijn"
          className={`mt-1 inline-flex items-center rounded-full border px-1.5 py-px text-2xs font-bold ${TERMIJN_BORDER_CLASSES[tSemantic]} ${STATUS_TEXT_SAFE_CLASSES[tSemantic]}`}
        >
          {termijn.label}
        </span>
      </div>
      <span
        title={`Ernst: ${ec.severity}`}
        className={`ml-auto shrink-0 rounded-full px-1.5 py-px text-2xs ${STATUS_SOLID_CHIP_CLASSES[semantic]}`}
      >
        {ec.severity}
      </span>
    </div>
  );
};

export default ErrorCodeRow;
