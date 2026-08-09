import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CloudCheck,
  CloudLightning,
  History,
  Landmark,
  Sliders,
  TriangleAlert,
  Wallet
} from 'lucide-react';
import {
  GlobalFooterNav,
  GlobalTopTabs,
  SubTabSelector,
  UniversalHeaderDashboard,
  UniversalSearchBar
} from '../../components/index.ts';
import { APP_CONFIG } from '../../config/app.config.ts';
import { TEXTS } from '../../i18n/index.ts';
import { ERP_THEME } from '../../theme/presets.ts';
import type { ExpenseCategory } from '../../types/expense.ts';
import { UI_KEYS } from '../../ui/keys.ts';
import { formatCurrencyBRL } from '../../utils/format.ts';
import { ExpenseHistoryModal } from './components/ExpenseHistoryModal.tsx';
import { ExpensesTable } from './components/ExpensesTable.tsx';
import { useExpensesFilters } from './hooks/useExpensesFilters.ts';
import { useExpensesLedger } from './hooks/useExpensesLedger.ts';
import { getExpenseCategoryTotal } from './utils/expenseLedger.ts';

function resolveExpenseCategory(subtab: string | undefined): ExpenseCategory {
  return subtab === 'variaveis' ? 'VARIABLE' : 'FIXED';
}

export function ExpensesPage() {
  const { subtab } = useParams<{ subtab: string }>();
  const activeCategory = resolveExpenseCategory(subtab);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const ledger = useExpensesLedger(activeCategory);
  const view = useExpensesFilters(ledger.expenses, activeCategory);

  const categoryTotal = useMemo(
    () => getExpenseCategoryTotal(ledger.expenses, activeCategory),
    [activeCategory, ledger.expenses]
  );

  const tabs = [
    {
      id: 'FIXED',
      label: TEXTS.expenses.tabs.fixed,
      path: APP_CONFIG.expenses.routes.fixed,
      icon: Sliders
    },
    {
      id: 'VARIABLE',
      label: TEXTS.expenses.tabs.variable,
      path: APP_CONFIG.expenses.routes.variable,
      icon: Landmark
    }
  ];

  const statusBadge = ledger.syncStatus === 'saving' ? (
    <span className={ERP_THEME.expenses.sync.saving} data-ui-key={UI_KEYS.expenses.syncStatus}>
      <CloudLightning className="w-3 h-3" /> {TEXTS.expenses.sync.saving}
    </span>
  ) : ledger.syncStatus === 'error' ? (
    <span className={ERP_THEME.expenses.sync.error} data-ui-key={UI_KEYS.expenses.syncStatus}>
      <TriangleAlert className="w-3 h-3" /> {TEXTS.expenses.sync.error}
    </span>
  ) : (
    <span className={ERP_THEME.expenses.sync.saved} data-ui-key={UI_KEYS.expenses.syncStatus}>
      <CloudCheck className="w-3 h-3" /> {TEXTS.expenses.sync.saved}
    </span>
  );

  return (
    <div className={ERP_THEME.expenses.page.shell} data-ui-key={UI_KEYS.expenses.page}>
      <div data-ui-key={UI_KEYS.expenses.header}>
        <UniversalHeaderDashboard
          title={TEXTS.expenses.page.title}
          subtitle={TEXTS.expenses.page.subtitle}
          icon={Wallet}
          backPath="/home"
          statusBadge={statusBadge}
          subBadge={
            <div className={ERP_THEME.expenses.page.totalBadge} data-ui-key={UI_KEYS.expenses.totalBadge}>
              {TEXTS.expenses.page.totalTab(formatCurrencyBRL(categoryTotal))}
            </div>
          }
          kpiCards={[
            {
              label: TEXTS.expenses.page.fixedCostKpi,
              value: formatCurrencyBRL(ledger.metrics.fixedCostPerUnitFactor),
              valueColorClass: 'text-slate-800'
            },
            {
              label: TEXTS.expenses.page.variableExpensesKpi,
              value: `${ledger.metrics.totalVariablePercent.toFixed(2)}%`,
              valueColorClass: 'text-indigo-600'
            }
          ]}
          actionButtons={[
            {
              label: TEXTS.expenses.actions.history,
              icon: History,
              onClick: () => setIsHistoryOpen(true),
              title: TEXTS.expenses.actions.historyTitle
            }
          ]}
        />
      </div>

      <GlobalTopTabs />

      <main className={ERP_THEME.expenses.page.main}>
        <div data-ui-key={UI_KEYS.expenses.subTabs}>
          <SubTabSelector tabs={tabs} activeTabId={activeCategory} />
        </div>

        <div data-ui-key={UI_KEYS.expenses.search}>
          <UniversalSearchBar
            type="expenses"
            filters={view.filters}
            onFilterChange={view.setFilters}
            placeholder={TEXTS.expenses.search.placeholder}
          />
        </div>

        {ledger.loading ? (
          <div className={ERP_THEME.expenses.page.loading}>{TEXTS.expenses.page.loading}</div>
        ) : (
          <ExpensesTable
            expenses={view.filteredExpenses}
            categoryTotal={categoryTotal}
            onUpdate={ledger.updateExpense}
            onDelete={(id) => void ledger.deleteExpense(id)}
          />
        )}
      </main>

      <ExpenseHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestoreVersion={ledger.restoreVersion}
      />

      <GlobalFooterNav />
    </div>
  );
}
