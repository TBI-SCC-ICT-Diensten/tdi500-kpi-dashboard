import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Owned ToggleGroup — segmented control, vervangt MUI ToggleButtonGroup +
 * ToggleButton (D3, zero deps). MUI's semantiek ÍS het patroon: de groep is
 * role="group" (+ aria-label), elk item een native <button> met aria-pressed;
 * toetsenbord = de gewone Tab-volgorde (MUI heeft géén roving focus — er is
 * dus niets Radix-waardigs bij te bouwen). Exclusive-gedrag: klik op het
 * geselecteerde item emit `null` (MUI-deselectie) — de null-guard ligt bij de
 * call-site, precies als bij MUI's onChange.
 *
 * TWEE VARIANTEN (de twee gelande vormen uit de inventory):
 *  • segmented — aaneengesloten knoppen: 1px border-border-kader, randen
 *    collapsen via -ml-px, alleen de uiteinden ronden (4px). Geselecteerd =
 *    het neutrale tintvlak (slate-200 licht / overlay-12 donker — de
 *    action.selected-rolmap) + donkere tekst. Header/DashboardPage.
 *  • pills — losse pillen (flex-wrap + gap), rounded-lg (8px), geselecteerd =
 *    SOLIDE primary (merk-vul + witte tekst, hover -700). BagLookupPage.
 *
 * Selectie-styling loopt via de aria-pressed:-modifier zodat call-sites haar
 * met eigen aria-pressed:-classes kunnen overriden (twMerge dedupet per
 * modifier — de Header zet zo z'n primary-geselecteerde tekst).
 *
 * PROJECT-EDITS (playbook §3): scoped button-reset (appearance-none +
 * font-sans — Preflight UIT), accent→slate-hovers (J2), rounded 4px, geen
 * shadow. Item-tekst text-sm (13px) — de #178-Button-consolidatie.
 */

type ToggleGroupVariant = 'segmented' | 'pills';

interface ToggleGroupContextValue {
  value: string | null;
  onItemClick: (itemValue: string) => void;
  variant: ToggleGroupVariant;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string | null;
  /** MUI-exclusive-pariteit: klik op het geselecteerde item levert null. */
  onValueChange: (value: string | null) => void;
  variant?: ToggleGroupVariant;
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, value, onValueChange, variant = 'segmented', children, ...props }, ref) => {
    const onItemClick = React.useCallback(
      (itemValue: string) => onValueChange(itemValue === value ? null : itemValue),
      [onValueChange, value]
    );
    const ctx = React.useMemo(
      () => ({ value, onItemClick, variant }),
      [value, onItemClick, variant]
    );
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          variant === 'segmented' ? 'inline-flex' : 'flex flex-wrap gap-2',
          className
        )}
        {...props}
      >
        <ToggleGroupContext.Provider value={ctx}>{children}</ToggleGroupContext.Provider>
      </div>
    );
  }
);
ToggleGroup.displayName = 'ToggleGroup';

const toggleItemVariants = cva(
  /* Scoped reset + gedeelde interactielaag. Geselecteerd via aria-pressed:
   * het neutrale action.selected-tintvlak; hovers ge-slate-d (J2). */
  'appearance-none font-sans inline-flex items-center justify-center whitespace-nowrap ' +
    'border border-solid border-border bg-transparent text-sm text-slate-600 transition-colors ' +
    'hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-overlay-8 dark:hover:text-slate-50 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ' +
    'disabled:pointer-events-none disabled:opacity-50 ' +
    'aria-pressed:bg-slate-200 aria-pressed:text-slate-900 dark:aria-pressed:bg-overlay-12 dark:aria-pressed:text-slate-50',
  {
    variants: {
      variant: {
        segmented: '-ml-px first:ml-0 rounded-none first:rounded-l last:rounded-r h-8 px-2.5',
        pills:
          'rounded-lg h-10 px-4 ' +
          'aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary ' +
          'dark:aria-pressed:bg-primary dark:aria-pressed:text-primary-foreground ' +
          'hover:aria-pressed:bg-primary-700 dark:hover:aria-pressed:bg-primary-300',
      },
    },
    defaultVariants: {
      variant: 'segmented',
    },
  }
);

export interface ToggleGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = React.useContext(ToggleGroupContext);
    if (ctx == null) {
      throw new Error('ToggleGroupItem hoort binnen een ToggleGroup');
    }
    return (
      <button
        type="button"
        ref={ref}
        aria-pressed={ctx.value === value}
        onClick={() => ctx.onItemClick(value)}
        className={cn(toggleItemVariants({ variant: ctx.variant }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ToggleGroupItem.displayName = 'ToggleGroupItem';

export { ToggleGroup, ToggleGroupItem };
