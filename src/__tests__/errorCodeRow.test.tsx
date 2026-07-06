import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorCodeRow from '../components/detail/ErrorCodeRow';
import type { ErrorCodeWithTermijn } from '../hooks/useHeatPumpDetail';

/**
 * ErrorCodeRow — tweede gemigreerde component, volgt het #172-testpatroon:
 * gedrag via gerenderde tekst, data-*-hooks, enkele dragende classes — geen
 * uitputtende class-lijsten. NB jsdom draait geen CSS-pijplijn: dit bewijst
 * class-STRINGS; licht-modus-pixels bewijst de Playwright e2e, de
 * dark:-varianten renderen pas na de dark-unificatie.
 */

const make = (severity: string, termijnStatus: 'direct' | 'open' | 'overschreden' = 'open'): ErrorCodeWithTermijn => ({
  errorCode: {
    code: 'E42',
    message: 'Druksensor buiten bereik',
    severity,
  },
  termijn: {
    severity,
    termijnDagen: termijnStatus === 'direct' ? 0 : 14,
    resolveBy: null,
    status: termijnStatus,
    label: termijnStatus === 'direct' ? 'Direct oplossen' : 'Binnen 14 dagen',
  },
});

describe('ErrorCodeRow — ernst-bucketing → tier-classes', () => {
  it.each([
    { severity: 'critical', semantic: 'danger',  classes: ['bg-danger-100', 'text-danger-800', 'dark:text-danger-300', 'border-danger-600'] },
    { severity: 'warning',  semantic: 'warning', classes: ['bg-warning-100', 'text-warning-800', 'border-warning-600'] },
    { severity: 'low',      semantic: 'offline', classes: ['bg-slate-100', 'text-slate-600', 'dark:bg-overlay-10'] },
    { severity: 'vreemd',   semantic: 'offline', classes: ['bg-slate-100'] }, // onbekende ernst → neutrale tier
  ])('$severity → data-severity=$semantic met tier-classes', ({ severity, semantic, classes }) => {
    render(<ErrorCodeRow errorCodeWithTermijn={make(severity)} />);
    const row = screen.getByTestId('pump-error-code');
    expect(row).toHaveAttribute('data-severity', semantic);
    expect(row).toHaveClass('border-l-3', 'rounded-r', ...classes);
  });

  it('rendert code, melding en de solide ernst-chip (main-600, witte tekst, native title)', () => {
    render(<ErrorCodeRow errorCodeWithTermijn={make('critical')} />);
    expect(screen.getByText('E42')).toBeInTheDocument();
    expect(screen.getByText('Druksensor buiten bereik')).toBeInTheDocument();
    const chip = screen.getByText('critical');
    expect(chip).toHaveClass('bg-danger-600', 'text-white');
    expect(chip).toHaveAttribute('title', 'Ernst: critical');
  });

  it('oplostermijn-chip gebruikt de TEXT-SAFE -700-stap (open → warning)', () => {
    render(<ErrorCodeRow errorCodeWithTermijn={make('low', 'open')} />);
    const termijn = screen.getByTestId('pump-oplostermijn');
    expect(termijn).toHaveTextContent('Binnen 14 dagen');
    expect(termijn).toHaveClass('text-warning-700', 'border-warning-600', 'dark:text-warning-300');
  });

  it('oplostermijn direct/overschreden → danger text-safe', () => {
    render(<ErrorCodeRow errorCodeWithTermijn={make('warning', 'direct')} />);
    const termijn = screen.getByTestId('pump-oplostermijn');
    expect(termijn).toHaveTextContent('Direct oplossen');
    expect(termijn).toHaveClass('text-danger-700', 'border-danger-600');
  });

  it('waarschuwingsicoon is inline SVG op currentColor (erft de tint-tekstkleur)', () => {
    render(<ErrorCodeRow errorCodeWithTermijn={make('warning')} />);
    const icon = screen.getByTestId('pump-error-code').querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('fill', 'currentColor');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
