import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Owned Collapsible — vervangt MUI Collapse (D4). CSS grid-template-rows
 * 0fr→1fr met een 300ms-transitie: zero deps, geen meet-JS, en de easing
 * (Tailwind ease-in-out = cubic-bezier(0.4,0,0.2,1)) is exact MUI's
 * easeInOut. Kinderen blijven MOUNTED in dichte stand (MUI-pariteit — MUI
 * Collapse unmount niet); het binnenvlak (min-h-0 + overflow-hidden) klemt
 * de hoogte naar 0. Beide accordion-sites (HeatPumpCommandPanel,
 * HeatPumpDetailCard) delen deze ene vorm.
 */

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** MUI Collapse `in`-pariteit. */
  open: boolean;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, open, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid transition-[grid-template-rows] duration-300 ease-in-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
);
Collapsible.displayName = 'Collapsible';

export { Collapsible };
