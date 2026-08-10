import { Coins } from 'lucide-react';
import { APP_CONFIG } from '../../../../config/app.config.ts';
import { TEXTS } from '../../../../i18n/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';
import { maskCurrencyBRL } from '../../../../utils/format.ts';
import type { IngredientUnit } from '../../types/ingredient.types.ts';

interface StepIngredientMetricsProps {
  price: number;
  setPrice: (value: number) => void;
  quantity: number;
  setQuantity: (value: number) => void;
  unit: IngredientUnit;
  setUnit: (value: IngredientUnit) => void;
}

export function StepIngredientMetrics({ price, setPrice, quantity, setQuantity, unit, setUnit }: StepIngredientMetricsProps) {
  return (
    <div className="space-y-4 font-sans text-xs sm:text-sm">
      <h4 className={ERP_THEME.ingredients.form.sectionTitle}>
        <Coins className="w-3.5 h-3.5" /> {TEXTS.ingredients.form.metrics}
      </h4>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={ERP_THEME.ingredients.form.label}>{TEXTS.ingredients.form.price}</label>
          <input
            type="text"
            placeholder={TEXTS.ingredients.form.pricePlaceholder}
            value={price > 0 ? maskCurrencyBRL((price * 100).toFixed(0)) : ''}
            onChange={(event) => setPrice(Number(event.target.value.replace(/\D/g, '')) / 100)}
            className={`${ERP_THEME.ingredients.form.input} tabular-nums`}
            data-ui-key={UI_KEYS.ingredients.formPrice}
          />
        </div>

        <div>
          <label className={ERP_THEME.ingredients.form.label}>{TEXTS.ingredients.form.quantity}</label>
          <input
            type="number"
            min={APP_CONFIG.ingredients.limits.minQuantity}
            step="any"
            value={quantity}
            onChange={(event) => {
              const next = Number(event.target.value);
              setQuantity(Number.isFinite(next) ? Math.max(APP_CONFIG.ingredients.limits.minQuantity, next) : APP_CONFIG.ingredients.limits.minQuantity);
            }}
            className={ERP_THEME.ingredients.form.input}
            data-ui-key={UI_KEYS.ingredients.formQuantity}
          />
        </div>

        <div>
          <label className={ERP_THEME.ingredients.form.label}>{TEXTS.ingredients.form.unit}</label>
          <select
            value={unit}
            onChange={(event) => setUnit(event.target.value as IngredientUnit)}
            className={ERP_THEME.ingredients.form.select}
            data-ui-key={UI_KEYS.ingredients.formUnit}
          >
            {APP_CONFIG.ingredients.units.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
