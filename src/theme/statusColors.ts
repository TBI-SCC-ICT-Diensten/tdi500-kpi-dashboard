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

/* ══════════════════════════════════════════════════════════════════════════
 * TAILWIND-REPRESENTATIE (MUI→Tailwind-migratie, coexistentie-fase)
 *
 * Zelfde bron van waarheid, tweede representatie: STATUS_COLORS (hex, hierboven)
 * blijft voor de nog-MUI consumenten; gemigreerde Tailwind-componenten consumeren
 * de class-strings hieronder. Zodra MUI verdwijnt, vervalt de hex-export en
 * convergeert deze module.
 *
 * ⚠️ JIT-VETO — ALTIJD volledige class-LITERALS. Nooit dynamisch samenstellen
 * (`bg-${naam}-100`): Tailwind's JIT genereert alleen classes die het als
 * complete literal in de bron ziet — samengestelde namen bestaan runtime
 * stilletjes NIET. Vandaar deze map met volledige strings.
 *
 * Twee vaste patronen (kies bewust, zie tailwind.config.js):
 *   • TINT-PAAR (pills/badges met tintvlak): licht `bg-*-100 text-*-800`,
 *     donker `dark:bg-*-600/15 dark:text-*-300`. Dit is wat hieronder staat.
 *   • TEXT-SAFE (kleine status-TEKST op een kaal vlak, ≤0.7rem, zónder tint):
 *     gebruik de `-700`-stap (`text-success-700` / `text-warning-700` /
 *     `text-danger-700`) — de mains halen AA niet op wit bij die grootte.
 * ════════════════════════════════════════════════════════════════════════ */

/** Semantisch statusvocabulaire — zelfde sleutels als STATUS_COLORS. */
export type StatusSemantic = 'healthy' | 'warning' | 'danger' | 'offline';

/** Tint-paar-classes per semantiek (licht + donker; donker slaapt tot de
 *  dark-unificatie een `dark`-class op <html> zet). Offline/onbekend volgt de
 *  neutrale slate/overlay-rolmap uit tailwind.config.js. */
export const STATUS_PILL_CLASSES: Record<StatusSemantic, string> = {
  healthy: 'bg-success-100 text-success-800 dark:bg-success-600/15 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-800 dark:bg-warning-600/15 dark:text-warning-300',
  danger:  'bg-danger-100 text-danger-800 dark:bg-danger-600/15 dark:text-danger-300',
  offline: 'bg-slate-100 text-slate-600 dark:bg-overlay-10 dark:text-slate-400',
};

/** Getypeerde accessor — het seam-contract voor gemigreerde componenten. */
export const statusClasses = (semantic: StatusSemantic): string =>
  STATUS_PILL_CLASSES[semantic];
