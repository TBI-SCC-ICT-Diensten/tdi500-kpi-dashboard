import { useState } from 'react';
import type React from 'react';
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

  const handleAfgifteChange = (
    _: React.MouseEvent<HTMLElement>,
    value: Afgiftesysteem | null
  ): void => {
    setAfgiftesysteem(value);
    if (value && insulation) {
      setKruisProfielCode(deriveKruisProfielCode(insulation.level, value));
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
