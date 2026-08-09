import { Prisma } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type {
  ExpenseStatus,
  ExpensesOverviewResponse
} from '../../../contracts/finance/ExpenseContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { ListExpensesService } from './ListExpensesService.js';

export class UpdateExpenseStatusService {
  async execute(id: string, status: ExpenseStatus): Promise<ExpensesOverviewResponse> {
    CustomLogger.info(`[Expenses] Updating status for expense ${id} to ${status}`);

    try {
      await prismaClient.expense.update({
        where: { id },
        data: { status }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('ExpenseNotFoundException');
      }
      throw error;
    }

    await PricingEngine.recalculateAll();
    return new ListExpensesService().execute();
  }
}
