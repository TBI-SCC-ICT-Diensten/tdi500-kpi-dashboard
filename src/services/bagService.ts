/**
 * BAG Service — Basisregistratie Adressen en Gebouwen
 *
 * Three-step automated lookup:
 *   1. PDOK Locatieserver → address validation + nummeraanduiding_id
 *   2. BAG Individuele Bevragingen API → bouwjaar, oppervlakte, gebruiksdoelen
 *      (requires VITE_BAG_API_KEY; CORS header is * so no Vite proxy needed)
 *   3. EP-online API → energielabel (via Vite proxy to avoid CORS)
 *
 * [BAG-LOOKUP] To remove this feature: delete this file,
 * BagLookupPage.tsx, and the two [BAG-LOOKUP] entries in
 * App.tsx and Sidebar.tsx.
 */

import axios from 'axios';
import type { InsulationLevel, KruisProfielCode } from '../types/heatpump';

const PDOK_BASE = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1';
const BAG_API_BASE = 'https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2';

// NOTE: This proxy path only works in Vite dev mode.
// In production, /ep-online requests will 404 unless a
// server-side proxy is configured (e.g. nginx, Vercel rewrites).
// For production deployment, move EP-online calls to a
// backend API route that holds the API key server-side.
const EP_PROXY = '/ep-online/api/v5';

export interface BagResult {
  // From PDOK
  weergavenaam: string;
  straatnaam: string;
  huisnummer: string;
  postcode: string;
  woonplaatsnaam: string;
  // From BAG Individuele Bevragingen API
  bouwjaar: number | null;
  gebruiksdoel: string | null;
  gebruiksdoelen: string[];
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
 * Fetches bouwjaar and oppervlakte from the BAG Individuele Bevragingen API.
 * Uses /adressenuitgebreid which returns all needed fields in a single call.
 *
 * Requires VITE_BAG_API_KEY environment variable.
 * CORS header is * so no Vite proxy is needed.
 *
 * @param postcode - Dutch postcode without spaces (e.g. "3012KN")
 * @param huisnummer - House number as string (e.g. "180")
 * @returns bouwjaar, oppervlakte, gebruiksdoelen or null if not found
 *
 * Source: BAG Individuele Bevragingen API v2
 * https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2/adressenuitgebreid
 */
export async function fetchBagApiData(postcode: string, huisnummer: string): Promise<{
  bouwjaar: number | null;
  oppervlakte: number | null;
  gebruiksdoelen: string[];
} | null> {
  const apiKey = import.meta.env['VITE_BAG_API_KEY'] as string | undefined;
  if (!apiKey) {
    console.warn('[bagService] VITE_BAG_API_KEY not set — BAG lookup skipped');
    return null;
  }

  const postcodeClean = postcode.replace(/\s+/g, '').toUpperCase();
  const url = `${BAG_API_BASE}/adressenuitgebreid?postcode=${postcodeClean}&huisnummer=${encodeURIComponent(huisnummer)}&exacteMatch=true`;

  const response = await axios.get(url, {
    headers: {
      'X-Api-Key': apiKey,
      'Accept': 'application/hal+json',
      'Accept-Crs': 'epsg:28992',
    },
  });

  const adressen = response.data?._embedded?.adressen;
  if (!adressen || adressen.length === 0) {
    return null;
  }

  const adres = adressen[0];

  const bouwjaarRaw = adres.oorspronkelijkBouwjaar;
  const bouwjaarParsed = Array.isArray(bouwjaarRaw) && bouwjaarRaw.length > 0
    ? parseInt(String(bouwjaarRaw[0]), 10)
    : null;

  const oppervlakte = typeof adres.oppervlakte === 'number'
    ? adres.oppervlakte
    : null;

  const gebruiksdoelen: string[] = Array.isArray(adres.gebruiksdoelen)
    ? adres.gebruiksdoelen
    : [];

  return {
    bouwjaar: Number.isFinite(bouwjaarParsed) ? bouwjaarParsed : null,
    oppervlakte,
    gebruiksdoelen,
  };
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
  // Validate postcode format to prevent CQL injection
  if (!/^[0-9]{4}[A-Z]{2}$/.test(cleanPostcode)) {
    throw new Error(
      `Ongeldige postcode: "${cleanPostcode}". ` +
      'Gebruik het formaat 1234AB.'
    );
  }
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

  // ── Step 2: BAG Individuele Bevragingen API — bouwjaar + oppervlakte ─
  onProgress?.({ step: 2, message: 'Bouwjaar ophalen via BAG Individuele Bevragingen API...' });

  let bouwjaar: number | null = null;
  let gebruiksdoel: string | null = null;
  let gebruiksdoelen: string[] = [];
  let oppervlakte: number | null = null;
  const pandStatus: string | null = null; // not returned by adressenuitgebreid

  try {
    const bagData = await fetchBagApiData(cleanPostcode, cleanHuisnummer);
    if (bagData) {
      bouwjaar = bagData.bouwjaar;
      oppervlakte = bagData.oppervlakte;
      gebruiksdoelen = bagData.gebruiksdoelen;
      gebruiksdoel = bagData.gebruiksdoelen[0] ?? null;
    }
  } catch (err) {
    console.warn('[bagService] BAG API lookup failed:', err);
    // Non-fatal: continue without bouwjaar/oppervlakte
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
    gebruiksdoelen,
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
