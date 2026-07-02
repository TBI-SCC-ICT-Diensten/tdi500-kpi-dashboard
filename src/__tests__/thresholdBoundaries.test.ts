import { describe, it, expect } from 'vitest';
import {
  calculateCopKpi,
  calculateConnectivityKpi,
  calculateStoringenKpi,
} from '../services/kpiAggregator';
import { evaluateContingent } from '../services/decisionEngine';
import { makeKpis } from '../test/fixtures';
import type { HeatPumpSystem } from '../types/heatpump';
import type { ScoringThresholds } from '../services/scoringConfig';

/**
 * DUP-3 boundary / characterization spec.
 *
 * The COP 0.85 band, the Storingen <=2 cutoff and the connectivity 80/100 cutoffs
 * each live BOTH as a real comparison in kpiAggregator AND as a display string in
 * decisionEngine. The two copies are currently VALUE-IDENTICAL (see PR notes), and
 * decisionEngine maps each factor's score from the KPI *status* — it does not
 * recompute from the value — so badge and advice cannot disagree at runtime.
 *
 * These boundary assertions pin BOTH copies. PR-4 (centralising the literals) must
 * keep every status here AND every decisionEngine threshold string byte-for-byte.
 */

const T: ScoringThresholds = {
  minCop: 3.0,
  maxSupplyTemperatureCelsius: 55,
  maxWaterPressureBar: 2.5,
  maxHighSeverityErrors: 0,
};

const copHp = (value: number): HeatPumpSystem => ({
  id: 'hp',
  uri: 'u',
  status: 'active',
  measurements: [{ property: 'cop', value, unit: '', rawUnit: '' }],
  errorCodes: [],
});

const pumps = (online: number, offline: number): HeatPumpSystem[] => [
  ...Array.from({ length: online }, (_, i): HeatPumpSystem => ({
    id: `on-${i}`, uri: 'u', status: 'active', measurements: [], errorCodes: [],
  })),
  ...Array.from({ length: offline }, (_, i): HeatPumpSystem => ({
    id: `off-${i}`, uri: 'u', status: 'offline', measurements: [], errorCodes: [],
  })),
];

const storingHp = (severities: string[]): HeatPumpSystem => ({
  id: 'hp',
  uri: 'u',
  status: 'active',
  measurements: [],
  errorCodes: severities.map((severity, i) => ({ code: `E${i}`, message: 'x', severity })),
});

// ─────────────────────────── kpiAggregator: real comparisons ───────────────────────────

describe('kpiAggregator COP band (minCop=3.0 -> good>=3.0, warning>=2.55, else critical)', () => {
  it('>= minCop is good (at)', () => expect(calculateCopKpi([copHp(3.0)], T).status).toBe('good'));
  it('just below minCop is warning', () => expect(calculateCopKpi([copHp(2.99)], T).status).toBe('warning'));
  it('at minCop*0.85 (2.55) is warning', () => expect(calculateCopKpi([copHp(2.55)], T).status).toBe('warning'));
  it('just below minCop*0.85 is critical', () => expect(calculateCopKpi([copHp(2.54)], T).status).toBe('critical'));
  // CHARACTERIZATION: a genuine COP of 0 is treated as "no data" -> warning (the
  // `averageCop === 0` branch wins before the >= comparisons). Suspected quirk, not
  // necessarily a bug — documented, not "fixed".
  it('exactly 0 reads as no-data warning, not critical', () =>
    expect(calculateCopKpi([copHp(0)], T).status).toBe('warning'));
});

describe('kpiAggregator connectivity (good===100, warning>=80, else critical)', () => {
  it('100% is good', () => expect(calculateConnectivityKpi(pumps(5, 0)).status).toBe('good'));
  it('99% is warning', () => expect(calculateConnectivityKpi(pumps(99, 1)).status).toBe('warning'));
  it('80% is warning (at)', () => expect(calculateConnectivityKpi(pumps(4, 1)).status).toBe('warning'));
  it('79% is critical (just below)', () => expect(calculateConnectivityKpi(pumps(79, 21)).status).toBe('critical'));
  // CHARACTERIZATION: percentage is Math.round(online/total*100) and good is `=== 100`,
  // so 99.5% rounds up to 100 -> good. 199/200 online therefore reads 'good'.
  it('99.5% rounds up to 100 -> good', () => {
    const kpi = calculateConnectivityKpi(pumps(199, 1));
    expect(kpi.value).toBe(100);
    expect(kpi.status).toBe('good');
  });
});

describe('kpiAggregator storingen (good===0, warning<=2, else critical)', () => {
  it('0 high-severity is good', () => expect(calculateStoringenKpi([storingHp([])]).status).toBe('good'));
  it('1 is warning', () => expect(calculateStoringenKpi([storingHp(['high'])]).status).toBe('warning'));
  it('2 is warning (at)', () => expect(calculateStoringenKpi([storingHp(['high', 'critical'])]).status).toBe('warning'));
  it('3 is critical (just above)', () =>
    expect(calculateStoringenKpi([storingHp(['high', 'high', 'critical'])]).status).toBe('critical'));
  // CHARACTERIZATION: only 'high' and 'critical' severities count; 'error'/'warning'
  // are ignored, so a pump whose only fault is severity 'error' yields 0 -> good.
  it('severity "error"/"warning" are NOT counted as storingen', () =>
    expect(calculateStoringenKpi([storingHp(['error', 'warning', 'low'])]).value).toBe(0));
});

// ─────────────────────────── decisionEngine: display strings (mapped from status) ───────────────────────────

const copDetail = (code: Parameters<typeof evaluateContingent>[1], over = {}) =>
  evaluateContingent(makeKpis(over), code).details.find((d) => d.factor === 'COP Efficiëntie');
const connDetail = (over = {}) =>
  evaluateContingent(makeKpis(over), 'B2').details.find((d) => d.factor === 'Connectiviteit');
const storDetail = (over = {}) =>
  evaluateContingent(makeKpis(over), 'B2').details.find((d) => d.factor === 'Storingen (TDI 500 KPI)');

describe('decisionEngine threshold strings (the byte-for-byte spec PR-4 must preserve)', () => {
  it('COP string embeds minCop and minCop*0.85 (toFixed 1) per profile', () => {
    expect(copDetail('B2')?.threshold).toBe('> 2.5 = goed, > 2.1 = acceptabel'); // 2.5*0.85=2.125 -> "2.1"
    expect(copDetail('A1')?.threshold).toBe('> 3.5 = goed, > 3.0 = acceptabel'); // 3.5*0.85=2.975 -> "3.0"
    expect(copDetail('C3')?.threshold).toBe('> 1.8 = goed, > 1.5 = acceptabel'); // 1.8*0.85=1.53 -> "1.5"
  });
  it('connectivity string is the fixed 100/80 spec', () => {
    expect(connDetail()?.threshold).toBe('100% = goed, ≥ 80% = acceptabel, < 80% = slecht');
  });
  it('storingen string is the fixed maxHighSeverityErrors/2 spec', () => {
    expect(storDetail()?.threshold).toBe('0 = goed, ≤ 2 = acceptabel, > 2 = slecht');
  });
});

describe('decisionEngine status->score mapping (good->good, warning->acceptable, critical->poor)', () => {
  it('maps each KPI status onto the factor score', () => {
    expect(connDetail({ connectStatus: 'good' })?.score).toBe('good');
    expect(connDetail({ connectStatus: 'warning' })?.score).toBe('acceptable');
    expect(connDetail({ connectStatus: 'critical' })?.score).toBe('poor');
  });
  // CHARACTERIZATION: the special no-COP-data branch (value 0 + status warning) is
  // scored 'acceptable' with a goed-only threshold string and a fixed explanation.
  it('no-COP-data branch is acceptable with a goed-only threshold', () => {
    const d = copDetail('B2', { copValue: 0, copStatus: 'warning' });
    expect(d?.score).toBe('acceptable');
    expect(d?.threshold).toBe('> 2.5 = goed');
    expect(d?.explanation).toContain('Geen COP-data beschikbaar');
  });
});
