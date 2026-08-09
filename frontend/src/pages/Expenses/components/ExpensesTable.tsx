import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { UniversalGridTable, type GridColumn } from '../../../components/index.ts';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import type { Expense, ExpenseValueType } from '../../../types/expense.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import type { ExpenseEditableUpdate } from '../types/expenses.types.ts';
import { getExpenseRepresentationPercent } from '../utils/expenseLedger.ts';

interface ExpensesTableProps {
  expenses: Expense[];
  categoryTotal: number;
  onUpdate: (id: string, update: ExpenseEditableUpdate) => void;
  onDelete: (id: string) => void;
}

function isExpenseValueType(value: string): value is ExpenseValueType {
  return value === 'LITERAL' || value === 'PERCENT';
}

export function ExpensesTable({ expenses, categoryTotal, onUpdate, onDelete }: ExpensesTableProps) {
  const columns = useMemo<GridColumn<Expense>[]>(() => [
    {
      header: TEXTS.expenses.columns.name,
      gridRatio: '1fr',
      textAlign: 'left',
      render: (expense) => (
        <div className="px-1 text-left w-full block">
          <input
            type="text"
            value={expense.name}
            onChange={(event) => onUpdate(expense.id, { field: 'name', value: event.target.value })}
            placeholder={TEXTS.expenses.fields.namePlaceholder}
            className={ERP_THEME.expenses.table.nameInput}
            data-ui-key={UI_KEYS.expenses.nameInput}
            aria-label={`${TEXTS.expenses.columns.name}: ${expense.name || TEXTS.expenses.fields.namePlaceholder}`}
          />
        </div>
      )
    },
    {
      header: TEXTS.expenses.columns.value,
      gridRatio: '120px',
      textAlign: 'center',
      render: (expense) => (
        <input
          type="number"
          step="any"
          min={APP_CONFIG.expenses.limits.minValue}
          value={expense.value || ''}
          onChange={(event) => onUpdate(expense.id, { field: 'value', value: Number(event.target.value) })}
          placeholder={TEXTS.expenses.fields.valuePlaceholder}
          className={ERP_THEME.expenses.table.valueInput}
          data-ui-key={UI_KEYS.expenses.valueInput}
          aria-label={`${TEXTS.expenses.columns.value}: ${expense.name}`}
        />
      )
    },
    {
      header: TEXTS.expenses.columns.valueType,
      gridRatio: '140px',
      textAlign: 'center',
      render: (expense) => (
        <select
          value={expense.valueType}
          onChange={(event) => {
            if (isExpenseValueType(event.target.value)) {
              onUpdate(expense.id, { field: 'valueType', value: event.target.value });
            }
          }}
          className={ERP_THEME.expenses.table.valueTypeSelect}
          data-ui-key={UI_KEYS.expenses.valueTypeSelect}
          aria-label={`${TEXTS.expenses.columns.valueType}: ${expense.name}`}
        >
          <option value="LITERAL">{TEXTS.expenses.fields.literal}</option>
          <option value="PERCENT">{TEXTS.expenses.fields.percent}</option>
        </select>
      )
    },
    {
      header: TEXTS.expenses.columns.representation,
      gridRatio: '120px',
      textAlign: 'center',
      render: (expense) => {
        const representation = getExpenseRepresentationPercent(expense, categoryTotal);
        return (
          <span className={ERP_THEME.expenses.table.representation} data-ui-key={UI_KEYS.expenses.representation}>
            {Number.isFinite(representation) ? representation.toFixed(2) : '0.00'}%
          </span>
        );
      }
    },
    {
      header: TEXTS.expenses.columns.actions,
      gridRatio: '60px',
      textAlign: 'center',
      render: (expense) => (
        <button
          type="button"
          onClick={() => onDelete(expense.id)}
          className={ERP_THEME.expenses.table.deleteButton}
          title={TEXTS.expenses.actions.deleteTitle}
          aria-label={`${TEXTS.expenses.actions.delete}: ${expense.name}`}
          data-ui-key={UI_KEYS.expenses.deleteAction}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )
    }
  ], [categoryTotal, onDelete, onUpdate]);

  return (
    <div data-ui-key={UI_KEYS.expenses.table}>
      <UniversalGridTable
        columns={columns}
        data={expenses}
        emptyMessage={TEXTS.expenses.page.emptyState}
      />
    </div>
  );
}
