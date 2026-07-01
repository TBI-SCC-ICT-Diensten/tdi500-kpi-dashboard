import { evaluateContingent } from '../services/decisionEngine';
import { useDashboardContext } from '../context/DashboardContext';
import type { KeyPerformanceIndicator, KruisProfielCode } from '../types/heatpump';

/**
 * View hook: runs the decision engine for a contingent's KPIs and derives the
 * current profile code from the selected contingent. Keeps DecisionSupportCard
 * free of any direct service import or in-render business call.
 */
export const useDecisionSupport = (
  kpis: KeyPerformanceIndicator[],
  kruisProfielCode: KruisProfielCode
) => {
  const { state } = useDashboardContext();
  const recommendation = evaluateContingent(kpis, kruisProfielCode);
  const profileCode = state.selectedContingentId
    ? state.selectedContingentId.replace('contingent-', '')
    : null;
  return { ...recommendation, profileCode };
};
