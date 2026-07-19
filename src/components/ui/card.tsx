import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * shadcn/ui Card — DE surface-primitive van de MUI→shadcn-migratie. Canonieke
 * shadcn-Card, PLAT ge-edit voor het TNO-thema (we bezitten de gekopieerde code,
 * net als de Button). Vervangt MUI `<Paper variant="outlined">` en bedient later
 * ook de uitgestelde Card-shells (DecisionSupportCard/KpiOverviewPanel).
 *
 * DRIE PROJECT-EDITS t.o.v. de stock-Card (vs MUI outlined Paper):
 *  1. `border border-border` (NIET het kale `border`) — #178 liet shadcn's
 *     `*{border-border}` base-regel VALLEN (die zou de pagina-bg kappen), dus
 *     kaal `border` = border-color:currentColor = de tekstkleur = een donkere
 *     rand. STAANDE REGEL: elke shadcn-primitive zet border-color expliciet
 *     (`border-border`).
 *  2. `rounded` (4px = MUI's theme.shape.borderRadius / outlined Paper), NIET
 *     `rounded-lg` (8px).
 *  3. GEEN `shadow-sm` — het thema is plat (geen elevatie-schaal; outlined Paper
 *     heeft geen schaduw).
 *
 * bg-card leest --card (index.css): licht wit, donker slate-800 (= MUI
 * background.paper). Plain Papers → `<Card className="p-4 …">` (kale Card +
 * padding; de CardHeader/CardContent-structuur is opt-in, dus een kale Card is
 * gewoon een omlijnd vlak — niet over-gestructureerd). De shells gebruiken later
 * Card + CardHeader/CardContent.
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded border border-solid border-border bg-card text-card-foreground',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
