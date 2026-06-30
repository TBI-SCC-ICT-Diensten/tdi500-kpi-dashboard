import type { KeyPerformanceIndicator, KruisProfielCode } from '../types/heatpump';
import type { DecisionScore, Recommendation, OverallScore } from '../types/decision';
import { SCORING_THRESHOLDS_BY_PROFIEL, KPI_BANDS } from './scoringConfig';

/**
 * Derives an overall score from an array of individual factor scores.
 * Rule: worst individual score wins.
 *   any 'poor'       → overall 'poor'
 *   any 'acceptable' → overall 'acceptable'
 *   all 'good'       → overall 'good'
 */
const deriveOverallScore = (scores: DecisionScore[]): OverallScore => {
  if (scores.length === 0) return 'insufficient-data';
  if (scores.some((s) => s.score === 'poor')) return 'poor';
  if (scores.some((s) => s.score === 'acceptable')) return 'acceptable';
  return 'good';
};

/**
 * Maps an overall score to a Dutch one-line summary.
 */
const generateSummary = (score: OverallScore): string => {
  switch (score) {
    case 'good':
      return 'Dit contingent presteert goed. Het huidige installatieconcept is geschikt.';
    case 'acceptable':
      return 'Dit contingent presteert acceptabel. Enkele factoren verdienen aandacht.';
    case 'poor':
      return 'Dit contingent presteert ondermaats. Het installatieconcept vereist herziening.';
    case 'insufficient-data':
      return 'Onvoldoende data om een betrouwbare aanbeveling te geven.';
  }
};

/**
 * Maps an overall score to a Dutch suggested action.
 */
const generateAction = (score: OverallScore, details: DecisionScore[]): string => {
  switch (score) {
    case 'good':
      return 'Huidig concept voortzetten. Geen directe wijzigingen nodig.';
    case 'acceptable': {
      const poorFactors = details
        .filter((d) => d.score === 'acceptable')
        .map((d) => d.factor)
        .join(', ');
      return `Overweeg optimalisatie van: ${poorFactors}. Controleer de inregelinstellingen.`;
    }
    case 'poor': {
      const poorFactors = details
        .filter((d) => d.score === 'poor')
        .map((d) => d.factor)
        .join(', ');
      return `Installatieconcept heroverwegen. Kritieke factoren: ${poorFactors}.`;
    }
    case 'insufficient-data':
      return 'Wacht tot meer warmtepompdata beschikbaar is via de Hupie API.';
  }
};

/**
 * Evaluates the KPIs for a contingent and produces a structured recommendation.
 *
 * Pure function — no side effects, no API calls.
 * Thresholds sourced exclusively from SCORING_THRESHOLDS_BY_PROFIEL.
 *
 * Source: TDI 500 TNO Activity 2.1 — Catalogus inregelinstellingen (October 2025)
 */
export const evaluateContingent = (
  kpis: KeyPerformanceIndicator[],
  kruisProfielCode: KruisProfielCode
): Recommendation => {
  // Insufficient data guard
  if (kpis.length === 0) {
    return {
      overallScore: 'insufficient-data',
      summary: generateSummary('insufficient-data'),
      details: [],
      suggestedAction: generateAction('insufficient-data', []),
    };
  }

  const thresholds = SCORING_THRESHOLDS_BY_PROFIEL[kruisProfielCode];
  const details: DecisionScore[] = [];

  // ── Factor 1: COP Efficiëntie ────────────────────────────────────────────
  const copKpi = kpis.find((k) => k.category === 'efficiency');
  if (copKpi) {
    // If value is 0 and status is warning, no real COP data available
    if (copKpi.value === 0 && copKpi.status === 'warning') {
      details.push({
        factor: 'COP Efficiëntie',
        score: 'acceptable',
        value: 0,
        unit: '',
        threshold: `> ${thresholds.minCop} = goed`,
        explanation: 'Geen COP-data beschikbaar via de Hupie API. Kan niet beoordeeld worden.',
      });
    } else {
      const score: DecisionScore['score'] =
        copKpi.status === 'good' ? 'good' :
        copKpi.status === 'warning' ? 'acceptable' : 'poor';

      details.push({
        factor: 'COP Efficiëntie',
        score,
        value: copKpi.value,
        unit: '',
        threshold: `> ${thresholds.minCop} = goed, > ${(thresholds.minCop * KPI_BANDS.copWarningFactor).toFixed(1)} = acceptabel`,
        explanation:
          score === 'good'
            ? `COP van ${copKpi.value.toFixed(2)} voldoet aan de profieldrempel (min. ${thresholds.minCop}).`
            : score === 'acceptable'
            ? `COP van ${copKpi.value.toFixed(2)} ligt onder de drempel (min. ${thresholds.minCop}) maar is acceptabel.`
            : `COP van ${copKpi.value.toFixed(2)} is te laag voor profiel ${kruisProfielCode} (min. ${thresholds.minCop}).`,
      });
    }
  }

  // ── Factor 2: Connectiviteit ──────────────────────────────────────────────
  const connectivityKpi = kpis.find((k) => k.category === 'reliability');
  if (connectivityKpi) {
    const score: DecisionScore['score'] =
      connectivityKpi.status === 'good' ? 'good' :
      connectivityKpi.status === 'warning' ? 'acceptable' : 'poor';

    details.push({
      factor: 'Connectiviteit',
      score,
      value: connectivityKpi.value,
      unit: '%',
      threshold: `${KPI_BANDS.connectivityGoodPct}% = goed, ≥ ${KPI_BANDS.connectivityAcceptablePct}% = acceptabel, < ${KPI_BANDS.connectivityAcceptablePct}% = slecht`,
      explanation:
        score === 'good'
          ? `Alle warmtepompen (${connectivityKpi.value}%) zijn online en rapporteren data.`
          : score === 'acceptable'
          ? `${connectivityKpi.value}% van de warmtepompen is online. Controleer de offline installaties.`
          : `Slechts ${connectivityKpi.value}% van de warmtepompen is online. Kritiek probleem.`,
    });
  }

  // ── Factor 3: Storingen (TDI 500 KPI #2) ─────────────────────────────────
  const storingenKpi = kpis.find(
    (k) => k.category === 'commissioning' && k.name === 'Storingen'
  );
  if (storingenKpi) {
    const score: DecisionScore['score'] =
      storingenKpi.status === 'good' ? 'good' :
      storingenKpi.status === 'warning' ? 'acceptable' : 'poor';

    details.push({
      factor: 'Storingen (TDI 500 KPI)',
      score,
      value: storingenKpi.value,
      unit: 'meldingen',
      threshold: `${thresholds.maxHighSeverityErrors} = goed, ≤ ${KPI_BANDS.storingenAcceptableMax} = acceptabel, > ${KPI_BANDS.storingenAcceptableMax} = slecht`,
      explanation:
        score === 'good'
          ? 'Geen actieve storingen met hoge prioriteit. Inregelinstellingen functioneren correct.'
          : score === 'acceptable'
          ? `${storingenKpi.value} storing(en) actief. Controleer de foutmeldingen per warmtepomp.`
          : `${storingenKpi.value} storingen actief. De inregelinstellingen veroorzaken problemen.`,
    });
  }

  // Insufficient data if no factors could be scored
  if (details.length === 0) {
    return {
      overallScore: 'insufficient-data',
      summary: generateSummary('insufficient-data'),
      details: [],
      suggestedAction: generateAction('insufficient-data', []),
    };
  }

  const overallScore = deriveOverallScore(details);

  return {
    overallScore,
    summary: generateSummary(overallScore),
    details,
    suggestedAction: generateAction(overallScore, details),
  };
};
