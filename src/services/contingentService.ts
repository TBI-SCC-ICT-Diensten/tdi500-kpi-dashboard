import type { Contingent, HeatPumpSystem, KruisProfielCode } from '../types/heatpump';
import { getKruisProfiel } from '../config/kruisProfielen';

/**
 * Builds a Contingent object from a list of heat pumps and a kruisprofiel code.
 * This is the primary factory for contingents in the TDI 500 domain model.
 */
export const createContingent = (
  id: string,
  name: string,
  kruisProfielCode: KruisProfielCode,
  heatPumps: HeatPumpSystem[]
): Contingent => {
  return {
    id,
    name,
    kruisProfiel: getKruisProfiel(kruisProfielCode),
    heatPumps,
  };
};

/**
 * Groups a flat list of heat pumps into contingents by kruisprofiel code.
 * Each heat pump must have a kruisProfielCode property to be included.
 * Heat pumps without a valid code are skipped and logged as warnings.
 *
 * NOTE: The Hupie API does not currently expose kruisprofiel data per heat pump.
 * This function is implemented for when that data becomes available.
 * For now, contingents are constructed manually via createContingent().
 */
export const groupHeatPumpsByKruisProfiel = (
  heatPumps: Array<HeatPumpSystem & { kruisProfielCode?: KruisProfielCode }>
): Contingent[] => {
  const grouped = new Map<KruisProfielCode, HeatPumpSystem[]>();

  for (const hp of heatPumps) {
    if (!hp.kruisProfielCode) {
      console.warn(`[contingentService] Heat pump ${hp.id} has no kruisProfielCode — skipping`);
      continue;
    }
    const existing = grouped.get(hp.kruisProfielCode);
    if (existing) {
      existing.push(hp);
    } else {
      grouped.set(hp.kruisProfielCode, [hp]);
    }
  }

  return Array.from(grouped.entries()).map(([code, pumps]) =>
    createContingent(code, `Contingent ${code}`, code, pumps)
  );
};
