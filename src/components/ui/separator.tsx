import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from '@/lib/utils';

/**
 * shadcn/ui Separator — vervangt MUI `<Divider>`. Canonieke shadcn-Separator
 * (@radix-ui/react-separator), een dunne regel via `bg-border` (--border =
 * slate-200 licht / slate-700 donker). `decorative` default (net als MUI
 * Divider — puur visueel). Horizontaal standaard; alle 8→7 gemigreerde sites
 * zijn horizontaal + marges (marge via className, bv. `my-3`).
 *
 * `bg-border` is een EXPLICIETE achtergrondkleur (geen kaal `border`), dus de
 * #178-border-border-regel is hier niet nodig.
 */

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
