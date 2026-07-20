import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { STATUS_SOLID_CHIP_CLASSES } from '@/theme/statusColors';

/**
 * Owned Chip — vervangt MUI `Chip` voor de semantische kleur-familie (D1,
 * cluster-run Tier-1). Vijf sites: de interactieve datasource-chip (Header)
 * plus vier statische (Profiel ×2, Klasse, Betrouwbaarheid). DSC's neutrale
 * verdict-chip is al gespanificeerd (#204) — dit primitief is bewust alléén
 * de kleur-familie.
 *
 * POLYMORF: rendert een <button type="button"> zodra `onClick` aanwezig is
 * (MUI clickable-Chip-pariteit: echte focus/toetsenbord-semantiek), anders
 * een <span>. De button-tak draagt de scoped reset (appearance-none +
 * font-sans, het #178-Button-precedent — Preflight staat UIT) + focus-ring +
 * per-kleur hover; de span-tak is een kaal inline vlak zonder font-sans
 * (div-regel: geen Lato-splitsing tijdens de coëxistentie).
 *
 * KLEUREN (drie vulstijlen):
 *  • solid-status → het seam (STATUS_SOLID_CHIP_CLASSES: bg-*-600 + wit,
 *    modus-invariant; `error`→`danger` is de call-site-hernoeming, #201).
 *  • solid-primary → merk, GEEN status: component-lokaal op de shadcn-tokens
 *    (bg-primary text-primary-foreground, modus-bewust via --primary, J3) —
 *    zelfde patroon als info=sky in alert.tsx; StatusSemantic blijft puur.
 *  • outlined → component-lokaal (enige call-site: de Betrouwbaarheid-chip).
 *    Rand de levendige -600 (grafisch, 3:1); tekst de -700 text-safe-stap
 *    (kleine tekst op kaal vlak — het #173-signed-delta-precedent; MUI's
 *    main-600 haalt daar geen AA). Neutraal (offline) volgt de slate-rolmap.
 *
 * Vorm: pil (rounded-full), h-6 (= MUI small-Chip 24px), text-2xs (dé
 * vastgelegde chipmaat — 0.7rem-sites consolideren, #204-precedent).
 * Gewicht is call-site-zaak (MUI default 400; sites zetten 600/700 → J4).
 */

type ChipColor = 'healthy' | 'warning' | 'danger' | 'offline' | 'primary';

/* Component-lokaal: merk-solid + het outlined-stel (volledige literals,
 * JIT-veto). Outlined-primary voor API-sluiting, nog zonder consument. */
const SOLID_PRIMARY_CLASSES = 'bg-primary text-primary-foreground border-transparent';

const OUTLINED_CLASSES: Record<ChipColor, string> = {
  healthy: 'bg-transparent border-success-600 text-success-700 dark:border-success-500 dark:text-success-300',
  warning: 'bg-transparent border-warning-600 text-warning-700 dark:border-warning-500 dark:text-warning-300',
  danger:  'bg-transparent border-danger-600 text-danger-700 dark:border-danger-500 dark:text-danger-300',
  offline: 'bg-transparent border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400',
  primary: 'bg-transparent border-primary text-primary',
};

/* Interactieve hover per solid-kleur: één stap donkerder (-700; primary via
 * de /90-alpha, het Button-precedent). */
const INTERACTIVE_HOVER_CLASSES: Record<ChipColor, string> = {
  healthy: 'hover:bg-success-700',
  warning: 'hover:bg-warning-700',
  danger:  'hover:bg-danger-700',
  offline: 'hover:bg-slate-500 dark:hover:bg-slate-700',
  primary: 'hover:bg-primary/90',
};

const chipVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-solid h-6 px-2 text-2xs',
  {
    variants: {
      color: {
        healthy: '',
        warning: '',
        danger: '',
        offline: '',
        primary: '',
      },
      variant: {
        solid: '',
        outlined: '',
      },
    },
    compoundVariants: [
      { color: 'healthy', variant: 'solid', class: `${STATUS_SOLID_CHIP_CLASSES.healthy} border-transparent` },
      { color: 'warning', variant: 'solid', class: `${STATUS_SOLID_CHIP_CLASSES.warning} border-transparent` },
      { color: 'danger', variant: 'solid', class: `${STATUS_SOLID_CHIP_CLASSES.danger} border-transparent` },
      { color: 'offline', variant: 'solid', class: `${STATUS_SOLID_CHIP_CLASSES.offline} border-transparent` },
      { color: 'primary', variant: 'solid', class: SOLID_PRIMARY_CLASSES },
      { color: 'healthy', variant: 'outlined', class: OUTLINED_CLASSES.healthy },
      { color: 'warning', variant: 'outlined', class: OUTLINED_CLASSES.warning },
      { color: 'danger', variant: 'outlined', class: OUTLINED_CLASSES.danger },
      { color: 'offline', variant: 'outlined', class: OUTLINED_CLASSES.offline },
      { color: 'primary', variant: 'outlined', class: OUTLINED_CLASSES.primary },
    ],
    defaultVariants: {
      variant: 'solid',
    },
  }
);

/* De scoped reset + interactie-laag van de button-tak (#178-precedent). */
const INTERACTIVE_BASE_CLASSES =
  'appearance-none font-sans cursor-pointer transition-colors ring-offset-background ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50';

export interface ChipProps extends React.HTMLAttributes<HTMLElement> {
  color: ChipColor;
  variant?: 'solid' | 'outlined';
  /** Icoonslot vóór het label (lucide-node; erft currentColor). */
  icon?: React.ReactNode;
}

const Chip = React.forwardRef<HTMLElement, ChipProps>(
  ({ className, color, variant = 'solid', icon, onClick, children, ...props }, ref) => {
    const interactive = onClick != null;
    const classes = cn(
      chipVariants({ color, variant }),
      interactive && INTERACTIVE_BASE_CLASSES,
      interactive && variant === 'solid' && INTERACTIVE_HOVER_CLASSES[color],
      className
    );
    const content = (
      <>
        {icon != null && (
          <span aria-hidden="true" className="flex shrink-0">
            {icon}
          </span>
        )}
        {children}
      </>
    );
    /* createElement met de tag-unie i.p.v. twee JSX-takken: zo is er geen
       ref-assertie nodig (RefObject<HTMLElement> is onder strictFunctionTypes
       niet toewijsbaar aan een specifieker JSX-ref-type). */
    return React.createElement(
      interactive ? 'button' : 'span',
      {
        ref,
        className: classes,
        onClick,
        ...(interactive ? { type: 'button' } : null),
        ...props,
      },
      content
    );
  }
);
Chip.displayName = 'Chip';

export { Chip };
