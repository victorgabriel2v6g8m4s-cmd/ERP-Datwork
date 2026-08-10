import { Landmark, Package, Percent, Sliders, Tags, Landmark as FixedIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import {
  GlobalFooterNav,
  GlobalTopTabs,
  SubTabSelector,
  UniversalHeaderDashboard
} from '../../components/index.ts';
import { TEXTS } from '../../i18n/index.ts';
import { ERP_THEME } from '../../theme/presets.ts';
import { UI_KEYS } from '../../ui/keys.ts';
import { formatCurrencyBRL } from '../../utils/format.ts';
import { PricingServicesPlaceholder } from './components/PricingServicesPlaceholder.tsx';
import { TabProductsPricing } from './components/TabProductsPricing.tsx';
import { TabSettings } from './components/TabSettings.tsx';
import { usePricingProducts } from './hooks/usePricingProducts.ts';

type PricingSubTab = 'ajustes' | 'produtos' | 'servicos';

function resolvePricingSubTab(value: string | undefined): PricingSubTab {
  return value === 'ajustes' || value === 'servicos' || value === 'produtos' ? value : 'produtos';
}

export function PricingPage() {
  const { subtab } = useParams<{ subtab: string }>();
  const currentActiveSubTab = resolvePricingSubTab(subtab);
  const pricing = usePricingProducts();

  const tabs = [
    { id: 'ajustes', label: TEXTS.pricing.tabs.settings, path: '/precificacao/ajustes', icon: Sliders },
    { id: 'produtos', label: TEXTS.pricing.tabs.products, path: '/precificacao/produtos', icon: Package },
    { id: 'servicos', label: TEXTS.pricing.tabs.services, path: '/precificacao/servicos', icon: Landmark }
  ];

  return (
    <div className={ERP_THEME.pricing.page.shell} data-ui-key={UI_KEYS.pricing.page}>
      <div data-ui-key={UI_KEYS.pricing.header}>
        <UniversalHeaderDashboard
          title={TEXTS.pricing.page.title}
          subtitle={TEXTS.pricing.page.subtitle}
          icon={Tags}
          backPath="/home"
          kpiCards={[
            {
              label: TEXTS.pricing.page.fixedCostKpi,
              value: formatCurrencyBRL(pricing.metrics.fixedCostPerUnitFactor),
              icon: FixedIcon,
              valueColorClass: 'text-slate-800'
            },
            {
              label: TEXTS.pricing.page.variableExpensesKpi,
              value: `${pricing.metrics.totalVariablePercent.toFixed(2)}%`,
              icon: Percent,
              valueColorClass: 'text-indigo-600'
            }
          ]}
        />
      </div>

      <GlobalTopTabs />

      <main className={ERP_THEME.pricing.page.main}>
        <div data-ui-key={UI_KEYS.pricing.subTabs}>
          <SubTabSelector tabs={tabs} activeTabId={currentActiveSubTab} />
        </div>

        <div className={ERP_THEME.pricing.page.panel} data-ui-key={UI_KEYS.pricing.panel}>
          {currentActiveSubTab === 'ajustes' && <TabSettings onSaved={pricing.reload} />}
          {currentActiveSubTab === 'produtos' && <TabProductsPricing pricing={pricing} />}
          {currentActiveSubTab === 'servicos' && <PricingServicesPlaceholder />}
        </div>
      </main>

      <GlobalFooterNav />
    </div>
  );
}
