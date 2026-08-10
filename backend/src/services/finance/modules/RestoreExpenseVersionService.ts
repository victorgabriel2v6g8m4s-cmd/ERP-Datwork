import prismaClient from '../../../config/prisma.js';
import type { ExpensesOverviewResponse } from '../../../contracts/finance/ExpenseContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { presentExpenseList } from '../../../presenters/finance/ExpensePresenter.js';
import { parseStoredExpenseSnapshot, buildExpenseSnapshotData } from '../../../utils/expense/ExpenseSnapshot.js';
import { calculateExpenseMetrics } from '../utils/ExpenseMetrics.js';
import { readPricingSettings } from '../utils/PricingSettingsReader.js';

export class RestoreExpenseVersionService {
  async execute(versionId: string): Promise<ExpensesOverviewResponse> {
    const version = await prismaClient.expenseVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new Error('ExpenseVersionNotFoundException');

    const snapshot = parseStoredExpenseSnapshot(version.snapshotData);
    const snapshotIds = snapshot.map((expense) => expense.id);

    CustomLogger.info(`[Expenses] Restoring expense snapshot ${versionId} with ${snapshot.length} rows`);

    const activeExpenses = await prismaClient.$transaction(async (tx) => {
      if (snapshotIds.length > 0) {
        await tx.expense.updateMany({
          where: {
            status: 'ACTIVE',
            id: { notIn: snapshotIds }
          },
          data: { status: 'INACTIVE' }
        });
      } else {
        await tx.expense.updateMany({
          where: { status: 'ACTIVE' },
          data: { status: 'INACTIVE' }
        });
      }

      for (const [position, expense] of snapshot.entries()) {
        await tx.expense.upsert({
          where: { id: expense.id },
          create: {
            id: expense.id,
            name: expense.name,
            value: expense.value,
            valueType: expense.valueType,
            category: expense.category,
            status: 'ACTIVE',
            position,
            createdAt: new Date(expense.createdAt)
          },
          update: {
            name: expense.name,
            value: expense.value,
            valueType: expense.valueType,
            category: expense.category,
            status: 'ACTIVE',
            position
          }
        });
      }

      const current = await tx.expense.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { position: 'asc' }
      });

      await tx.expenseVersion.create({
        data: { snapshotData: buildExpenseSnapshotData(current) }
      });

      return current;
    });

    await PricingEngine.recalculateAll();

    const settings = await readPricingSettings();

    return {
      expenses: presentExpenseList(activeExpenses),
      ...calculateExpenseMetrics(activeExpenses, settings.maxProductionCap)
    };
  }
}
