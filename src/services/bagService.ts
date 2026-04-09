/**
 * BAG Service — Basisregistratie Adressen en Gebouwen
 *
 * Three-step automated lookup:
 *   1. PDOK Locatieserver → address validation + nummeraanduiding_id
 *   2. PDOK BAG WFS → bouwjaar, oppervlakte, gebruiksdoel (free, no auth)
 *   3. EP-online API → energielabel (via Vite proxy to avoid CORS)
 *
 * All APIs are free and require no registration for basic use.
 *
 * [BAG-LOOKUP] To remove this feature: delete this file,
 * BagLookupPage.tsx, and the two [BAG-LOOKUP] entries in
 * App.tsx and Sidebar.tsx.
 */

import axios from 'axios';
import type { InsulationLevel, KruisProfielCode } from '../types/heatpump';

const PDOK_BASE = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1';

// Use Vite proxy path in development, direct URL in production
const EP_PROXY = '/ep-online/api/v5';

export interface BagResult {
  // From PDOK
  weergavenaam: string;
  straatnaam: string;
  huisnummer: string;
  postcode: string;
  woonplaatsnaam: string;
  // From PDOK BAG WFS
  bouwjaar: number | null;
  gebruiksdoel: string | null;
  oppervlakte: number | null;
  pandStatus: string | null;
  // From EP-online
  energielabel: string | null;
  energielabelGeldigTot: string | null;
}

export interface LookupProgress {
  step: 1 | 2 | 3 | 4;
  message: string;
}

/**
 * Full automated lookup: address → bouwjaar → energielabel.
 * onProgress callback fires at each step for UI feedback.
 */
export const fetchBagData = async (
  postcode: string,
  huisnummer: string,
  onProgress?: (progress: LookupProgress) => void
): Promise<BagResult> => {
  const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
  const cleanHuisnummer = huisnummer.trim();

  // ── Step 1: PDOK Locatieserver ──────────────────────────────────────
  onProgress?.({ step: 1, message: 'Adres opzoeken via PDOK Locatieserver...' });

  const pdokResponse = await axios.get(`${PDOK_BASE}/free`, {
    params: {
      q: `${cleanPostcode} ${cleanHuisnummer}`,
      fq: `type:adres AND postcode:${cleanPostcode}`,
      fl: 'id,weergavenaam,straatnaam,huisnummer,postcode,woonplaatsnaam,nummeraanduiding_id',
      rows: 5,
    },
    timeout: 10000,
  });

  const docs: Record<string, unknown>[] =
    pdokResponse.data?.response?.docs ?? [];

  if (docs.length === 0) {
    throw new Error(
      `Geen adres gevonden voor ${cleanPostcode} ${cleanHuisnummer}. ` +
      'Controleer de postcode en het huisnummer.'
    );
  }

  // Find best match: exact huisnummer
  const exact = docs.find(
    (d) => String(d['huisnummer'] ?? '').trim() === cleanHuisnummer
  );
  const pdokDoc = (exact ?? docs[0]) as Record<string, unknown>;

  const weergavenaam = String(pdokDoc['weergavenaam'] ?? '');
  const straatnaam = String(pdokDoc['straatnaam'] ?? '');
  const woonplaatsnaam = String(pdokDoc['woonplaatsnaam'] ?? '');

  // ── Step 2: PDOK BAG WFS → bouwjaar, oppervlakte, gebruiksdoel ─────
  onProgress?.({ step: 2, message: 'Bouwjaar ophalen via PDOK BAG WFS...' });

  let bouwjaar: number | null = null;
  let gebruiksdoel: string | null = null;
  let oppervlakte: number | null = null;
  let pandStatus: string | null = null;

  try {
    const wfsResponse = await axios.get(
      'https://service.pdok.nl/lv/bag/wfs/v2_0',
      {
        params: {
          service: 'WFS',
          version: '2.0.0',
          request: 'GetFeature',
          typeName: 'bag:verblijfsobject',
          outputFormat: 'application/json',
          count: 1,
          CQL_FILTER: `postcode='${cleanPostcode}' AND huisnummer=${parseInt(cleanHuisnummer, 10)}`,
        },
        timeout: 10000,
      }
    );

    const features = wfsResponse.data?.features as Array<{
      properties: Record<string, unknown>;
    }> | undefined;

    const firstFeature = features?.[0];
    if (firstFeature) {
      const props = firstFeature.properties;
      bouwjaar = props['bouwjaar'] != null ? Number(props['bouwjaar']) : null;
      oppervlakte = props['oppervlakte'] != null
        ? Number(props['oppervlakte'])
        : null;
      gebruiksdoel = props['gebruiksdoel'] != null
        ? String(props['gebruiksdoel'])
        : null;
      pandStatus = props['status'] != null ? String(props['status']) : null;
    }
  } catch (wfsErr) {
    console.warn('[BAG WFS] Lookup failed:', wfsErr);
  }

  // ── Step 3: EP-online → energielabel ───────────────────────────────
  onProgress?.({ step: 3, message: 'Energielabel ophalen via EP-online...' });

  let energielabel: string | null = null;
  let energielabelGeldigTot: string | null = null;

  try {
    const epResponse = await axios.get(`${EP_PROXY}/PandEnergielabel/Adres`, {
      params: {
        postcode: cleanPostcode,
        huisnummer: parseInt(cleanHuisnummer, 10),
      },
      timeout: 10000,
    });

    // EP-online returns an array
    const labels = Array.isArray(epResponse.data)
      ? epResponse.data as Record<string, unknown>[]
      : [epResponse.data as Record<string, unknown>];

    if (labels.length > 0 && labels[0]) {
      const label = labels[0];
      energielabel = label['Energieklasse'] != null
        ? String(label['Energieklasse'])
        : null;
      energielabelGeldigTot = label['Geldig_tot'] != null
        ? String(label['Geldig_tot'])
        : null;
    }
  } catch (epErr) {
    if (axios.isAxiosError(epErr) && epErr.response?.status === 404) {
      // 404 = address has no registered energielabel — not an error
      console.info('[EP-online] Geen energielabel geregistreerd voor dit adres');
    } else {
      console.warn('[EP-online] Energielabel lookup failed:', epErr);
    }
  }

  onProgress?.({ step: 4, message: 'Klaar.' });

  return {
    weergavenaam,
    straatnaam,
    huisnummer: cleanHuisnummer,
    postcode: cleanPostcode,
    woonplaatsnaam,
    bouwjaar,
    gebruiksdoel,
    oppervlakte,
    pandStatus,
    energielabel,
    energielabelGeldigTot,
  };
};

/**
 * Map bouwjaar to insulationLevel (Y-axis of kruisprofiel).
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
 * Map energielabel (A-G) to insulationLevel as a more accurate
 * override of the bouwjaar-based estimate.
 * A/B → goed (A), C/D → matig (B), E/F/G → slecht (C)
 */
export const mapEnergielabelToInsulation = (
  label: string
): InsulationLevel => {
  const l = label.toUpperCase().trim();
  if (l === 'A' || l === 'A+' || l === 'A++' || l === 'A+++' || l === 'A++++' || l === 'B') return 'A';
  if (l === 'C' || l === 'D') return 'B';
  return 'C'; // E, F, G
};

/**
 * Map afgiftesysteem to supplyTemperatureClass (X-axis).
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
