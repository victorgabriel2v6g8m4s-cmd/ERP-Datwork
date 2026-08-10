import prismaClient from '../../../config/prisma.js';
import type {
  ExpenseMutationInput,
  ExpensesOverviewResponse
} from '../../../contracts/finance/ExpenseContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { presentExpenseList } from '../../../presenters/finance/ExpensePresenter.js';
import { buildExpenseSnapshotData } from '../../../utils/expense/ExpenseSnapshot.js';
import { calculateExpenseMetrics } from '../utils/ExpenseMetrics.js';
import { readPricingSettings } from '../utils/PricingSettingsReader.js';

export class SaveExpensesService {
  async execute(expenses: ExpenseMutationInput[]): Promise<ExpensesOverviewResponse> {
    CustomLogger.info(`[Expenses] Persisting expense ledger with ${expenses.length} rows`);

    const activeExpenses = await prismaClient.$transaction(async (tx) => {
      const updates = expenses.flatMap((expense, position) => (
        expense.id
          ? [tx.expense.update({
              where: { id: expense.id },
              data: {
                name: expense.name,
                value: expense.value,
                valueType: expense.valueType,
                category: expense.category,
                position
              }
            })]
          : []
      ));

      const creates = expenses.flatMap((expense, position) => (
        expense.id
          ? []
          : [{
              name: expense.name,
              value: expense.value,
              valueType: expense.valueType,
              category: expense.category,
              position,
              status: 'ACTIVE' as const
            }]
      ));

      if (updates.length > 0) await Promise.all(updates);
      if (creates.length > 0) await tx.expense.createMany({ data: creates });

      const current = await tx.expense.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { position: 'asc' }
      });

      await tx.expenseVersion.create({
        data: { snapshotData: buildExpenseSnapshotData(current) }
      });

      return current;
    });

    CustomLogger.info('[Expenses] Ledger committed; recalculating dependent product pricing');
    await PricingEngine.recalculateAll();

    const settings = await readPricingSettings();

    return {
      expenses: presentExpenseList(activeExpenses),
      ...calculateExpenseMetrics(activeExpenses, settings.maxProductionCap)
    };
  }
}
