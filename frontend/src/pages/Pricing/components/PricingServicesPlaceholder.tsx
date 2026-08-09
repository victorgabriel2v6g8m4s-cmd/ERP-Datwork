import { Landmark } from 'lucide-react';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import { UI_KEYS } from '../../../ui/keys.ts';

export function PricingServicesPlaceholder() {
  return (
    <div className={ERP_THEME.pricing.services.placeholder} data-ui-key={UI_KEYS.pricing.servicesPlaceholder}>
      <Landmark className="w-5 h-5 mx-auto text-slate-300" />
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
        {TEXTS.pricing.services.title}
      </h3>
      <p className="text-xs text-slate-400 font-medium">{TEXTS.pricing.services.description}</p>
    </div>
  );
}
