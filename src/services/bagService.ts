/**
 * BAG Service — Basisregistratie Adressen en Gebouwen
 *
 * Three-step automated lookup:
 *   1. PDOK Locatieserver → address validation + nummeraanduiding_id
 *   2. BAG API Individuele Bevragingen → bouwjaar via pand lookup
 *   3. EP-online API → energielabel
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
const BAG_BASE = 'https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2';
const EP_BASE = 'https://public.ep-online.nl/api/v5';

// DEMO key — works without registration for testing
const BAG_DEMO_KEY = 'l7xx60e2f1b9a5094b43a12f4c0cf16dede7';

export interface BagResult {
  // From PDOK
  weergavenaam: string;
  straatnaam: string;
  huisnummer: string;
  postcode: string;
  woonplaatsnaam: string;
  // From BAG Individuele Bevragingen
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

  // ── Step 2: BAG Individuele Bevragingen → pand → bouwjaar ──────────
  onProgress?.({ step: 2, message: 'Bouwjaar ophalen via BAG Kadaster API...' });

  let bouwjaar: number | null = null;
  let gebruiksdoel: string | null = null;
  let oppervlakte: number | null = null;
  let pandStatus: string | null = null;

  try {
    const bagAdresResponse = await axios.get(`${BAG_BASE}/adressen`, {
      params: {
        postcode: cleanPostcode,
        huisnummer: parseInt(cleanHuisnummer, 10),
      },
      headers: {
        'X-Api-Key': BAG_DEMO_KEY,
        'Accept': 'application/hal+json',
        'Accept-Crs': 'epsg:28992',
      },
      timeout: 10000,
    });

    const adressen: Record<string, unknown>[] =
      (bagAdresResponse.data?._embedded?.adressen as Record<string, unknown>[]) ?? [];

    if (adressen.length > 0) {
      const adres = adressen[0] as Record<string, unknown>;
      const pandIds = adres['pandIdentificaties'] as string[] | undefined;

      if (pandIds && pandIds.length > 0) {
        const pandId = pandIds[0];
        const pandResponse = await axios.get(`${BAG_BASE}/panden/${pandId}`, {
          headers: {
            'X-Api-Key': BAG_DEMO_KEY,
            'Accept': 'application/hal+json',
          },
          timeout: 10000,
        });

        const pand = pandResponse.data?.pand as Record<string, unknown> | undefined;
        if (pand) {
          bouwjaar = pand['oorspronkelijkBouwjaar'] != null
            ? Number(pand['oorspronkelijkBouwjaar'])
            : null;
          pandStatus = pand['status'] != null ? String(pand['status']) : null;
        }
      }

      // Get gebruiksdoel and oppervlakte from verblijfsobject
      const vboId = adres['adresseerbaarObjectIdentificatie'] as string | undefined;
      if (vboId) {
        try {
          const vboResponse = await axios.get(
            `${BAG_BASE}/verblijfsobjecten/${vboId}`,
            {
              headers: {
                'X-Api-Key': BAG_DEMO_KEY,
                'Accept': 'application/hal+json',
              },
              timeout: 10000,
            }
          );
          const vbo = vboResponse.data?.verblijfsobject as Record<string, unknown> | undefined;
          if (vbo) {
            const doelen = vbo['gebruiksdoelen'] as string[] | undefined;
            gebruiksdoel = doelen?.[0] ?? null;
            oppervlakte = vbo['oppervlakte'] != null
              ? Number(vbo['oppervlakte'])
              : null;
          }
        } catch {
          // VBO lookup is optional — continue without it
        }
      }
    }
  } catch (bagErr) {
    // BAG API failure is non-fatal — we still have address data
    console.warn('[BAG] Pand lookup failed:', bagErr);
  }

  // ── Step 3: EP-online → energielabel ───────────────────────────────
  onProgress?.({ step: 3, message: 'Energielabel ophalen via EP-online...' });

  let energielabel: string | null = null;
  let energielabelGeldigTot: string | null = null;

  try {
    const epResponse = await axios.get(`${EP_BASE}/PandEnergielabel/Adres`, {
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
      energielabel = label['Pand_energieklasse'] != null
        ? String(label['Pand_energieklasse'])
        : null;
      energielabelGeldigTot = label['Meting_geldig_tot'] != null
        ? String(label['Meting_geldig_tot'])
        : null;
    }
  } catch {
    // EP-online failure is non-fatal — CORS may block this in browser
    console.warn('[EP-online] Energielabel lookup failed (possibly CORS)');
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
