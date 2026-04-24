/**
 * TNO TDI 500 catalogus — standaard inregelinstellingen per kruisprofiel.
 *
 * Source: TNO 2025 R00000, Activiteit 2.1, chapter 3.3 Catalogus.
 * Data supplied by fabrikanten oktober 2024, verified februari 2026.
 *
 * Each kruisprofiel has settings from 4 fabrikanten:
 * Intergas, Bosch, Remeha, Alklima.
 *
 * Values represented as `null` correspond to 'X' in the source document,
 * meaning the fabrikant did not submit a value for that parameter.
 * Do NOT interpret null as zero or replace with a default.
 *
 * Note from source: "De inregelinstellingen in dit rapport worden niet
 * actueel gehouden; zij zijn in oktober 2024 door de fabrikanten
 * aangeleverd en in februari 2026 bij deze fabrikanten geverifieerd."
 *
 * For a kruisprofiel overview with max temps and descriptions, see
 * ../config/kruisProfielen.ts.
 */

import type {
  TnoCatalogus,
  CatalogusProfiel,
  KruisProfielCode,
  Fabrikant,
  FabrikantInstellingen,
} from '../types/heatpump';

/**
 * The complete catalogus. Below is one object literal per kruisprofiel.
 * Kept in A1..C3 order to match the TNO document sequence.
 */
export const TNO_CATALOGUS: TnoCatalogus = {
  // ── Tabel 1 — Profiel A1 (Goed geïsoleerd, vloerverwarming ≤30°C) ─────────
  A1: {
    Intergas: {
      warmtepompType:        'xtend',
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: 30,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Bosch: {
      warmtepompType:        'compress 3400i compress 7400i',
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: 45,
      minimaleCop:           'Model afh.',
      stooklijn:             '20/20, -10/30',
      ruimteInvloed:         '1K',
      vrijgaveBijverwarming: '0gr',
      wachttijdBackupMin:    'Instelbaar (300K/°/min)',
      hybrideModus:          'Instelbaar (hybride)',
      deltaT:                '7K',
      bivalentTemperatuur:   'Variable (vrijgave: 0-5gr)',
    },
    Remeha: {
      warmtepompType:        null,
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             '0,3',
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    120,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Alklima: {
      warmtepompType:        'ERST20D-VM2E',
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          'ERSD-VM2E',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
  },

  // ── Tabel 2 — Profiel A2 (Goed geïsoleerd, radiator 30–55°C) ──────────────
  A2: {
    Intergas: {
      warmtepompType:        'xtend',
      afgiftesysteem:        'radiator',
      maxAanvoertemperatuur: 55,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Bosch: {
      warmtepompType:        'compress 3400i compress 7400i',
      afgiftesysteem:        'radiatoren/ vloerverw.',
      maxAanvoertemperatuur: 55,
      minimaleCop:           'Model afh.',
      stooklijn:             '20/20, -10/45',
      ruimteInvloed:         '1K',
      vrijgaveBijverwarming: '0gr',
      wachttijdBackupMin:    'instelbaar (300K/°/min)',
      hybrideModus:          'Instelbaar (hybride)',
      deltaT:                '7K',
      bivalentTemperatuur:   'Variable (vrijgave: 5gr)',
    },
    Remeha: {
      warmtepompType:        null,
      afgiftesysteem:        'radiator',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             '0,8',
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    120,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Alklima: {
      warmtepompType:        'ERST20D-VM2E',
      afgiftesysteem:        'radiator',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          'ERSD-VM2E',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
  },

  // ── Tabel 3 — Profiel A3 (Goed geïsoleerd, hete lucht ≥55°C) ──────────────
  A3: {
    Intergas: {
      warmtepompType:        'xtend',
      afgiftesysteem:        'hete lucht',
      maxAanvoertemperatuur: 80,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Bosch: {
      warmtepompType:        'Compress 3400i compress 7400i',
      afgiftesysteem:        'radiatoren',
      maxAanvoertemperatuur: 65,
      minimaleCop:           'model afh.',
      stooklijn:             '20/20, -10/55',
      ruimteInvloed:         '1K',
      vrijgaveBijverwarming: '0gr',
      wachttijdBackupMin:    'instelbaar (300K/°/min)',
      hybrideModus:          'instelbaar (hybride)',
      deltaT:                '7K',
      bivalentTemperatuur:   'Variabel (vrijgave: 5gr)',
    },
    Remeha: {
      warmtepompType:        null,
      afgiftesysteem:        'hete lucht',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             '1,5',
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    30,
      hybrideModus:          'Kosten',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Alklima: {
      warmtepompType:        'ERST20F-VM2E',
      afgiftesysteem:        'hete lucht',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          'ERSF-VM2E',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
  },

  // ── Tabel 4 — Profiel B1 (Matig geïsoleerd, vloerverwarming ≤30°C) ────────
  B1: {
    Intergas: {
      warmtepompType:        'xtend',
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: 30,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Bosch: {
      warmtepompType:        'compress 3400i compress 7400i',
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: 45,
      minimaleCop:           'model afh.',
      stooklijn:             '20/20, -10/30',
      ruimteInvloed:         '2k',
      vrijgaveBijverwarming: '5gr',
      wachttijdBackupMin:    'instelbaar (300K/°/min)',
      hybrideModus:          'instelbaar (hybride)',
      deltaT:                '7K',
      bivalentTemperatuur:   'Variabel (vrijgave: 5gr)',
    },
    Remeha: {
      warmtepompType:        null,
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             '0,3',
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    120,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Alklima: {
      warmtepompType:        'ERST20D-VM2E',
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          'ERSD-VM2E',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
  },

  // ── Tabel 5 — Profiel B2 (Matig geïsoleerd, radiator 30–55°C) ─────────────
  B2: {
    Intergas: {
      warmtepompType:        'xtend',
      afgiftesysteem:        'radiator',
      maxAanvoertemperatuur: 55,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Bosch: {
      warmtepompType:        'Compress 3400i compress 7400i',
      afgiftesysteem:        'radiatoren/ vloerverw',
      maxAanvoertemperatuur: '55gr',
      minimaleCop:           'model afh.',
      stooklijn:             '20/22, -10/45',
      ruimteInvloed:         '4k',
      vrijgaveBijverwarming: '5gr',
      wachttijdBackupMin:    'instelbaar (300K/°/min)',
      hybrideModus:          'instelbaar (hybride)',
      deltaT:                '7K',
      bivalentTemperatuur:   'Variabel (vrijgave: 5gr)',
    },
    Remeha: {
      warmtepompType:        null,
      afgiftesysteem:        'radiator',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             '1,1',
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    120,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Alklima: {
      warmtepompType:        'ERST20F-VM2E',
      afgiftesysteem:        'radiator',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          'ERSF-VM2E',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
  },

  // ── Tabel 6 — Profiel B3 (Matig geïsoleerd, hete lucht ≥55°C) ─────────────
  B3: {
    Intergas: {
      warmtepompType:        'xtend',
      afgiftesysteem:        'hete lucht',
      maxAanvoertemperatuur: 80,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Bosch: {
      warmtepompType:        'compress 3400i compress 7400i',
      afgiftesysteem:        'radiatoren',
      maxAanvoertemperatuur: '75gr',
      minimaleCop:           'model afh.',
      stooklijn:             '20/22, -10/60',
      ruimteInvloed:         '6k',
      vrijgaveBijverwarming: '5gr',
      wachttijdBackupMin:    'instelbaar (300K/°/min)',
      hybrideModus:          'instelbaar (hybride)',
      deltaT:                '7K',
      bivalentTemperatuur:   'Variabel (vrijgave: 5gr)',
    },
    Remeha: {
      warmtepompType:        null,
      afgiftesysteem:        'hete lucht',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             '1,5',
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    30,
      hybrideModus:          'Kosten',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Alklima: {
      warmtepompType:        'ERST20F-VM2E',
      afgiftesysteem:        'hete lucht',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          'ERSF-VM2E',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
  },

  // ── Tabel 7 — Profiel C1 (Slecht geïsoleerd, vloerverwarming ≤30°C) ───────
  C1: {
    Intergas: {
      warmtepompType:        'xtend',
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: 30,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Bosch: {
      warmtepompType:        'Compress 3400i compress 7400i',
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: '45gr',
      minimaleCop:           'model afh.',
      stooklijn:             '20/20, -10/30',
      ruimteInvloed:         '2k',
      vrijgaveBijverwarming: '7gr',
      wachttijdBackupMin:    'instelbaar (300K/°/min)',
      hybrideModus:          'instelbaar (hybride)',
      deltaT:                '7K',
      bivalentTemperatuur:   'Variabel (vrijgave: 5gr)',
    },
    Remeha: {
      warmtepompType:        null,
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             '0,3',
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    120,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Alklima: {
      warmtepompType:        'ERST20F-VM2E',
      afgiftesysteem:        'vloerverw',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          'ERSF-VM2E',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
  },

  // ── Tabel 8 — Profiel C2 (Slecht geïsoleerd, radiator 30–55°C) ────────────
  C2: {
    Intergas: {
      warmtepompType:        'xtend',
      afgiftesysteem:        'radiator',
      maxAanvoertemperatuur: 55,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Bosch: {
      warmtepompType:        'compress 3400i compress 7400i',
      afgiftesysteem:        'radiatoren/ vloerverw.',
      maxAanvoertemperatuur: '60gr',
      minimaleCop:           'model afh.',
      stooklijn:             '20/26, -10/55',
      ruimteInvloed:         '5k',
      vrijgaveBijverwarming: '7gr',
      wachttijdBackupMin:    'instelbaar (300K/°/min)',
      hybrideModus:          'instelbaar (hybride)',
      deltaT:                '7K',
      bivalentTemperatuur:   'Variabel (vrijgave: 5gr)',
    },
    Remeha: {
      warmtepompType:        null,
      afgiftesysteem:        'radiator',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             '0,8',
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    120,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Alklima: {
      warmtepompType:        'ERST20F-VM2E',
      afgiftesysteem:        'radiator',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          'ERSF-VM2E',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
  },

  // ── Tabel 9 — Profiel C3 (Slecht geïsoleerd, hete lucht ≥55°C) ────────────
  C3: {
    Intergas: {
      warmtepompType:        'xtend',
      afgiftesysteem:        'hete lucht',
      maxAanvoertemperatuur: 80,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          null,
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Bosch: {
      warmtepompType:        'compress 3400i compress 7400i',
      afgiftesysteem:        'radiatoren',
      maxAanvoertemperatuur: '80gr',
      minimaleCop:           'model afh.',
      stooklijn:             '20/28, -10/75',
      ruimteInvloed:         '9k',
      vrijgaveBijverwarming: '7gr',
      wachttijdBackupMin:    'instelbaar (300K/°/min)',
      hybrideModus:          'instelbaar (hybride)',
      deltaT:                '7K',
      bivalentTemperatuur:   'Variabel (vrijgave: 5gr)',
    },
    Remeha: {
      warmtepompType:        null,
      afgiftesysteem:        'hete lucht',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             '1,5',
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    30,
      hybrideModus:          'Kosten',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
    Alklima: {
      warmtepompType:        'ERPT20X-VM2E',
      afgiftesysteem:        'hete lucht',
      maxAanvoertemperatuur: null,
      minimaleCop:           null,
      stooklijn:             null,
      ruimteInvloed:         null,
      vrijgaveBijverwarming: null,
      wachttijdBackupMin:    null,
      hybrideModus:          'ERPX-VM2E',
      deltaT:                null,
      bivalentTemperatuur:   null,
    },
  },
};

// ── Accessor functions ─────────────────────────────────────────────────────

/**
 * Returns the complete catalogus entry for a kruisprofiel — one
 * FabrikantInstellingen for each of the 4 fabrikanten.
 */
export function getCatalogusProfiel(code: KruisProfielCode): CatalogusProfiel {
  return TNO_CATALOGUS[code];
}

/**
 * Returns a single fabrikant's settings for a kruisprofiel.
 */
export function getRecommendedSettings(
  code: KruisProfielCode,
  fabrikant: Fabrikant
): FabrikantInstellingen {
  return TNO_CATALOGUS[code][fabrikant];
}

/**
 * Returns the list of fabrikanten that have at least one non-null
 * setting for the given profiel. Useful for filtering the UI — a
 * profiel with all-null fabrikant entries wouldn't be worth showing.
 *
 * Note: a fabrikant always has *some* value (e.g. warmtepompType or
 * afgiftesysteem) in the current catalogus, so this will typically
 * return all 4 fabrikanten. Function exists for future-proofing
 * when the catalogus grows and may have empty rows.
 */
export function getAvailableFabrikanten(code: KruisProfielCode): Fabrikant[] {
  const profiel = TNO_CATALOGUS[code];
  const hasAnyValue = (inst: FabrikantInstellingen): boolean =>
    Object.values(inst).some((v) => v !== null);

  return (Object.keys(profiel) as Fabrikant[]).filter((f) =>
    hasAnyValue(profiel[f])
  );
}

// Re-export FabrikantInstellingen for convenience (imported from types)
export type { FabrikantInstellingen } from '../types/heatpump';
