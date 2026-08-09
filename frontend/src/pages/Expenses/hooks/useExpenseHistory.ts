import { useCallback, useEffect, useState } from 'react';
import { TEXTS } from '../../../i18n/index.ts';
import type { ExpenseVersion } from '../../../types/expense.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { expensesService } from '../services/expenses.service.ts';

export function useExpenseHistory(isOpen: boolean) {
  const [versions, setVersions] = useState<ExpenseVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      setVersions(await expensesService.listVersions());
    } catch (error) {
      setVersions([]);
      setErrorMessage(TEXTS.expenses.errors.history);
      CustomLogger.error(`[Expenses] ${TEXTS.expenses.errors.history}`, error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) void load();
  }, [isOpen, load]);

  return { versions, loading, errorMessage, reload: load };
}
