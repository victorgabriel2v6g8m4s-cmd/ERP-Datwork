import { useCallback, useEffect, useRef, useState } from 'react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Product } from '../../../types/product.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { pricingService } from '../services/pricing.service.ts';
import type {
  PricingHeaderMetrics,
  PricingProductFieldUpdate,
  PricingProductMutationPayload,
  PricingSyncStatus
} from '../types/pricing.types.ts';

const EMPTY_METRICS: PricingHeaderMetrics = {
  fixedCostPerUnitFactor: 0,
  totalVariablePercent: 0
};

function applyLocalUpdate(product: Product, update: PricingProductFieldUpdate): Product {
  if (update.field === 'finalPrice') {
    return { ...product, finalPrice: update.value };
  }

  return { ...product, includeFixedCosts: update.value };
}

function toMutationPayload(update: PricingProductFieldUpdate): PricingProductMutationPayload {
  return update.field === 'finalPrice'
    ? { finalPrice: update.value }
    : { includeFixedCosts: update.value };
}

export function usePricingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<PricingHeaderMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<PricingSyncStatus>('saved');
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingKeysRef = useRef(new Set<string>());

  const load = useCallback(async () => {
    try {
      const overview = await pricingService.getOverview();
      setProducts(overview.products);
      setMetrics({
        fixedCostPerUnitFactor: overview.fixedCostPerUnitFactor,
        totalVariablePercent: overview.totalVariablePercent
      });
    } catch (error) {
      CustomLogger.error('[Pricing] Failed to load products for pricing table', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    const pendingKeys = pendingKeysRef.current;

    return () => {
      Object.values(timeouts).forEach(clearTimeout);
      pendingKeys.clear();
    };
  }, []);

  const updateField = useCallback((id: string, update: PricingProductFieldUpdate) => {
    const key = `${id}:${update.field}`;
    const existingTimeout = timeoutsRef.current[key];
    if (existingTimeout) clearTimeout(existingTimeout);

    setProducts((current) => current.map((product) => (
      product.id === id ? applyLocalUpdate(product, update) : product
    )));

    pendingKeysRef.current.add(key);
    setSyncStatus('saving');

    timeoutsRef.current[key] = setTimeout(async () => {
      try {
        const updated = await pricingService.updateProductPricing(id, toMutationPayload(update));
        setProducts((current) => current.map((product) => product.id === id ? updated : product));
        pendingKeysRef.current.delete(key);
        setSyncStatus(pendingKeysRef.current.size > 0 ? 'saving' : 'saved');
      } catch (error) {
        pendingKeysRef.current.delete(key);
        setSyncStatus(pendingKeysRef.current.size > 0 ? 'saving' : 'error');
        CustomLogger.error(`[Pricing] Failed to persist ${update.field} for product ${id}`, error);
        await load();
      } finally {
        delete timeoutsRef.current[key];
      }
    }, APP_CONFIG.pricing.interactions.productSaveDebounceMs);
  }, [load]);

  return { products, metrics, loading, syncStatus, updateField, reload: load };
}
