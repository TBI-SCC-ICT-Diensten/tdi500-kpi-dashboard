/**
 * BAG Service — Basisregistratie Adressen en Gebouwen
 *
 * Uses the free PDOK Locatieserver API (no API key required).
 * Source: https://api.pdok.nl/bzk/locatieserver/search/v3_1
 *
 * To remove this feature: delete this file, BagLookupPage.tsx,
 * and the route/sidebar entries marked with [BAG-LOOKUP].
 */

import axios from 'axios';
import type { InsulationLevel, KruisProfielCode } from '../types/heatpump';

const PDOK_BASE = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1';

export interface BagResult {
  weergavenaam: string;
  straatnaam: string;
  huisnummer: string;
  postcode: string;
  woonplaatsnaam: string;
  bouwjaar: number | null;
  woningtype: string | null;
}

export interface KruisProfielSuggestion {
  insulationLevel: InsulationLevel;
  insulationReason: string;
  kruisProfielCode: KruisProfielCode;
  confidence: 'hoog' | 'middel' | 'laag';
}

/**
 * Fetch building data from PDOK BAG for a given postcode + huisnummer.
 */
export const fetchBagData = async (
  postcode: string,
  huisnummer: string
): Promise<BagResult> => {
  const q = `${postcode.replace(/\s/g, '')} ${huisnummer}`.trim();

  const response = await axios.get(`${PDOK_BASE}/free`, {
    params: { q, fq: 'type:adres', fl: '*', rows: 1 },
    timeout: 10000,
  });

  const docs: Record<string, unknown>[] =
    response.data?.response?.docs ?? [];

  if (docs.length === 0) {
    throw new Error(
      `Geen adres gevonden voor ${postcode} ${huisnummer}. ` +
      'Controleer de postcode en het huisnummer.'
    );
  }

  const doc = docs[0];

  return {
    weergavenaam: String(doc['weergavenaam'] ?? ''),
    straatnaam: String(doc['straatnaam'] ?? ''),
    huisnummer: String(doc['huisnummer'] ?? huisnummer),
    postcode: String(doc['postcode'] ?? postcode),
    woonplaatsnaam: String(doc['woonplaatsnaam'] ?? ''),
    bouwjaar: doc['bouwjaar'] != null ? Number(doc['bouwjaar']) : null,
    woningtype: doc['type_adres'] != null ? String(doc['type_adres']) : null,
  };
};

/**
 * Map bouwjaar to insulationLevel (Y-axis of kruisprofiel).
 * Based on: BAG bouwjaar → typical RC-value → TDI 500 insulation class.
 * Source: TNO Activity 2.1, paragraph on woningcontingenten.
 */
export const mapBouwjaarToInsulation = (
  bouwjaar: number
): { level: InsulationLevel; reason: string; confidence: 'hoog' | 'middel' | 'laag' } => {
  if (bouwjaar < 1945) {
    return {
      level: 'C',
      reason: `Gebouwd vóór 1945 (${bouwjaar}) — typisch RC < 1,3 m²K/W (slecht geïsoleerd)`,
      confidence: 'hoog',
    };
  }
  if (bouwjaar < 1975) {
    return {
      level: 'C',
      reason: `Gebouwd ${bouwjaar} (1945–1975) — typisch RC 0,9–1,5 m²K/W (slecht tot matig)`,
      confidence: 'middel',
    };
  }
  if (bouwjaar < 1992) {
    return {
      level: 'B',
      reason: `Gebouwd ${bouwjaar} (1975–1992) — typisch RC 1,3–2,5 m²K/W (matig geïsoleerd)`,
      confidence: 'middel',
    };
  }
  if (bouwjaar < 2012) {
    return {
      level: 'B',
      reason: `Gebouwd ${bouwjaar} (1992–2012) — typisch RC 1,8–3,5 m²K/W (matig tot goed)`,
      confidence: 'laag',
    };
  }
  return {
    level: 'A',
    reason: `Gebouwd na 2012 (${bouwjaar}) — bijna energieneutraal, RC > 2,5 m²K/W (goed geïsoleerd)`,
    confidence: 'hoog',
  };
};

/**
 * Map afgiftesysteem selection to supplyTemperatureClass (X-axis).
 */
export const mapAfgifteToClass = (
  afgiftesysteem: 'vloerverwarming' | 'radiator' | 'hete lucht'
): '1' | '2' | '3' => {
  if (afgiftesysteem === 'vloerverwarming') return '1';
  if (afgiftesysteem === 'radiator') return '2';
  return '3';
};

/**
 * Derive kruisprofielCode from insulationLevel + afgiftesysteem.
 */
export const deriveKruisProfielCode = (
  insulationLevel: InsulationLevel,
  afgiftesysteem: 'vloerverwarming' | 'radiator' | 'hete lucht'
): KruisProfielCode => {
  const cls = mapAfgifteToClass(afgiftesysteem);
  return `${insulationLevel}${cls}` as KruisProfielCode;
};
