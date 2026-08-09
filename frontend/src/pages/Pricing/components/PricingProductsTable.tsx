import { useMemo } from 'react';
import { UniversalGridTable, type GridColumn } from '../../../components/index.ts';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import type { Product, ProductCostInclusion } from '../../../types/product.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';
import type { PricingProductFieldUpdate } from '../types/pricing.types.ts';

interface PricingProductsTableProps {
  products: Product[];
  onUpdate: (id: string, update: PricingProductFieldUpdate) => void;
}

function isProductCostInclusion(value: string): value is ProductCostInclusion {
  return value === 'DEFAULT' || value === 'YES' || value === 'NO';
}

export function PricingProductsTable({ products, onUpdate }: PricingProductsTableProps) {
  const columns = useMemo<GridColumn<Product>[]>(() => [
    {
      header: TEXTS.pricing.products.columns.item,
      gridRatio: '2fr',
      textAlign: 'left',
      render: (product) => (
        <div className="flex gap-2.5 items-center min-w-0 text-left">
          <div className="w-8 h-8 rounded-lg bg-slate-900 overflow-hidden shadow-3xs flex items-center justify-center shrink-0">
            {product.thumbnail ? (
              <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[9px] font-black text-white">{TEXTS.pricing.products.thumbnailFallback}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-mono tabular-nums">{product.sku}</span>
              <span className="text-[8px] font-black uppercase px-1 rounded bg-slate-100 text-slate-500">
                {TEXTS.pricing.products.abcCategory(product.abcCategory)}
              </span>
            </div>
            <h4 className="font-black text-slate-800 text-xs truncate mt-0.5">{product.name}</h4>
            <p className="text-[9px] text-slate-400 font-semibold truncate">{product.brand}</p>
          </div>
        </div>
      )
    },
    {
      header: TEXTS.pricing.products.columns.unitCost,
      gridRatio: '1fr',
      textAlign: 'center',
      render: (product) => <span className="font-bold text-slate-600 tabular-nums">{formatCurrencyBRL(product.totalUnitCost)}</span>
    },
    {
      header: TEXTS.pricing.products.columns.suggestedPrice,
      gridRatio: '1.2fr',
      textAlign: 'center',
      render: (product) => (
        <div className={ERP_THEME.pricing.products.suggestedPrice}>{formatCurrencyBRL(product.suggestedPrice)}</div>
      )
    },
    {
      header: TEXTS.pricing.products.columns.finalPrice,
      gridRatio: '1.2fr',
      textAlign: 'center',
      render: (product) => (
        <input
          type="number"
          step="any"
          min={APP_CONFIG.pricing.limits.minFinalPrice}
          value={product.finalPrice || ''}
          onChange={(event) => onUpdate(product.id, { field: 'finalPrice', value: Number(event.target.value) })}
          placeholder="0.00"
          className={ERP_THEME.pricing.products.finalPriceInput}
          data-ui-key={UI_KEYS.pricing.productFinalPrice}
          aria-label={`${TEXTS.pricing.products.columns.finalPrice}: ${product.name}`}
        />
      )
    },
    {
      header: TEXTS.pricing.products.columns.grossProfit,
      gridRatio: '1fr',
      textAlign: 'center',
      render: (product) => {
        const activePrice = product.finalPrice > 0 ? product.finalPrice : product.suggestedPrice;
        const grossProfit = activePrice - product.totalUnitCost;
        return (
          <span className={`font-bold tabular-nums ${grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrencyBRL(grossProfit)}
          </span>
        );
      }
    },
    {
      header: TEXTS.pricing.products.columns.netProfit,
      gridRatio: '1fr',
      textAlign: 'center',
      render: (product) => (
        <div className={`${ERP_THEME.pricing.products.netProfit} ${product.predictedNetProfit >= 0 ? ERP_THEME.pricing.products.netProfitPositive : ERP_THEME.pricing.products.netProfitNegative}`}>
          {formatCurrencyBRL(product.predictedNetProfit)}
        </div>
      )
    },
    {
      header: TEXTS.pricing.products.columns.includeFixedCosts,
      gridRatio: '1.2fr',
      textAlign: 'center',
      render: (product) => (
        <select
          value={product.includeFixedCosts}
          onChange={(event) => {
            if (isProductCostInclusion(event.target.value)) {
              onUpdate(product.id, { field: 'includeFixedCosts', value: event.target.value });
            }
          }}
          className={ERP_THEME.pricing.products.fixedCostSelect}
          data-ui-key={UI_KEYS.pricing.productFixedCosts}
          aria-label={`${TEXTS.pricing.products.columns.includeFixedCosts}: ${product.name}`}
        >
          <option value="DEFAULT">{TEXTS.pricing.products.fixedCostOptions.default}</option>
          <option value="YES">{TEXTS.pricing.products.fixedCostOptions.yes}</option>
          <option value="NO">{TEXTS.pricing.products.fixedCostOptions.no}</option>
        </select>
      )
    }
  ], [onUpdate]);

  return <UniversalGridTable columns={columns} data={products} />;
}
