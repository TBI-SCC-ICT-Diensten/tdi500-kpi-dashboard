import { useMemo, useState } from 'react';
import { getCatalogusProfiel, getAvailableFabrikanten } from '../config/tnoCatalogus';
import { ALL_FABRIKANTEN, type Fabrikant, type KruisProfielCode } from '../types/heatpump';

/**
 * View hook for AanbevolenInstellingen: resolves the catalogus profiel + the
 * available fabrikanten for a kruisprofiel and owns the selected-fabrikant state.
 * Keeps the component out of the config/catalogus layer.
 */
export const useAanbevolenInstellingen = (kruisProfielCode: KruisProfielCode) => {
  const profiel = useMemo(() => getCatalogusProfiel(kruisProfielCode), [kruisProfielCode]);
  const available = useMemo(() => getAvailableFabrikanten(kruisProfielCode), [kruisProfielCode]);

  // Default to the first available fabrikant; fall back to the first in canonical
  // order. ALL_FABRIKANTEN is statically 4 elements so the assertion is safe (only
  // present to satisfy noUncheckedIndexedAccess).
  const [selected, setSelected] = useState<Fabrikant>(available[0] ?? ALL_FABRIKANTEN[0]!);

  const settings = profiel[selected];
  return { available, selected, setSelected, settings };
};
