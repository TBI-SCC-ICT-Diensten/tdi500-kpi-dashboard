// ── TDI 500 Decision Support Types ──────────────────────────────────────────

export type OverallScore = 'good' | 'acceptable' | 'poor' | 'insufficient-data';

export interface DecisionScore {
  factor: string;           // Dutch display name, e.g. "COP Efficiëntie"
  score: 'good' | 'acceptable' | 'poor';
  value: number;            // actual measured value
  unit: string;             // display unit, e.g. "" for COP, "%" for connectivity
  threshold: string;        // Dutch description of threshold, e.g. "> 2,5 = goed"
  explanation: string;      // Dutch sentence explaining the score
}

export interface Recommendation {
  overallScore: OverallScore;
  summary: string;          // one-line Dutch summary
  details: DecisionScore[]; // per-factor breakdown
  suggestedAction: string;  // Dutch recommended next step
}
