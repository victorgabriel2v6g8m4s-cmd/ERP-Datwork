import { Landmark, Package, Percent, Sliders, Tags, Landmark as FixedIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { FEATURE_FLAGS, ROUTE_PATHS } from '../../config/routes.config.ts';
import {
  GlobalFooterNav,
  GlobalTopTabs,
  SubTabSelector,
  UniversalHeaderDashboard
} from '../../components/index.ts';
import { TEXTS } from '../../i18n/index.ts';
import { SYSTEM_TEXTS } from '../../i18n/system.ts';
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
    { id: 'ajustes', label: TEXTS.pricing.tabs.settings, path: ROUTE_PATHS.pricingSettings, icon: Sliders },
    { id: 'produtos', label: TEXTS.pricing.tabs.products, path: ROUTE_PATHS.pricingProducts, icon: Package },
    {
      id: 'servicos',
      label: TEXTS.pricing.tabs.services,
      path: ROUTE_PATHS.pricingServices,
      icon: Landmark,
      disabled: !FEATURE_FLAGS.modules.pricingServices,
      badge: FEATURE_FLAGS.modules.pricingServices ? undefined : SYSTEM_TEXTS.navigation.plannedBadge
    }
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
