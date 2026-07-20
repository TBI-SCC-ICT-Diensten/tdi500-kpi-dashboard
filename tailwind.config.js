/** ==========================================================================
 * TDI 500 dashboard — TNO/TDI 500 brand theme for Tailwind CSS
 * Target of the MUI → Tailwind migration. Re-skins every design role in the
 * MUI-theme inventory to TNO/consortium branding. Light + dark (darkMode:
 * 'class'). Flat design: no shadow scale, borders carry the structure.
 *
 * ── DESIGN JUDGMENTS (visible + reversible) ────────────────────────────────
 * J1  Brand-step placement: TNO blue #123EB7 sits at primary-600 (its natural
 *     lightness step); deep navy #002484 at secondary-800; TDI green #519872
 *     at accent-500. Ramps are hand-tuned perceptual steps, not stock.
 * J2  Success vs. brand green: accent #519872 is a MUTED SAGE (low chroma,
 *     hue ≈160°) used ONLY for project chrome/borders, never in pills/status
 *     text; success #16A34A is a VIVID saturated green (hue ≈150°, much
 *     higher chroma) used ONLY in status contexts, always paired with an
 *     icon + label. Different chroma + different role = separable at a glance.
 * J3  Dark-mode brand blue: #123EB7 fails legibility on slate-900; dark mode
 *     uses primary-400 #6C8FE8 as primary.main (contrastText slate-950),
 *     mirroring the app's existing light-blue-on-dark pattern.
 * J4  Lato on Google Fonts ships 400/700/900 only (no 500/600). Weight roles
 *     medium(500)/semibold(600) are mapped to 700; the h5(700)/h6(600) delta
 *     is carried by SIZE (2xl vs xl) instead of weight. Load:
 *     https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap
 * J5  Offline/no-data gray resolved to ONE token: slate-500 #64748B (§D2).
 * J6  Radius settled to 4px default / 8px lg / full for dots (§B).
 * ========================================================================== */

module.exports = {
  darkMode: 'class',
  corePlugins: { preflight: false },  // coexistence: MUI CssBaseline provides the reset
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    /* ── BREAKPOINTS — MUI-pariteit (playbook §4). MUI's sm/md/lg = 600/900/
          1200; Tailwind-stock (640/768/1024) zou elke responsive migratie
          stilletjes laten verschuiven. Top-level VERVANGT de stock-set:
          xl/2xl vervallen bewust — src/ bevat nul xl:/2xl:-prefixes en MUI's
          xl (1536px) komt pas terug als een site hem aantoonbaar nodig heeft. */
    screens: { sm: '600px', md: '900px', lg: '1200px' },
    extend: {
      colors: {
        /* ── PRIMARY · TNO blue — ramp generated from #123EB7 (at 600) ─── */
        primary: {
          50:  '#EFF3FC',
          100: '#DCE5F9',
          200: '#BCCCF3',
          300: '#92ACEB',
          400: '#6C8FE8',   // dark-mode primary.main (J3)
          500: '#3A5FD1',
          600: '#123EB7',   // ★ brand — light-mode primary.main
          700: '#0E3196',   // hover
          800: '#0B2674',
          900: '#081C55',
          950: '#051238',
          // shadcn: modus-bewuste DEFAULT (licht #123EB7 / donker #6C8FE8, J3) +
          // foreground. De steps 50–950 hierboven blijven ONGEMOEID.
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        /* ── SECONDARY · TNO deep navy — ramp from #002484 (at 800) ────── */
        secondary: {
          50:  '#EEF1FB',
          100: '#DBE2F7',
          200: '#B7C5EE',
          300: '#8CA1E2',
          400: '#5C79D3',
          500: '#3554BE',
          600: '#1A3DA6',
          700: '#0B2F94',
          800: '#002484',   // ★ brand — sidebar/drawer chrome, dark headings
          900: '#001B63',
          950: '#001140',
          // shadcn semantic DEFAULT + foreground; steps 50–950 ONGEMOEID.
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        /* ── ACCENT · TDI 500 green — project identity ONLY (J2).
              Accent borders, project chrome. NEVER semantic/status. ─────── */
        accent: {
          50:  '#F1F7F4',
          100: '#E0EDE6',
          200: '#C2DBCE',
          300: '#9CC3AC',
          400: '#73AB8D',
          500: '#519872',   // ★ brand — TDI 500 green
          600: '#3E7659',
          700: '#326048',   // text-safe on white (small accent labels)
          800: '#264A38',
          900: '#1B3428',
          DEFAULT: '#519872',
        },

        /* ── STATUS — conventional, brand-tuned (mode-invariant mains).
              Tint pairs: light = -100 bg + -800 text; dark = 15%-alpha bg
              + -300 text. Small text (≤0.7rem chips) uses -700 (§D1 fix);
              icons use main. ───────────────────────────────────────────── */
        success: {
          100: '#DCFCE7',   // light tint bg
          300: '#86EFAC',   // dark-mode tint text
          500: '#22C55E',
          600: '#16A34A',   // main (healthy) — vivid, ≠ accent sage (J2)
          700: '#15803D',   // ★ text-safe small status text
          800: '#166534',   // light tint text
          DEFAULT: '#16A34A',
        },
        warning: {
          100: '#FEF3C7',
          300: '#FCD34D',
          500: '#F59E0B',
          600: '#D97706',   // main
          700: '#B45309',   // ★ text-safe
          800: '#92400E',
          DEFAULT: '#D97706',
        },
        danger: {
          100: '#FEE2E2',
          300: '#FCA5A5',
          500: '#EF4444',
          600: '#DC2626',   // main
          700: '#B91C1C',   // ★ text-safe
          800: '#991B1B',
          DEFAULT: '#DC2626',
        },
        /* Offline / geen data — ONE token (§D2, J5) = slate-500 */
        offline: { DEFAULT: '#64748B' },

        /* ── shadcn/ui SEMANTISCHE TOKENS → hsl(var(--x)) uit index.css.
              NIEUWE namen (botsen niet met de TNO-ramps hierboven). primary/
              secondary kregen een var-DEFAULT + foreground; `accent` NIET —
              het TNO-groen blijft chrome-only (J2), shadcn accent-hovers worden
              in de component ge-slate-d (staande regel). `<alpha-value>` zodat
              opacity-modifiers (bv. hover:bg-primary/90) werken. */
        background:  'hsl(var(--background) / <alpha-value>)',
        foreground:  'hsl(var(--foreground) / <alpha-value>)',
        border:      'hsl(var(--border) / <alpha-value>)',
        input:       'hsl(var(--input) / <alpha-value>)',
        ring:        'hsl(var(--ring) / <alpha-value>)',
        destructive: {
          DEFAULT:    'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT:    'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },

        /* ── NEUTRALS — Tailwind slate IS the deliberate ramp; keep stock.
              Role map (replaces the ad-hoc rgba/gray/slate mix):
                text.primary    light slate-900 #0F172A · dark slate-50 #F8FAFC
                text.secondary  light slate-600 #475569 · dark slate-400 #94A3B8
                text.disabled   light slate-400 #94A3B8 · dark slate-500 #64748B
                divider         light slate-200 #E2E8F0 · dark overlay-12
                bg.default      light slate-50  #F8FAFC · dark slate-900 #0F172A
                bg.paper        light white             · dark slate-800 #1E293B
                subtle row bg   light slate-50          · dark overlay-5
                chart text      light slate-500 #64748B · dark slate-400 #94A3B8
                chart grid      light slate-200 #E2E8F0 · dark overlay-8      */

        /* ── Dark-surface overlay alphas, systematized (§E) ────────────── */
        overlay: {
          5:  'rgba(255,255,255,0.05)',
          6:  'rgba(255,255,255,0.06)',
          8:  'rgba(255,255,255,0.08)',
          10: 'rgba(255,255,255,0.10)',
          12: 'rgba(255,255,255,0.12)',  // dark divider
          85: 'rgba(15,23,42,0.85)',     // scrim
        },

        /* ── CHART SERIES — 8 steps per mode (§E). Order = series index.
              Dark ramp is lightened + adds the orange family (inventory). ── */
        chart: {
          1: '#123EB7', 2: '#26BDBD', 3: '#519872', 4: '#E8A317',
          5: '#7A5AF8', 6: '#E5484D', 7: '#2A69B8', 8: '#64748B',
        },
        'chart-dark': {
          1: '#6C8FE8', 2: '#4DD4D4', 3: '#7FB89A', 4: '#FBBF24',
          5: '#A78BFA', 6: '#F87171', 7: '#F59E0B', 8: '#94A3B8',
        },
      },

      /* ── TYPOGRAPHY — Lato only (J4). Sizes fit the in-use scale (§C):
            2xs = 0.65rem chip/label cluster (was ad-hoc 0.6–0.7rem)
            xs  = caption 12px — the workhorse (×72)
            sm  = body2 13px
            xl  = h6 · 2xl = h5 · 3xl/4xl = 28px/2rem display one-offs
            (dead h4 override dropped per §C)                              */
      fontFamily: {
        sans: ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],  // raw SAREF values
      },
      fontSize: {
        '2xs': ['0.65rem',   { lineHeight: '1rem' }],      // chips (text: use -700!)
        xs:    ['0.75rem',   { lineHeight: '1.125rem' }],  // caption
        sm:    ['0.8125rem', { lineHeight: '1.25rem' }],   // body2
        base:  ['1rem',      { lineHeight: '1.5rem' }],    // body1/subtitle1
        lg:    ['1.125rem',  { lineHeight: '1.625rem' }],
        xl:    ['1.25rem',   { lineHeight: '1.75rem' }],   // h6 (weight 700, J4)
        '2xl': ['1.5rem',    { lineHeight: '2rem' }],      // h5 (weight 700)
        '3xl': ['1.75rem',   { lineHeight: '2.125rem' }],  // display-sm (28px)
        '4xl': ['2rem',      { lineHeight: '2.375rem' }],  // display (KPI values)
      },
      fontWeight: {
        normal: '400',
        medium: '700',    // J4: Lato has no 500 → 700
        semibold: '700',  // J4: Lato has no 600 → 700
        bold: '700',
        black: '900',     // display/KPI emphasis
      },
      letterSpacing: {
        overline: '0.08em',  // tracked uppercase eyebrow (overline ×12)
      },

      /* ── SPACING — 8px base. The in-use scale (2,4,6,8,12,16,20,24,64px)
            maps to stock Tailwind: 0.5 · 1 · 1.5 · 2 · 3 · 4 · 5 · 6 · 16.
            No extension needed — documented here so nobody re-invents it.  */

      /* ── RADIUS — settled 4/8 scale (§B, J6) ──────────────────────────── */
      borderRadius: {
        DEFAULT: '4px',
        md: 'calc(var(--radius) - 2px)',  // shadcn (--radius 0.5rem → 6px)
        lg: '8px',
        sm: 'calc(var(--radius) - 4px)',  // shadcn (→ 4px)
        full: '9999px',  // status dots
      },
      /* ── BORDERS — flat design: 1px divider standard; 3px accent left-
            borders (now TDI green / TNO blue, replacing indigo/sky) ─────── */
      borderWidth: {
        3: '3px',
      },
      /* ── SHADOWS — none. The app is flat (elevation 0 everywhere);
            do NOT introduce an elevation scale in the migration. ─────────── */
    },
  },
  plugins: [require('tailwindcss-animate')],
};
