import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DecisionSupportCard from '../components/dashboard/DecisionSupportCard';
import { DashboardProvider } from '../context/DashboardContext';
import type { KeyPerformanceIndicator } from '../types/heatpump';

/**
 * DecisionSupportCard — shell-closure. Sluit samen met #200 de leaves-only-schuld:
 * de leaves waren al gemigreerd (DecisionFactorRow #176, Button #178, Card +
 * Separator #180, Alerts #201); dit sluit de SHELL zelf.
 *
 * EERSTE CARDHEADER-GEBRUIK — de has-header-tak van het gestructureerde
 * shell-patroon (#200 zette de zonder-header-tak: Card + CardContent, GEEN
 * CardHeader, want het MUI-origineel had er geen). DSC heeft wél een echte
 * in-kaart-header, dus hier landen CardHeader/CardTitle/CardDescription.
 *
 * Twee fideliteits-punten die dit test bewaakt:
 *  • CardHeader is stock een KOLOM (flex flex-col) — DSC's header is een RIJ
 *    (Sparkles NAAST de titel). Zonder de flex-row-override stapelt het icoon
 *    BOVEN de tekst. twMerge ruimt flex-col/space-y-1.5/p-6 op.
 *  • CardTitle is stock `leading-none` (16px) waar MUI subtitle1 1.75 (28px)
 *    is — ongecorrigeerd krimpt het headerblok 12px, zichtbaar. `leading-7` is
 *    dus DRAGEND, niet cosmetisch. Idem tracking-normal (stock: tracking-tight).
 *
 * Padding-rekensom (byte-identiek aan de oude `<Card className="p-4">` + mb-2):
 * CardHeader p-4 pb-0 → 16px boven/zij, 0 onder; CardContent p-4 → 16px boven
 * = precies de oude `mb: 2` tussen headertekst en Separator.
 *
 * De verdict-Chip is hier gespanificeerd: statisch, zónder palet-semantiek
 * (de enige van 6 Chip-sites zonder `color=`), dus geen lid van de
 * severity-familie die een toekomstig Chip-primitief bedient. Volgt het
 * StatusPill-patroon (handgerolde span) + de vastgelegde 2xs-chipmaat.
 * jsdom bewijst class-strings; pixels bewijst de (dark-)e2e.
 */

const goodKpi: KeyPerformanceIndicator = {
  id: 'cop',
  name: 'COP',
  value: 4.2,
  unit: '',
  category: 'efficiency',
  status: 'good',
};

const renderCard = (kpis: KeyPerformanceIndicator[] = [goodKpi]) => {
  render(
    <DashboardProvider>
      <DecisionSupportCard kpis={kpis} />
    </DashboardProvider>
  );
  return screen.getByTestId('decision-card');
};

describe('DecisionSupportCard — shell-closure (Card + CardHeader)', () => {
  it('de Card-shell is onveranderd het flat shadcn-primitief; de padding zit nu in de subcomponenten', () => {
    const card = renderCard();

    // #180-edits + de #198-border-solid — komen gratis uit het primitief.
    expect(card).toHaveClass(
      'rounded', 'border', 'border-solid', 'border-border', 'bg-card', 'text-card-foreground'
    );
    expect(card.className).not.toContain('shadow');

    // De p-4 is VERHUISD van de Card naar CardHeader/CardContent — de Card
    // zelf draagt geen padding meer (anders telt die dubbel).
    expect(card.className).not.toMatch(/\bp-4\b/);
  });

  it('CardHeader is een RIJ: Sparkles NAAST de titel, niet erboven (flex-row-override)', () => {
    const card = renderCard();
    const header = card.firstElementChild as HTMLElement;

    // De rij-override; flex-col MOET door twMerge zijn opgeruimd, anders
    // stapelt het icoon boven de tekst.
    expect(header).toHaveClass('flex', 'flex-row', 'items-center', 'gap-3');
    expect(header.className).not.toMatch(/\bflex-col\b/);

    // space-y-1.5 (stock kolomritme) zou in een rij een top-marge op het
    // tekstblok zetten — moet naar 0.
    expect(header).toHaveClass('space-y-0');
    expect(header.className).not.toMatch(/\bspace-y-1\.5\b/);

    // Padding-fideliteit: 16px boven/zij, 0 onder (de 16px onder komt uit
    // CardContent's p-4) — NIET shadcn's p-6-default.
    expect(header).toHaveClass('p-4', 'pb-0');
    expect(header.className).not.toMatch(/\bp-6\b/);

    // Icoon en tekstblok zijn SIBLINGS in de rij — het bewijs van "naast".
    expect(header.children).toHaveLength(2);
    const icon = header.firstElementChild as unknown as HTMLElement;
    expect(icon.tagName.toLowerCase()).toBe('svg');
    expect(icon).toHaveClass('shrink-0', 'text-primary');
  });

  it('CardTitle/CardDescription dragen de MUI-metriek (subtitle1 / caption)', () => {
    renderCard();
    const title = screen.getByText('Installatieadvies');

    // subtitle1 = 1rem / lineHeight 1.75 (28px) / gewicht 600 / normale tracking.
    expect(title).toHaveClass('text-base', 'leading-7', 'tracking-normal', 'font-semibold');

    // DRAGEND: stock leading-none (16px) zou het headerblok 12px laten krimpen;
    // stock tracking-tight (-0.025em) wijkt af van subtitle1. Beide weg.
    expect(title.className).not.toMatch(/\bleading-none\b/);
    expect(title.className).not.toMatch(/\btracking-tight\b/);

    // caption = 0.75rem (text-xs), niet shadcn's text-sm (= body2, 0.8125rem).
    // text-muted-foreground is de vastgelegde text.secondary-stand-in.
    const description = screen.getByText(/Beslissingsondersteuning op basis van TDI 500/);
    expect(description).toHaveClass('text-xs', 'text-muted-foreground');
    expect(description.className).not.toMatch(/\btext-sm\b/);

    // ÓÓK DRAGEND: de MUI-caption was een INLINE span, dus zijn regelbox kwam
    // van de strut van de omliggende div (24px), niet van caption's eigen
    // 1.66. Als blok-div zou text-xs' eigen 18px de header — en de hele kaart
    // — 6px korter maken. leading-6 herstelt die 24px.
    expect(description).toHaveClass('leading-6');

    // GEEN font-sans in de header: die zou Lato forceren terwijl de rest van
    // de kaart tijdens de coëxistentie nog Inter (MUI Typography) is.
    expect(title.className).not.toMatch(/\bfont-sans\b/);
    expect(description.className).not.toMatch(/\bfont-sans\b/);
  });

  it('CardContent draagt p-4 (16px rondom = de oude Card-padding), niet p-6 pt-0', () => {
    const card = renderCard();
    const content = card.children[1] as HTMLElement;

    expect(content).toHaveClass('p-4');
    expect(content.className).not.toMatch(/\bp-6\b|\bpt-0\b/);

    // De :51-Separator staat nog bovenin de content, ongewijzigd mb-4.
    const separator = content.querySelector('[data-orientation="horizontal"]');
    expect(separator).not.toBeNull();
    expect(separator).toHaveClass('bg-border', 'mb-4');
  });

  it('het verdict is een span-pil (MUI Chip weg), met behoud van testid en tekstknoop', () => {
    renderCard();
    const verdict = screen.getByTestId('decision-verdict');

    // e2e-contract (dashboard.e2e.ts): zichtbaar + de label-tekst.
    expect(verdict.tagName.toLowerCase()).toBe('span');
    expect(verdict).toHaveTextContent('Goed');

    // MUI small-chip-pariteit: 24px hoog, pil, 8px label-padding, de
    // paper-surface op de gevulde banner, 2xs = de vastgelegde chipmaat.
    expect(verdict).toHaveClass(
      'inline-flex', 'h-6', 'shrink-0', 'items-center',
      'rounded-full', 'bg-card', 'px-2', 'text-2xs', 'font-semibold', 'text-card-foreground'
    );

    // Inter, net als de omringende MUI-tekst op de banner.
    expect(verdict.className).not.toMatch(/\bfont-sans\b/);

    // De MUI Chip is écht weg (geen chip-root meer in de kaart).
    expect(screen.getByTestId('decision-card').querySelector('.MuiChip-root')).toBeNull();
  });

  it('de rest van de kaart is ongewijzigd: banner, factoranalyse en disclaimer', () => {
    const card = renderCard();

    // De gevulde banner (#201) met het oordeel-label.
    expect(card).toHaveTextContent('Algeheel oordeel:');
    expect(card).toHaveTextContent('Dit contingent presteert goed.');

    // De factor-leaf (#176) rendert nog steeds binnen de shell.
    expect(card.querySelector('[data-testid="decision-factor"]')).not.toBeNull();

    // De altijd-zichtbare disclaimer-Alert (#201).
    expect(card).toHaveTextContent(/De installateur\s+blijft verantwoordelijk/);
  });

  it('zonder KPIs blijft het insufficient-data-pad intact (info-banner + eigen label)', () => {
    const card = renderCard([]);

    expect(screen.getByTestId('decision-verdict')).toHaveTextContent('Onvoldoende data');
    expect(card.querySelector('[data-testid="decision-factor"]')).toBeNull();
  });
});
