import * as React from 'react';
import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Owned Spinner — vervangt MUI CircularProgress (D5). lucide LoaderCircle
 * (de 3/4-boog benadert MUI's arc; lucide is al dé icoon-dep, #179) +
 * animate-spin. role="progressbar" = MUI-pariteit (CircularProgress draagt
 * die rol). GEEN eigen kleurclass: currentColor erft van de host — het
 * in-Button-gebruik erft zo text-primary-foreground (de #178-grens), losse
 * hosts kleuren via className (bv. text-primary).
 */

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  /** Pixelmaat (MUI size-pariteit); default 20. */
  size?: number;
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = 20, ...props }, ref) => (
    <LoaderCircle
      ref={ref}
      role="progressbar"
      size={size}
      className={cn('animate-spin shrink-0', className)}
      {...props}
    />
  )
);
Spinner.displayName = 'Spinner';

export { Spinner };
