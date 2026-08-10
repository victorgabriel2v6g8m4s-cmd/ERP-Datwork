import { CloudCheck, CloudLightning, TriangleAlert } from 'lucide-react';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import type { usePricingProducts } from '../hooks/usePricingProducts.ts';
import { PricingProductsTable } from './PricingProductsTable.tsx';

interface TabProductsPricingProps {
  pricing: ReturnType<typeof usePricingProducts>;
}

export function TabProductsPricing({ pricing }: TabProductsPricingProps) {

  if (pricing.loading) {
    return <div className={ERP_THEME.pricing.products.loading}>{TEXTS.pricing.products.loading}</div>;
  }

  return (
    <div className={ERP_THEME.pricing.products.container} data-ui-key={UI_KEYS.pricing.productsTab}>
      <div className="flex justify-end px-1" data-ui-key={UI_KEYS.pricing.syncStatus}>
        {pricing.syncStatus === 'saving' && (
          <span className={ERP_THEME.pricing.products.syncSaving}>
            <CloudLightning className="w-3 h-3" /> {TEXTS.pricing.products.sync.saving}
          </span>
        )}
        {pricing.syncStatus === 'saved' && (
          <span className={ERP_THEME.pricing.products.syncSaved}>
            <CloudCheck className="w-3 h-3" /> {TEXTS.pricing.products.sync.saved}
          </span>
        )}
        {pricing.syncStatus === 'error' && (
          <span className={ERP_THEME.pricing.products.syncError}>
            <TriangleAlert className="w-3 h-3" /> {TEXTS.pricing.products.sync.error}
          </span>
        )}
      </div>

      <PricingProductsTable products={pricing.products} onUpdate={pricing.updateField} />
    </div>
  );
}
