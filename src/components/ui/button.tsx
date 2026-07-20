import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * shadcn/ui Button — pilot-primitive van de shadcn-adoptie (Tailwind v3 pad,
 * shadcn@2.3.0). Canonieke shadcn-Button, TNO-getokend via de CSS-variabelen
 * (src/index.css :root/.dark) + de config-merge (tailwind.config.js). Default =
 * TNO-blauw (#123EB7 licht / #6C8FE8 donker, modus-bewust via --primary, J3).
 *
 * TWEE PROJECT-EDITS t.o.v. de stock-Button (STAANDE REGELS voor elke shadcn-
 * primitive):
 *  1. SCOPED native-<button> reset — `appearance-none border border-transparent
 *     font-sans` in de basis. Preflight staat UIT tijdens de MUI-coexistentie
 *     (tailwind.config.js corePlugins.preflight:false), dus zonder deze
 *     COMPONENT-lokale reset lekken de UA-button-stijlen (rand/achtergrond/font)
 *     door. GEEN globale button{}-reset of Preflight — die zouden MUI's eigen
 *     <button>s raken. Element-resets voor shadcn-primitives zijn
 *     component-scoped tot het Preflight-endgame. De PADDING-helft van die
 *     reset zit per maat-variant: elke maat die zelf padding zet dekt de
 *     UA-'1px 6px' af, en size=icon (die geen padding zet) draagt daarom p-0.
 *  2. accent→slate hover — de stock ghost/outline gebruiken hover:bg-accent;
 *     hier ge-slate-d (hover:bg-slate-100 / dark:bg-overlay-8). J2: het
 *     TNO-accent-groen is chrome-only, nooit een interactie-kleur.
 *
 * Radius vastgezet op `rounded` (4px = TNO DEFAULT = MUI button-radius), niet
 * rounded-md.
 */

const buttonVariants = cva(
  'appearance-none border border-transparent font-sans inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border-input bg-background hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-overlay-8 dark:hover:text-slate-50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-overlay-8 dark:hover:text-slate-50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        /* p-0 hoort bij de scoped reset (1): de icon-maat is vierkant en zet
           zelf geen padding, dus zonder Preflight lekt hier de UA-'1px 6px'
           door en knijpt de content-box (30px-knop met 6px zij-padding laat
           18px over voor een 20px-icoon). De primitive levert de reset zodat
           call-sites hem niet elk apart hoeven te herhalen. */
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
