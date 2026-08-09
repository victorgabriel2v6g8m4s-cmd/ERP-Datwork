import { useCallback, useEffect, useState } from 'react';
import { pricingService } from '../services/pricing.service.ts';
import type { PricingHeaderMetrics } from '../types/pricing.types.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

const EMPTY_METRICS: PricingHeaderMetrics = {
  fixedCostPerUnitFactor: 0,
  totalVariablePercent: 0
};

export function usePricingMetrics() {
  const [metrics, setMetrics] = useState<PricingHeaderMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const overview = await pricingService.getOverview();
      setMetrics({
        fixedCostPerUnitFactor: overview.fixedCostPerUnitFactor,
        totalVariablePercent: overview.totalVariablePercent
      });
    } catch (error) {
      CustomLogger.error('[Pricing] Failed to load header metrics', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { metrics, loading, refresh };
}
