# Migratie-playbook — MUI → Tailwind/shadcn

Het staande regelboek van de strangler-migratie van MUI naar Tailwind CSS 3.4 +
shadcn/ui. Elke migratie-PR volgt dit document; afwijken kan alleen expliciet en
gemotiveerd in de PR-tekst. De regels hieronder zijn geen theorie — elk komt uit
een geland precedent (PR-nummers erbij) en is geverifieerd tegen de huidige code.

**Kernarchitectuur (onaantastbaar zonder aparte beslissing):**

| Onderdeel | Waar | Rol |
|---|---|---|
| Brand-thema + tokens | `tailwind.config.js` | TNO-ramps, statuskleuren, typografie (J1–J6 in de header) |
| shadcn CSS-variabelen | `src/index.css` | `:root`/`.dark` HSL-kanalen → semantische tokens |
| Status-seam | `src/theme/statusColors.ts` | hex voor MUI-consumenten + class-literals voor gemigreerde componenten |
| Owned primitives | `src/components/ui/*.tsx` | Button (#178), Card/Separator (#180), Alert (#201) — geknipte code, wij bezitten hem |

---

## 1. Proces — meten vóór bouwen

### Survey eerst

Vóór elke component-migratie: lokaliseer de echte render-site(s), lees het
MUI-origineel, en meet het gerenderde resultaat. Migreer één leaf of één shell
per PR; parents blijven MUI (het #172-sjabloon).

### Verifieer GERENDERDE GEOMETRIE, niet class-strings

De maatstaf is de browser tegen `develop`: computed styles + bounding boxes,
licht én donker. Class-strings die er goed uitzien bewijzen niets — twee landelijke
lessen:

- **De #198-borderbug**: alle Card-randen renderden 0 breed terwijl de classes
  klopten. Alleen een `getComputedStyle`-assertie op border-width/-style ving hem.
- **De strut-les (#204)**: MUI Typography rendert *inline*; zijn regelbox komt
  van de **strut** van de omliggende div (bv. Inter 16px × 1.5 = 24px), niet van
  zijn eigen line-height. shadcn/Tailwind-divs zijn *block* en leveren hun eigen
  regelbox — dezelfde font-size kan dus 6px+ hoogteverschil geven. Remedie:
  expliciete `leading-*` om de gemeten hoogte te reproduceren.

### Fideliteits-overrides zijn de gesanctioneerde remedie

Waar de stock-shadcn-default de gemeten MUI-geometrie niet reproduceert, wint de
meting — met een expliciete override op de call-site. Gelande precedenten:

| Override | Site | Waarom |
|---|---|---|
| `p-4 pb-3` op CardContent | KpiOverviewPanel (#200) | stock `p-6 pt-0` veronderstelt een CardHeader; MUI gaf 16/12px |
| `text-base leading-7` op CardTitle | DecisionSupportCard (#204) | stock `leading-none` liet het headerblok 12px krimpen |
| `text-xs leading-6` op CardDescription | DecisionSupportCard (#204) | de strut-les: de MUI-caption was inline en erfde de 24px-regelbox |

De primitive in `ui/` blijft stock-vormig; fideliteit woont op de call-site.

---

## 2. Styling-regels

### JIT-veto — altijd volledige class-literals

Tailwinds JIT genereert alleen classes die het als **compleet literal** in de
bron ziet. Samengestelde namen (`bg-${naam}-100`) bestaan runtime stilletjes
niet. Daarom draagt de seam volledige strings, en daarom grep-t elke PR zijn
nieuwe literals in de dist-CSS (§5).

### De custom ramps hebben GEEN -400

`success`/`warning`/`danger` in `tailwind.config.js` definiëren de stappen
**100/300/500/600/700/800** — een `-400` bestaat niet en compileert stilletjes
niet (JIT-veto). `slate` is stock-Tailwind en heeft wél alle stappen; de
offline-tier gebruikt daarom vrij slate-400/-500/-600.

### De status-seam (`src/theme/statusColors.ts`)

- **Twee representaties, één bron**: `STATUS_COLORS` (hex) blijft onaangeraakt
  voor de nog-MUI-consumenten (`theme.ts` e.a.) **tot de endgame-convergentie**;
  gemigreerde componenten consumeren uitsluitend de class-records
  (`STATUS_PILL_CLASSES`, `STATUS_TINT_BG_CLASSES`, `STATUS_TEXT_SAFE_CLASSES`,
  `STATUS_ACCENT_BORDER_CLASSES`, `STATUS_CARD_ACCENT_CLASSES`,
  `STATUS_SOLID_CHIP_CLASSES`, `STATUS_DOT_CLASSES`, `STATUS_ICON_CLASSES`) via
  de bucketers (`pumpStatusToSemantic`, `severityToSemantic`,
  `decisionScoreToSemantic`, `kpiStatusToSemantic`).
- **`StatusSemantic` blijft puur statusvocabulaire** (healthy/warning/danger/
  offline). Niet-statusconcepten krijgen géén seam-entry: `info` = sky leeft
  component-lokaal in `ui/alert.tsx` (het #201-precedent).
- Een nieuwe representatie toevoegen mag alleen als geen bestaand record de
  betekenis dekt, met een motiverend commentaar (het `STATUS_CARD_ACCENT`-
  precedent uit #200: links-only omdat all-side het 1px-kader zou meekleuren).

### Typografie

- **`text-2xs`** (0.65rem) is dé chip/label-maat — de vastgelegde consolidatie
  van de oude ad-hoc 0.6–0.7rem-band (#172, #204).
- **J4 — geen 600-gewicht**: Lato levert 400/700/900; `font-medium` én
  `font-semibold` mappen beide op **700** (`tailwind.config.js`). Bekend open
  punt (#204): op Inter-elementen tijdens de coexistentie rendert dat 700 waar
  MUI 600 gaf — geaccepteerd als systeemkeuze tenzij een PR expliciet
  `font-[600]` motiveert.
- Kleine status-tekst (≤0.7rem) op een kaal vlak: de `-700`-stap
  (`STATUS_TEXT_SAFE_CLASSES`) — de mains halen daar geen AA op wit.

---

## 3. Owned shadcn-primitives — de vaste project-edits

Bij **elke** `shadcn add` (wij bezitten de geknipte code) gelden deze edits,
allemaal geland in Button (#178), Card (#180/#198) en Alert (#201):

1. **Radius `rounded` (4px)**, niet `rounded-lg`/`rounded-md` — 4px = MUI's
   `theme.shape.borderRadius` = de TNO-default.
2. **Geen shadow** — het thema is plat (elevatie 0 overal); geen
   elevatie-schaal introduceren.
3. **`border border-<kleur> border-solid`** — twee vallen tegelijk:
   - kaal `border` heeft géén kleur (de shadcn `*{border-border}`-base-regel is
     bewust weggelaten, #178) → border-color = currentColor = tekstkleur;
   - Preflight staat UIT, dus zonder expliciet `border-solid` is de UA-default
     `border-style: none` en stort de breedte naar **0** (de #198-bug).
4. **accent → slate-hovers** (J2): het TNO-accentgroen `#519872` is
   chrome-only, nooit een interactiekleur. Stock `hover:bg-accent` wordt
   `hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-overlay-8
   dark:hover:text-slate-50`.
5. **Element-resets component-scoped, nooit globaal** — de Button draagt zijn
   eigen `appearance-none border border-transparent`; géén globale
   `button{}`-reset of Preflight (die zouden MUI's eigen elementen raken).
6. **Geen `font-sans` op div-gebaseerde primitives** tijdens de coexistentie —
   een div heeft geen UA-reset nodig, en Lato zou splijten met de
   Inter-Typography-kinderen (Card/Alert volgen dit; de Button — een native
   `<button>` — heeft `font-sans` wél nodig als deel van zijn scoped reset).
7. Semantische elementen die UA-stijlen lekken (h5 e.d.) worden **divs**
   (AlertTitle/CardTitle-precedent) — Preflight staat immers uit.

---

## 4. Coexistentie-grenzen

- **`corePlugins.preflight: false` + MUI `CssBaseline` blijven tot het LAATSTE
  MUI-component weg is.** Preflight flipt pas in het endgame, met een
  volledige app-regressie (het is een app-brede reset-wissel).
- **Geen shadcn base-block** in `index.css` (`*{border-border}` /
  `body{bg-background}`) — dat zou de pagina-achtergrond slate-50 → wit kappen.
  Alleen de variabelen-blokken.
- **Breakpoints**: MUI gebruikt sm=600 / md=900 / lg=1200; Tailwind-stock is
  sm=640 / md=768 / lg=1024. De config heeft nu géén `screens`-override — die
  **moet bestaan vóór welke responsive migratie dan ook**, anders verschuiven
  alle responsive omslagpunten stilletjes. De concrete fix (eigen, config-only
  PR) in `tailwind.config.js`:

  ```js
  theme: {
    screens: { sm: '600px', md: '900px', lg: '1200px' },
    extend: { /* … */ },
  }
  ```

  NB: een top-level `screens` VERVANGT de stock-set (xl/2xl vervallen) — dat is
  hier veilig én bedoeld: `src/` bevat geen enkele `xl:`/`2xl:`-prefix
  (geverifieerd), en MUI's xl (1536px) wordt pas toegevoegd als een site hem
  aantoonbaar nodig heeft.
- **Iconen**: gemigreerde componenten importeren nooit `@mui/icons-material`
  (dep is al weg, #179). Algemene UI-iconen = lucide-react; status-iconen = de
  inline-SVG's op `currentColor` van de seam (`statusIcons.ts`).
- **Dark mode**: `darkMode: 'class'`; de html-class loopt synchroon met de
  MUI-modus (#174). Elke migratie levert de `dark:`-classes mee en verifieert
  ze live.
- **`STATUS_COLORS`-hex blijft onaangeroerd tot de endgame-convergentie** —
  dan vervalt de hex-export en convergeert de seam-module.

---

## 5. Tests & verificatie — de per-PR-poorten

Tests wonen in `src/__tests__/` (repo-conventie, geen colocated tests). TDD:
de render-test eerst, rood gezien, dan de implementatie (het #200-precedent:
"render-test eerst rood (4 asserties), toen groen").

Per component-test: gedrag via tekst + `data-*`-hook + **enkele dragende
classes** — géén uitputtende class-lijsten (class-smoke, geen snapshot van de
hele string). **Ouder-suites blijven byte-identiek groen** — dat bewijst de
schone slot-in. **Testids en ARIA-roles blijven ALTIJD behouden** (`role=alert`,
`data-testid`s — de e2e- en a11y-contracten).

Elke migratie-PR haalt **alle** poorten en rapporteert ze in de PR-tekst:

1. **Unit**: `npm test` (vitest) volledig groen; nieuwe tests voor het
   gemigreerde component.
2. **Lint**: `npm run lint` exact op de baseline **43 errors / 8 warnings** —
   nul nieuwe. Structurele frictie lost een scoped config-override op (het
   `src/components/ui/**`-precedent uit #178), geen baseline-verschuiving.
3. **Build**: `npm run build` (tsc + vite) groen.
4. **dist-CSS-grep**: élke nieuwe class-literal aantoonbaar gegenereerd in de
   gebouwde CSS (het JIT-veto-sluitstuk).
5. **e2e / live-verificatie**: `getComputedStyle`-bewijs tegen `develop`,
   **licht én donker** — kleuren (rgb-waarden), border width/style/kleur per
   zijde, padding, en bij shells de bounding-box-geometrie (kaarthoogte,
   posities — het #204-niveau).

---

## 6. Git & PR-conventies

- Branchen **van `develop`**; één concern per PR (één primitive, één shell, of
  één file-disjuncte cluster).
- **Expliciete staging**: benoemde paden `git add`-en, nooit `git add -A`/`-u`.
- **Squash-merge**; de reviewer merget — een PR wordt nooit door de maker
  gemerged.
- PR-teksten en commits in het **Nederlands**; de PR-tekst rapporteert
  wat/waarom/deltas + het verificatiebewijs van §5.
- **Geen AI-attributie** in welk artefact dan ook (commits, PR's, code, docs).
- Diff-discipline: de diff bevat het component + seam-toevoeging (indien nodig)
  + tests + call-sites — niets anders. Foundation-bestanden
  (`tailwind.config.js`-ramps, `theme.ts`, `index.css`-vars, bestaande
  `ui/*`-primitives) blijven buiten component-PR's tenzij het plan het
  expliciet zegt.

### Skip-and-list — nooit improviseren

Past een site niet op een bewezen patroon (geen precedent in dit playbook of de
gelande PR's), dan wordt hij **overgeslagen en gelist** in de PR-tekst / het
eindrapport, voor een latere weloverwogen stap. Een half-geraden mapping is
duurder dan een eerlijke restschuld (het "eerlijke eindstand"-principe uit #200).

### Stop-regels

Stop en rapporteer (in plaats van doorbouwen) wanneer:

- een verificatiepoort faalt en de oorzaak niet triviaal is;
- een wijziging aan de seam, `theme.ts` of een bestaande `ui/*`-primitive
  buiten het afgesproken plan nodig lijkt;
- de scope een Tier 2/3-primitive raakt (Dialog, Drawer, Typography, Box,
  Grid) — die hebben eigen, latere stappen;
- lint of tests onverklaard van de baseline bewegen.

---

*Vervaldatum: dit document is migratie-steigerwerk. Zodra de MUI-verwijdering
compleet is (het Preflight-endgame), wordt dit playbook VERWIJDERD — niet
laten verstalen als pseudo-styleguide.*
