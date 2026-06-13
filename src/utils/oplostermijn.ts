/**
 * Oplostermijn — resolve-by horizon per storing.
 *
 * Derives a maintenance urgency ("hoe snel moet dit verholpen worden?")
 * from the severity of a storing. The resolve-by date is computed honestly
 * as detectedAt + termijn, so it has a real basis rather than being a
 * display trick.
 *
 * Pure module — no side effects. `now` is injectable so callers (and tests)
 * can be fully deterministic.
 */

/**
 * The known, finite severity levels used in the TDI 500 domain.
 * Note: ErrorCode.severity is widened to `string` (the Hupie API may
 * return values outside this set), so callers pass a raw string and we
 * normalise it here — matching the existing `.toLowerCase()` pattern in
 * dataMapper.determineStatus.
 */
export type ErrorSeverity = 'low' | 'warning' | 'high' | 'critical' | 'error';

/**
 * Voorbeeldtermijnen — configureerbaar; illustratieve standaardwaarden,
 * nog niet vastgesteld door TNO/TDI 500.
 *
 * Aantal dagen waarbinnen een storing van een gegeven ernst verholpen
 * zou moeten zijn. 0 = direct (onmiddellijk), null = geen vaste termijn.
 */
export const OPLOSTERMIJN_DAGEN: Record<ErrorSeverity, number | null> = {
  critical: 0,   // Direct — veiligheidsrelevant
  error: 0,      // gelijkgesteld aan critical (rode storing, zie determineStatus)
  high: 7,
  warning: 30,
  low: null,     // geen vaste oplostermijn
};

/** Number of milliseconds in one day. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface Oplostermijn {
  /** The severity that was passed in (echoed verbatim — may be unknown). */
  severity: string;
  /** Aantal dagen; 0 = direct, null = geen termijn. */
  termijnDagen: number | null;
  /** detectedAt + termijn, of null als niet berekenbaar. */
  resolveBy: Date | null;
  /** 'direct' = onmiddellijk, 'open' = binnen termijn, 'overschreden' = te laat. */
  status: 'direct' | 'open' | 'overschreden';
  /** Nederlandse weergavelabel. */
  label: string;
}

/**
 * Normalises a raw severity string to a known ErrorSeverity, or null
 * when it falls outside the finite set.
 */
const normaliseSeverity = (severity: string): ErrorSeverity | null => {
  const s = severity.toLowerCase();
  if (
    s === 'low' ||
    s === 'warning' ||
    s === 'high' ||
    s === 'critical' ||
    s === 'error'
  ) {
    return s;
  }
  return null;
};

/** Formats a date in Dutch long form, e.g. "20 juni 2026". */
const formatDatumNl = (date: Date): string =>
  date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/**
 * Determines the oplostermijn for a storing of the given severity.
 *
 * @param severity   raw severity string (case-insensitive)
 * @param detectedAt ISO date string of first detection (optional)
 * @param now        reference "now" — injectable for deterministic tests
 */
export function bepaalOplostermijn(
  severity: string,
  detectedAt?: string,
  now: Date = new Date()
): Oplostermijn {
  const known = normaliseSeverity(severity);
  const termijnDagen = known !== null ? OPLOSTERMIJN_DAGEN[known] : null;

  // Direct: critical/error — onmiddellijk handelen, geen datum.
  if (termijnDagen === 0) {
    return {
      severity,
      termijnDagen: 0,
      resolveBy: null,
      status: 'direct',
      label: 'Direct te verhelpen',
    };
  }

  // Geen vaste termijn (bijv. 'low' of een onbekende severity).
  if (termijnDagen === null) {
    return {
      severity,
      termijnDagen: null,
      resolveBy: null,
      status: 'open',
      label: 'Geen vaste oplostermijn',
    };
  }

  // Termijn bekend, maar geen detectiedatum: toon alleen de horizon.
  if (!detectedAt) {
    return {
      severity,
      termijnDagen,
      resolveBy: null,
      status: 'open',
      label: `Binnen ${termijnDagen} dagen`,
    };
  }

  // Bereken resolve-by uit detectedAt + termijn.
  const resolveBy = new Date(new Date(detectedAt).getTime() + termijnDagen * MS_PER_DAY);
  // Op de termijn zelf (resolveBy == now) is nog niet overschreden.
  const overschreden = resolveBy.getTime() < now.getTime();
  const datum = formatDatumNl(resolveBy);

  return {
    severity,
    termijnDagen,
    resolveBy,
    status: overschreden ? 'overschreden' : 'open',
    label: overschreden
      ? `Termijn overschreden (vóór ${datum})`
      : `Te verhelpen vóór ${datum}`,
  };
}
