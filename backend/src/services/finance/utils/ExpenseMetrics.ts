import type { ExpenseMetricsResponse } from '../../../contracts/finance/ExpenseContract.js';

interface ExpenseMetricInput {
  value: number;
  valueType: 'LITERAL' | 'PERCENT';
  category: 'FIXED' | 'VARIABLE';
}

export function calculateExpenseMetrics(
  expenses: readonly ExpenseMetricInput[],
  maxProductionCap: number
): ExpenseMetricsResponse {
  const totalFixedCost = expenses
    .filter((expense) => expense.category === 'FIXED')
    .reduce((total, expense) => total + expense.value, 0);

  const totalVariablePercent = expenses
    .filter((expense) => expense.category === 'VARIABLE' && expense.valueType === 'PERCENT')
    .reduce((total, expense) => total + expense.value, 0);

  return {
    fixedCostPerUnitFactor: totalFixedCost / Math.max(1, maxProductionCap),
    totalVariablePercent
  };
}
