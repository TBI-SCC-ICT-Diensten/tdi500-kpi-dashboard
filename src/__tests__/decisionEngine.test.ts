import { describe, it, expect } from 'vitest';
import { evaluateContingent } from '../services/decisionEngine';
import { makeKpis } from '../test/fixtures';

describe('evaluateContingent', () => {
  it('returns good when all KPIs are good', () => {
    const result = evaluateContingent(makeKpis(), 'B2');
    expect(result.overallScore).toBe('good');
    expect(result.details.length).toBeGreaterThan(0);
    expect(result.summary).toContain('goed');
  });

  it('returns poor when any KPI is critical/poor', () => {
    const result = evaluateContingent(
      makeKpis({ copStatus: 'critical', connectStatus: 'good', storingenStatus: 'good' }),
      'B2'
    );
    expect(result.overallScore).toBe('poor');
  });

  it('returns acceptable when any KPI is warning but none critical', () => {
    const result = evaluateContingent(
      makeKpis({ connectStatus: 'warning', connectValue: 80 }),
      'B2'
    );
    expect(result.overallScore).toBe('acceptable');
  });

  it('returns insufficient-data when kpis array is empty', () => {
    const result = evaluateContingent([], 'B2');
    expect(result.overallScore).toBe('insufficient-data');
    expect(result.details).toHaveLength(0);
  });

  it('produces details for each scored factor', () => {
    const result = evaluateContingent(makeKpis(), 'A1');
    expect(result.details.length).toBeGreaterThanOrEqual(3);
    const factors = result.details.map((d) => d.factor);
    expect(factors).toContain('COP Efficiëntie');
    expect(factors).toContain('Connectiviteit');
    expect(factors).toContain('Storingen (TDI 500 KPI)');
  });

  it('each detail has required fields', () => {
    const result = evaluateContingent(makeKpis(), 'B2');
    for (const detail of result.details) {
      expect(detail.factor).toBeTruthy();
      expect(['good', 'acceptable', 'poor']).toContain(detail.score);
      expect(typeof detail.value).toBe('number');
      expect(detail.threshold).toBeTruthy();
      expect(detail.explanation).toBeTruthy();
    }
  });

  it('suggestedAction references poor factors when score is poor', () => {
    const result = evaluateContingent(
      makeKpis({ storingenStatus: 'critical', storingenValue: 5 }),
      'C3'
    );
    expect(result.overallScore).toBe('poor');
    expect(result.suggestedAction.length).toBeGreaterThan(0);
  });

  it('uses different thresholds for different kruisprofielen', () => {
    const kpis = makeKpis({ copValue: 3.2, copStatus: 'good' });
    const resultA1 = evaluateContingent(kpis, 'A1'); // minCop 3.5
    const resultC3 = evaluateContingent(kpis, 'C3'); // minCop 1.8
    // COP 3.2 is below A1 threshold (3.5) but above C3 threshold (1.8)
    const a1Cop = resultA1.details.find((d) => d.factor === 'COP Efficiëntie');
    const c3Cop = resultC3.details.find((d) => d.factor === 'COP Efficiëntie');
    expect(a1Cop?.threshold).toContain('3.5');
    expect(c3Cop?.threshold).toContain('1.8');
  });
});
