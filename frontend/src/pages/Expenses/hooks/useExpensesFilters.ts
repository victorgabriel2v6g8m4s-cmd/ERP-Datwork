import { useMemo, useState } from 'react';
import type { UniversalFilters } from '../../../components/UniversalSearchBar.tsx';
import type { Expense, ExpenseCategory } from '../../../types/expense.ts';
import { filterAndSortExpenses } from '../utils/expenseLedger.ts';

const INITIAL_FILTERS: UniversalFilters = {
  search: '',
  sortBy: 'custom',
  abcCategory: 'all',
  unitFilter: 'all'
};

export function useExpensesFilters(expenses: Expense[], category: ExpenseCategory) {
  const [filters, setFilters] = useState<UniversalFilters>(INITIAL_FILTERS);
  const filteredExpenses = useMemo(
    () => filterAndSortExpenses(expenses, category, filters),
    [category, expenses, filters]
  );

  return { filters, setFilters, filteredExpenses };
}
