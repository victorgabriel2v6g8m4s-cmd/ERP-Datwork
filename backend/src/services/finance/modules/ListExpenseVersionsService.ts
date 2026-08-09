import prismaClient from '../../../config/prisma.js';
import { SERVER_CONFIG } from '../../../config/serverConfig.js';
import type { ExpenseVersionResponse } from '../../../contracts/finance/ExpenseContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import {
  ExpenseSnapshotValidationError,
  parseStoredExpenseSnapshot
} from '../../../utils/expense/ExpenseSnapshot.js';

export class ListExpenseVersionsService {
  async execute(): Promise<ExpenseVersionResponse[]> {
    const versions = await prismaClient.expenseVersion.findMany({
      orderBy: { versionDate: 'desc' },
      take: SERVER_CONFIG.expenses.history.maxVersions
    });

    const parsed: ExpenseVersionResponse[] = [];

    for (const version of versions) {
      try {
        parsed.push({
          id: version.id,
          snapshotData: parseStoredExpenseSnapshot(version.snapshotData),
          versionDate: version.versionDate.toISOString()
        });
      } catch (error) {
        if (error instanceof ExpenseSnapshotValidationError) {
          CustomLogger.warn(`[Expenses] Ignoring malformed expense snapshot ${version.id}: ${error.message}`);
          continue;
        }
        throw error;
      }
    }

    return parsed;
  }
}
