import { useState } from 'react';
import {
  fetchBagData,
  deriveInsulation,
  mapAfgifteToClass,
  deriveKruisProfielCode,
  type BagResult,
  type LookupProgress,
} from '../services/bagService';
import { getKruisProfiel } from '../config/kruisProfielen';
import { SCORING_THRESHOLDS_BY_PROFIEL, type ScoringThresholds } from '../services/scoringConfig';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { KruisProfielCode, KruisProfiel, SupplyTemperatureClass } from '../types/heatpump';

export type Afgiftesysteem = 'vloerverwarming' | 'radiator' | 'hete lucht';

const AFGIFTESYSTEMEN: readonly Afgiftesysteem[] = ['vloerverwarming', 'radiator', 'hete lucht'];

const isAfgiftesysteem = (value: string): value is Afgiftesysteem =>
  (AFGIFTESYSTEMEN as readonly string[]).includes(value);

/**
 * View hook for BagLookupPage: owns the full lookup flow (address → BAG → EP-online),
 * the insulation-precedence derivation and the kruisprofiel/threshold resolution.
 * Keeps the page free of any service/config import and of in-render business logic.
 */
export const useBagLookup = () => {
  const [postcode, setPostcode] = useState('');
  const [huisnummer, setHuisnummer] = useState('');
  const [afgiftesysteem, setAfgiftesysteem] = useState<Afgiftesysteem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bagResult, setBagResult] = useState<BagResult | null>(null);
  const [kruisProfielCode, setKruisProfielCode] = useState<KruisProfielCode | null>(null);
  const [manualBouwjaar, setManualBouwjaar] = useState<string>('');
  const [progress, setProgress] = useState<LookupProgress | null>(null);

  const insulation = deriveInsulation(bagResult, manualBouwjaar);

  const handleSearch = async (): Promise<void> => {
    if (!postcode.trim() || !huisnummer.trim()) return;
    setLoading(true);
    setError(null);
    setBagResult(null);
    setKruisProfielCode(null);
    setAfgiftesysteem(null);
    setManualBouwjaar('');

    try {
      const result = await fetchBagData(postcode.trim(), huisnummer.trim(), setProgress);
      setBagResult(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  /* Signatuur zonder MUI-event (C3): de owned ToggleGroup levert alleen de
   * waarde; string|null wordt hier naar het gesloten
   * Afgiftesysteem-vocabulaire vernauwd. */
  const handleAfgifteChange = (value: string | null): void => {
    const next = value === null ? null : isAfgiftesysteem(value) ? value : undefined;
    if (next === undefined) return;
    setAfgiftesysteem(next);
    if (next && insulation) {
      setKruisProfielCode(deriveKruisProfielCode(insulation.level, next));
    } else {
      setKruisProfielCode(null);
    }
  };

  const handleManualBouwjaarChange = (value: string): void => {
    setManualBouwjaar(value);
    setKruisProfielCode(null);
    setAfgiftesysteem(null);
  };

  const supplyTemperatureClass: SupplyTemperatureClass | undefined = afgiftesysteem
    ? mapAfgifteToClass(afgiftesysteem)
    : undefined;

  const profiel: KruisProfiel | null = kruisProfielCode ? getKruisProfiel(kruisProfielCode) : null;
  const thresholds: ScoringThresholds | null = kruisProfielCode
    ? SCORING_THRESHOLDS_BY_PROFIEL[kruisProfielCode]
    : null;

  return {
    postcode, setPostcode,
    huisnummer, setHuisnummer,
    afgiftesysteem, handleAfgifteChange,
    manualBouwjaar, handleManualBouwjaarChange,
    loading, error, bagResult, kruisProfielCode, progress,
    insulation, supplyTemperatureClass, profiel, thresholds,
    handleSearch,
  };
};
