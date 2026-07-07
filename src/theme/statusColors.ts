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
 * Vaste patronen (kies bewust, zie tailwind.config.js):
 *   • TINT-PAAR (pills/badges/rijen met tintvlak): licht `bg-*-100 text-*-800`,
 *     donker `dark:bg-*-600/15 dark:text-*-300` → STATUS_PILL_CLASSES.
 *   • TINT-SURFACE (tintvlak dat een GRAPHIC host, géén tekst): enkel de
 *     achtergrond — `bg-*-100` licht / `dark:bg-*-600/15` donker, zónder
 *     tekststap → STATUS_TINT_BG_CLASSES. Onderscheiden van het tint-PAAR: de
 *     host is een icoon met eigen -600 (STATUS_ICON_CLASSES), dus de -800-
 *     tekststap zou hier dood zijn — één representatie = precies wat ze zegt.
 *   • TEXT-SAFE (kleine status-TEKST op een kaal vlak, ≤0.7rem, zónder tint):
 *     de `-700`-stap — de mains halen AA niet op wit bij die grootte
 *     → STATUS_TEXT_SAFE_CLASSES.
 *   • ACCENT-RAND (3px linker-rand op een tintvlak) → STATUS_ACCENT_BORDER_CLASSES.
 *   • SOLIDE CHIP (gevuld vlak in de main-kleur, witte tekst)
 *     → STATUS_SOLID_CHIP_CLASSES.
 *   • SOLIDE DOT (kale statusstip, geen tekst) → STATUS_DOT_CLASSES — NIET de
 *     chip-representatie hergebruiken: die is op wit-tekst-contrast afgestemd
 *     (offline dónkerder in dark), een stip moet juist lichter in dark.
 *   • SOLIDE ICON (kaal status-icoon, inline SVG op currentColor, op een kaal
 *     vlak) → STATUS_ICON_CLASSES — de levendige main-stap (-600), net als de
 *     dot MODUS-INVARIANT.
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

/** TINT-SURFACE: enkel de tint-ACHTERGROND (géén tekststap) voor een vlak dat
 *  een GRAPHIC host — een status-icoon dat zijn eigen levendige -600 draagt
 *  (STATUS_ICON_CLASSES). Onderscheid met STATUS_PILL_CLASSES (het tint-PAAR:
 *  achtergrond + -800-tekst, bedoeld voor TEKST op de tint): hier zou de
 *  tekststap dood zijn, dus die is er niet — seam-eerlijkheid, elke
 *  representatie betekent precies wat ze zegt. Licht de -100-tint (= de oude
 *  MUI `*.light` #DCFCE7/#FEF3C7/#FEE2E2 exact), donker de 15%-alpha main (net
 *  als het tint-paar). Offline volgt de neutrale slate/overlay-rolmap. Eerste
 *  (en enige) consument: KpiStatusIcon — de icoon-tintchip. */
export const STATUS_TINT_BG_CLASSES: Record<StatusSemantic, string> = {
  healthy: 'bg-success-100 dark:bg-success-600/15',
  warning: 'bg-warning-100 dark:bg-warning-600/15',
  danger:  'bg-danger-100 dark:bg-danger-600/15',
  offline: 'bg-slate-100 dark:bg-overlay-10',
};

/** TEXT-SAFE: kleine status-tekst op een kaal vlak (≤0.7rem) — de `-700`-stap
 *  haalt wél AA op wit; donker de `-300`-stap. Eerste consument: de
 *  oplostermijn-chip in ErrorCodeRow. */
export const STATUS_TEXT_SAFE_CLASSES: Record<StatusSemantic, string> = {
  healthy: 'text-success-700 dark:text-success-300',
  warning: 'text-warning-700 dark:text-warning-300',
  danger:  'text-danger-700 dark:text-danger-300',
  offline: 'text-slate-600 dark:text-slate-400',
};

/** ACCENT-RAND: de 3px linker-rand (`border-l-3`) op een tint-rij. */
export const STATUS_ACCENT_BORDER_CLASSES: Record<StatusSemantic, string> = {
  healthy: 'border-success-600',
  warning: 'border-warning-600',
  danger:  'border-danger-600',
  offline: 'border-slate-400 dark:border-slate-600',
};

/** SOLIDE CHIP: gevuld vlak in de main-kleur met witte tekst. */
export const STATUS_SOLID_CHIP_CLASSES: Record<StatusSemantic, string> = {
  healthy: 'bg-success-600 text-white',
  warning: 'bg-warning-600 text-white',
  danger:  'bg-danger-600 text-white',
  offline: 'bg-slate-400 dark:bg-slate-600 text-white',
};

/** Ernst-bucketing (storingen) → status-semantiek. Ernst is een OPEN
 *  vocabulaire (types/heatpump.ts) — alles buiten de bekende niveaus valt
 *  bewust in de neutrale 'offline'-tier, zoals getSeveritySx altijd deed. */
export const severityToSemantic = (severity: string): StatusSemantic => {
  const s = severity.toLowerCase();
  if (s === 'critical' || s === 'high' || s === 'error') return 'danger';
  if (s === 'warning') return 'warning';
  return 'offline';
};

/** SOLIDE DOT: kale statusstip in de main-kleur. Semantische stippen zijn
 *  MODUS-INVARIANT (levendig -600 leest op licht én donker); alleen de
 *  neutrale offline-stip wordt lichter in dark (slate-400) voor zichtbaarheid
 *  op het donkere vlak. Slate is stock-Tailwind (heeft -400/-500). */
export const STATUS_DOT_CLASSES: Record<StatusSemantic, string> = {
  healthy: 'bg-success-600',
  warning: 'bg-warning-600',
  danger:  'bg-danger-600',
  offline: 'bg-slate-500 dark:bg-slate-400',
};

/** SOLIDE ICON: kaal status-icoon (inline SVG op currentColor) op een kaal
 *  vlak — de levendige main-stap (-600, via de tekstkleur → currentColor).
 *  MODUS-INVARIANT net als de dot (levendig -600 leest op licht én donker);
 *  alleen de neutrale offline-tier wordt lichter in dark. Onderscheid met
 *  TEXT-SAFE (-700, kleine TEKST) en de tint-tekst (-800, op tintvlak): een
 *  ~18px-icoon is een grafisch element (WCAG 3:1-drempel), dus de levendige
 *  -600 mag. Eerste consument: DecisionFactorRow; KpiOverviewPanel's StatusIcon
 *  hergebruikt 'm later. */
export const STATUS_ICON_CLASSES: Record<StatusSemantic, string> = {
  healthy: 'text-success-600',
  warning: 'text-warning-600',
  danger:  'text-danger-600',
  offline: 'text-slate-500 dark:text-slate-400',
};

/** Pompstatus → status-semantiek — één bron van waarheid, geconsumeerd door
 *  StatusPill én StatusDot. De default-tak vangt offline/unknown én eventuele
 *  onbekende runtime-waarden (het oude `?? '#4B5563'`-fallbackgedrag). */
export const pumpStatusToSemantic = (
  status: 'active' | 'warning' | 'error' | 'offline' | 'unknown'
): StatusSemantic => {
  switch (status) {
    case 'active': return 'healthy';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    default: return 'offline';
  }
};

/** Beslis-factorscore → status-semantiek. De factorscore (types/decision.ts)
 *  is een GESLOTEN drietal (good/acceptable/poor) — géén offline-tier, anders
 *  dan de pomp- en ernst-bucketers. Geconsumeerd door DecisionFactorRow:
 *  good→healthy, acceptable→warning, poor→danger. */
export const decisionScoreToSemantic = (
  score: 'good' | 'acceptable' | 'poor'
): StatusSemantic => {
  switch (score) {
    case 'good': return 'healthy';
    case 'acceptable': return 'warning';
    default: return 'danger'; // poor
  }
};

/** KPI-status → status-semantiek. De KPI-status (types/heatpump.ts) is een
 *  GESLOTEN drietal (good/warning/critical) — géén offline-tier, net als de
 *  factorscore en anders dan de pomp-/ernst-bucketers. Geconsumeerd door
 *  KpiStatusIcon: good→healthy, warning→warning, critical→danger. Sluit de
 *  status-familie — alle statusweergaven (pil/rij/stip/factor/kpi) lezen nu
 *  uit deze ene seam. */
export const kpiStatusToSemantic = (
  status: 'good' | 'warning' | 'critical'
): StatusSemantic => {
  switch (status) {
    case 'good': return 'healthy';
    case 'warning': return 'warning';
    default: return 'danger'; // critical
  }
};
