import prismaClient from '../../../config/prisma.js';
import type { ExpensesOverviewResponse } from '../../../contracts/finance/ExpenseContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentExpenseList } from '../../../presenters/finance/ExpensePresenter.js';
import { calculateExpenseMetrics } from '../utils/ExpenseMetrics.js';
import { readPricingSettings } from '../utils/PricingSettingsReader.js';

export class ListExpensesService {
  async execute(): Promise<ExpensesOverviewResponse> {
    CustomLogger.info('[Expenses] Loading active expense ledger');

    const [settings, expenses] = await Promise.all([
      readPricingSettings(),
      prismaClient.expense.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { position: 'asc' }
      })
    ]);

    return {
      expenses: presentExpenseList(expenses),
      ...calculateExpenseMetrics(expenses, settings.maxProductionCap)
    };
  }
}
