/**
 * Canonieke status → kleur-tokens (DUP-1: één bron van waarheid).
 *
 * PROVISIONELE WAARDEN — deze hexcodes zijn de HUIDIGE app-kleuren, letterlijk
 * overgenomen uit de verspreide view-laag-literals, zodat deze consolidatie een
 * strikte no-op is (nul visuele verandering). Zodra het design system de
 * officiële TDI 500 + TNO merk-tokens levert, worden de waarden ALLEEN in deze
 * map vervangen — elke view leest al hiervandaan.
 *
 * Eén bron, geen concurrerende tweede palette: `theme.ts` consumeert dezelfde
 * constantes voor `palette.success/warning/error.main` (zie theme.ts), dus de
 * MUI-theme en deze map lopen niet uiteen.
 *
 * BEKENDE AFWIJKINGEN (bewust NIET geünificeerd in deze no-op PR — te beslissen
 * mét de merkwaarden):
 *   • DecisionSupportCard gebruikt een gedempt/donkerder triadje
 *     (#3b6d11 / #ba7517 / #a32d2d) i.p.v. healthy/warning/danger.
 *   • DashboardPage gebruikt voor offline/unknown `#4B5563` (grijs-600) i.p.v.
 *     de canonieke `#6B7280` (grijs-500) hieronder.
 *   Zie de PR-omschrijving: "welke waarde is canoniek?" is een opvolgbeslissing.
 */
export const STATUS_COLORS = {
  /** gezond / good / active / success */
  healthy: '#16A34A',
  /** waarschuwing / acceptabel */
  warning: '#D97706',
  /** storing / fout / kritiek / danger */
  danger: '#DC2626',
  /** offline / onbekend — neutraal grijs */
  offline: '#6B7280',
  /** geen data — neutraal (momenteel hetzelfde grijs als offline) */
  noData: '#6B7280',
} as const;

export type StatusColorKey = keyof typeof STATUS_COLORS;
