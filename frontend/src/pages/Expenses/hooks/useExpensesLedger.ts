import { useCallback, useEffect, useRef, useState } from 'react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { TEXTS } from '../../../i18n/index.ts';
import type {
  Expense,
  ExpenseCategory,
  ExpenseMetrics,
  ExpensesOverview
} from '../../../types/expense.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { expensesService } from '../services/expenses.service.ts';
import type { ExpenseEditableUpdate, ExpensesSyncStatus } from '../types/expenses.types.ts';
import {
  applyExpenseUpdate,
  buildExpenseMutationPayload,
  createBlankExpense,
  serializeExpensePayload
} from '../utils/expenseLedger.ts';

const INITIAL_METRICS: ExpenseMetrics = {
  fixedCostPerUnitFactor: 0,
  totalVariablePercent: 0
};

function isBlankDraft(expense: Expense): boolean {
  return expense.id.startsWith('temp-') && !expense.name.trim() && expense.value === 0;
}

export function useExpensesLedger(activeCategory: ExpenseCategory) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [metrics, setMetrics] = useState<ExpenseMetrics>(INITIAL_METRICS);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<ExpensesSyncStatus>('saved');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSnapshotRef = useRef('');
  const tempCounterRef = useRef(0);
  const suspendAutosaveRef = useRef(false);

  const applyOverview = useCallback((overview: ExpensesOverview, preserveBlankDrafts: boolean) => {
    lastSavedSnapshotRef.current = serializeExpensePayload(buildExpenseMutationPayload(overview.expenses));
    setMetrics({
      fixedCostPerUnitFactor: overview.fixedCostPerUnitFactor,
      totalVariablePercent: overview.totalVariablePercent
    });
    setExpenses((current) => {
      if (!preserveBlankDrafts) return overview.expenses;
      return [...overview.expenses, ...current.filter(isBlankDraft)];
    });
  }, []);

  const load = useCallback(async () => {
    try {
      const overview = await expensesService.getOverview();
      applyOverview(overview, false);
      setSyncStatus('saved');
    } catch (error) {
      setSyncStatus('error');
      CustomLogger.error(`[Expenses] ${TEXTS.expenses.errors.load}`, error);
    } finally {
      setLoading(false);
    }
  }, [applyOverview]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const categoryExpenses = expenses.filter((expense) => (
      expense.category === activeCategory && expense.status === 'ACTIVE'
    ));
    if (categoryExpenses.some(isBlankDraft)) return;

    const last = categoryExpenses[categoryExpenses.length - 1];
    if (categoryExpenses.length > 0 && last && !last.name.trim() && last.value === 0) return;

    tempCounterRef.current += 1;
    const maxPosition = expenses.reduce((max, expense) => Math.max(max, expense.position), -1);
    const id = `temp-${Date.now()}-${tempCounterRef.current}`;
    setExpenses((current) => [...current, createBlankExpense(id, activeCategory, maxPosition + 1)]);
  }, [activeCategory, expenses, loading]);

  useEffect(() => {
    if (loading || suspendAutosaveRef.current) return;

    const payload = buildExpenseMutationPayload(expenses);
    if (payload.length === 0) return;

    const snapshot = serializeExpensePayload(payload);
    if (snapshot === lastSavedSnapshotRef.current) {
      setSyncStatus('saved');
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSyncStatus('saving');

    debounceRef.current = setTimeout(async () => {
      try {
        const overview = await expensesService.save(payload);
        applyOverview(overview, true);
        setSyncStatus('saved');
      } catch (error) {
        setSyncStatus('error');
        CustomLogger.error(`[Expenses] ${TEXTS.expenses.errors.save}`, error);
      } finally {
        debounceRef.current = null;
      }
    }, APP_CONFIG.expenses.interactions.autosaveDebounceMs);
  }, [applyOverview, expenses, loading]);

  const updateExpense = useCallback((id: string, update: ExpenseEditableUpdate) => {
    setExpenses((current) => applyExpenseUpdate(current, id, update));
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    if (id.startsWith('temp-')) {
      setExpenses((current) => current.filter((expense) => expense.id !== id));
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    suspendAutosaveRef.current = true;
    setExpenses((current) => current.filter((expense) => expense.id !== id));

    try {
      const overview = await expensesService.updateStatus(id, 'INACTIVE');
      suspendAutosaveRef.current = false;
      applyOverview(overview, true);
      setSyncStatus('saved');
    } catch (error) {
      suspendAutosaveRef.current = false;
      setSyncStatus('error');
      CustomLogger.error(`[Expenses] ${TEXTS.expenses.errors.delete}`, error);
      await load();
    }
  }, [applyOverview, load]);

  const restoreVersion = useCallback(async (versionId: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    suspendAutosaveRef.current = true;
    setSyncStatus('saving');

    try {
      const overview = await expensesService.restoreVersion(versionId);
      suspendAutosaveRef.current = false;
      applyOverview(overview, false);
      setSyncStatus('saved');
    } catch (error) {
      suspendAutosaveRef.current = false;
      setSyncStatus('error');
      CustomLogger.error(`[Expenses] ${TEXTS.expenses.errors.restore}`, error);
      throw error;
    }
  }, [applyOverview]);

  return {
    expenses,
    metrics,
    loading,
    syncStatus,
    updateExpense,
    deleteExpense,
    restoreVersion,
    reload: load
  };
}
