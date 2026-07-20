import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Spinner from '../components/common/Spinner';

/**
 * Cluster C6 (Tier-1-run): de paginalader common/Spinner — zijn
 * CircularProgress → owned ui-Spinner (48px, TNO text-primary — het
 * #178-rebrand-precedent voor de oude MUI-primary-arc). Box/Typography
 * blijven MUI (Tier 2). TDD-eerst; class-smoke (playbook §5).
 */

const renderSpinner = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <Spinner message="Laden..." data-testid="loading-spinner" />
    </ThemeProvider>
  );

describe('common/Spinner — C6-migratie (owned ui-Spinner)', () => {
  it('de testid-doorgifte blijft (het slow-response-e2e-contract)', () => {
    renderSpinner();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Laden...')).toBeInTheDocument();
  });

  it('de arc is de owned Spinner: svg met progressbar-rol, animate-spin, 48px, TNO-primary', () => {
    renderSpinner();
    const arc = screen.getByRole('progressbar');
    expect(arc.tagName.toLowerCase()).toBe('svg');
    expect(arc.getAttribute('class')).toContain('animate-spin');
    expect(arc.getAttribute('class')).toContain('text-primary');
    expect(arc).toHaveAttribute('width', '48');
    expect(document.querySelector('.MuiCircularProgress-root')).toBeNull();
  });
});
