import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CircleCheck, TriangleAlert, CircleX, Info } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  STATUS_PILL_CLASSES,
  STATUS_SOLID_CHIP_CLASSES,
  STATUS_ICON_CLASSES,
} from '@/theme/statusColors';

/**
 * shadcn/ui Alert — TNO-getokend severity-primitief (vervangt MUI Alert +
 * AlertTitle). Severity-vocabulaire volgt het seam: success/warning/danger
 * (MUI's `error` is hernoemd naar `danger`) + `info`.
 *
 * SEAM-HERGEBRUIK (geen nieuwe representatie): de tint-variant leest het
 * tintpaar (STATUS_PILL_CLASSES), `filled` de solid-chip (STATUS_SOLID_CHIP_
 * CLASSES), het icoon de solid-icon (-600, STATUS_ICON_CLASSES). INFO is
 * bewust GEEN seam-entry — StatusSemantic blijft puur statusvocabulaire; info
 * is een alert-concept. Het sky-paar hieronder is een volledig literal
 * (JIT-veto), en sky ÍS al de app-infokleur: theme.ts palette.info = #0EA5E9/
 * #E0F2FE/#0284C7 = sky-500/-100/-600. Filled-info pakt sky-600 (níet
 * main/sky-500 — dat is ~2.6:1 op wit, sub-AA; -600 spoort met de seam-solid).
 *
 * PROJECT-EDITS t.o.v. de stock-Alert (staande regels):
 *  1. FLEX-RIJ i.p.v. de stock icon-selector-hack ([&>svg]:absolute +
 *     [&>svg~*]:pl-7): die padding pakt alleen ELEMENT-siblings, dus raw-text
 *     children (13 van de 17 sites) zouden onder het icoon schuiven. De rij
 *     (icoonslot + contentvlak) is wat MUI Alert intern óók is.
 *  2. AUTO-ICOON per severity (MUI-pariteit; lucide, #179): success→CircleCheck,
 *     warning→TriangleAlert, danger→CircleX, info→Info. Override via `icon`
 *     (ReactNode, of `false` om te onderdrukken — MUI's icon={false}).
 *  3. `border border-solid` + TOON-OP-TOON severity-rand (flat design: randen
 *     dragen de structuur; border-border slate zou vloeken op tint). #198:
 *     zonder expliciet border-solid rendert de rand 0-breed (Preflight UIT).
 *     Filled = border-transparent.
 *  4. `rounded` (4px), niet rounded-lg — als de Card.
 *  5. AlertTitle als DIV (stock: h5) — Preflight UIT, dus een kale h5 lekt
 *     UA-marges/-groottes; zelfde keuze als CardTitle. GEEN font-sans op de
 *     basis (volg de Card, niet de Button: een div heeft geen UA-reset nodig,
 *     en Lato zou tijdens de coëxistentie splijten met Inter-Typography-kids).
 */

type AlertSeverity = 'success' | 'warning' | 'danger' | 'info';

/* Info = sky, alert-lokaal (zie boven): tintpaar + rand + solid + icoon in
 * dezelfde vorm als de seam-representaties. Volledige literals (JIT-veto). */
const INFO_TINT_CLASSES = 'bg-sky-100 text-sky-800 dark:bg-sky-600/15 dark:text-sky-300';
const INFO_SOLID_CLASSES = 'bg-sky-600 text-white';
const INFO_ICON_CLASSES = 'text-sky-600';

const alertVariants = cva('flex w-full items-start gap-3 rounded border border-solid px-4 py-3 text-sm', {
  variants: {
    severity: {
      success: '',
      warning: '',
      danger: '',
      info: '',
    },
    variant: {
      default: '',
      filled: '',
    },
  },
  compoundVariants: [
    /* Tint: seam-tintpaar + toon-op-toon rand (licht -300, donker de
     * 30%-alpha main — zelfde alpha-benadering als het donkere tintvlak). */
    {
      severity: 'success',
      variant: 'default',
      class: `${STATUS_PILL_CLASSES.healthy} border-success-300 dark:border-success-600/30`,
    },
    {
      severity: 'warning',
      variant: 'default',
      class: `${STATUS_PILL_CLASSES.warning} border-warning-300 dark:border-warning-600/30`,
    },
    {
      severity: 'danger',
      variant: 'default',
      class: `${STATUS_PILL_CLASSES.danger} border-danger-300 dark:border-danger-600/30`,
    },
    {
      severity: 'info',
      variant: 'default',
      class: `${INFO_TINT_CLASSES} border-sky-300 dark:border-sky-600/30`,
    },
    /* Filled: seam-solid-chip (bg-*-600 + wit, modus-invariant). */
    { severity: 'success', variant: 'filled', class: `${STATUS_SOLID_CHIP_CLASSES.healthy} border-transparent` },
    { severity: 'warning', variant: 'filled', class: `${STATUS_SOLID_CHIP_CLASSES.warning} border-transparent` },
    { severity: 'danger', variant: 'filled', class: `${STATUS_SOLID_CHIP_CLASSES.danger} border-transparent` },
    { severity: 'info', variant: 'filled', class: `${INFO_SOLID_CLASSES} border-transparent` },
  ],
  defaultVariants: {
    variant: 'default',
  },
});

/* Auto-iconen (edit 2) — 20px benadert MUI's 22px-severity-icoon. */
const SEVERITY_ICONS: Record<AlertSeverity, React.ReactNode> = {
  success: <CircleCheck size={20} />,
  warning: <TriangleAlert size={20} />,
  danger: <CircleX size={20} />,
  info: <Info size={20} />,
};

/* Icoonkleur: seam-solid-icon (-600, modus-invariant); info sky-lokaal. */
const SEVERITY_ICON_COLOR: Record<AlertSeverity, string> = {
  success: STATUS_ICON_CLASSES.healthy,
  warning: STATUS_ICON_CLASSES.warning,
  danger: STATUS_ICON_CLASSES.danger,
  info: INFO_ICON_CLASSES,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  severity: AlertSeverity;
  /** MUI-pariteit: `false` onderdrukt het icoon, een node vervangt het
   *  (en erft de severity-kleur via currentColor). */
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, severity, variant = 'default', icon, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ severity, variant }), className)}
      {...props}
    >
      {icon !== false && (
        <span
          aria-hidden="true"
          className={cn(
            'flex shrink-0',
            variant === 'filled' ? 'text-white' : SEVERITY_ICON_COLOR[severity]
          )}
        >
          {icon ?? SEVERITY_ICONS[severity]}
        </span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
