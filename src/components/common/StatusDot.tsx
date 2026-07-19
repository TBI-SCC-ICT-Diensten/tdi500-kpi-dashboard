import { pumpStatusToSemantic, STATUS_DOT_CLASSES } from '../../theme/statusColors';
import type { HeatPumpStatus } from '../../types/heatpump';

/**
 * StatusDot — kale statusstip (derde puur-Tailwind component, #172-sjabloon).
 * De dot-only vorm van de statusweergave: geen icoon, geen label, geen tint —
 * een solide semantische kleur (STATUS_DOT_CLASSES; modus-invariant behalve
 * de neutrale offline-stip). Status→semantiek via de seam
 * (pumpStatusToSemantic) — zelfde bron als StatusPill, nul duplicatie.
 */

interface Props {
  status: HeatPumpStatus;
}

const StatusDot = ({ status }: Props) => (
  <span
    data-status={status}
    className={`inline-block h-2 w-2 shrink-0 rounded-full ${STATUS_DOT_CLASSES[pumpStatusToSemantic(status)]}`}
  />
);

export default StatusDot;
