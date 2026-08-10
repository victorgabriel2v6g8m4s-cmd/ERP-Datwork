import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createMigratedTestDatabase } from './helpers/create-test-database.mjs';

const databasePath = fileURLToPath(new URL('../expenses-contract-integration.db', import.meta.url));
const databaseUrl = 'file:./expenses-contract-integration.db';

process.env.DATABASE_URL = databaseUrl;
await createMigratedTestDatabase(databasePath);

const { ListExpensesService } = await import('../dist/services/finance/modules/ListExpensesService.js');
const { ListExpenseVersionsService } = await import('../dist/services/finance/modules/ListExpenseVersionsService.js');
const { RestoreExpenseVersionService } = await import('../dist/services/finance/modules/RestoreExpenseVersionService.js');
const { SaveExpensesService } = await import('../dist/services/finance/modules/SaveExpensesService.js');
const { UpdateExpenseStatusService } = await import('../dist/services/finance/modules/UpdateExpenseStatusService.js');
const { default: prismaClient } = await import('../dist/config/prisma.js');

after(async () => {
  await prismaClient.$disconnect();
  await rm(databasePath, { force: true });
});

test('expense services persist canonical overview and restore server-side snapshots', async () => {
  await prismaClient.pricingSetting.upsert({
    where: { id: 'GLOBAL_CONFIG' },
    create: { id: 'GLOBAL_CONFIG', maxProductionCap: 100 },
    update: { maxProductionCap: 100 }
  });

  const saveService = new SaveExpensesService();
  const firstOverview = await saveService.execute([
    { name: 'Aluguel', value: 1000, valueType: 'LITERAL', category: 'FIXED' },
    { name: 'Taxa de cartão', value: 8, valueType: 'PERCENT', category: 'VARIABLE' }
  ]);

  assert.equal(firstOverview.expenses.length, 2);
  assert.equal(firstOverview.fixedCostPerUnitFactor, 10);
  assert.equal(firstOverview.totalVariablePercent, 8);
  assert.equal(typeof firstOverview.expenses[0]?.createdAt, 'string');

  const fixedExpense = firstOverview.expenses.find((expense) => expense.category === 'FIXED');
  const variableExpense = firstOverview.expenses.find((expense) => expense.category === 'VARIABLE');
  assert.ok(fixedExpense);
  assert.ok(variableExpense);

  const secondOverview = await saveService.execute([
    {
      id: fixedExpense.id,
      name: fixedExpense.name,
      value: 2000,
      valueType: fixedExpense.valueType,
      category: fixedExpense.category
    },
    {
      id: variableExpense.id,
      name: variableExpense.name,
      value: 12,
      valueType: variableExpense.valueType,
      category: variableExpense.category
    }
  ]);

  assert.equal(secondOverview.fixedCostPerUnitFactor, 20);
  assert.equal(secondOverview.totalVariablePercent, 12);

  const afterDelete = await new UpdateExpenseStatusService().execute(fixedExpense.id, 'INACTIVE');
  assert.equal(afterDelete.expenses.some((expense) => expense.id === fixedExpense.id), false);

  const versions = await new ListExpenseVersionsService().execute();
  const firstSnapshot = versions.find((version) => (
    version.snapshotData.some((expense) => expense.id === fixedExpense.id && expense.value === 1000)
  ));
  assert.ok(firstSnapshot);

  const restored = await new RestoreExpenseVersionService().execute(firstSnapshot.id);
  const restoredFixed = restored.expenses.find((expense) => expense.id === fixedExpense.id);
  const restoredVariable = restored.expenses.find((expense) => expense.id === variableExpense.id);

  assert.ok(restoredFixed);
  assert.ok(restoredVariable);
  assert.equal(restoredFixed.value, 1000);
  assert.equal(restoredVariable.value, 8);
  assert.equal(restored.fixedCostPerUnitFactor, 10);
  assert.equal(restored.totalVariablePercent, 8);

  const persisted = await prismaClient.expense.findUnique({ where: { id: fixedExpense.id } });
  assert.equal(persisted?.status, 'ACTIVE');
  assert.equal(persisted?.value, 1000);

  const listed = await new ListExpensesService().execute();
  assert.equal(listed.expenses.length, 2);
});
