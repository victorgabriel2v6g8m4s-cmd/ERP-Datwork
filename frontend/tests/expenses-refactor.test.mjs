import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const { APP_CONFIG } = await import('../src/config/app.config.ts');
const { UI_KEYS } = await import('../src/ui/keys.ts');
const {
  parseExpensesOverviewResponse,
  parseExpenseVersionsResponse
} = await import('../src/pages/Expenses/utils/expenseContract.ts');
const {
  buildExpenseMutationPayload,
  filterAndSortExpenses,
  getExpenseRepresentationPercent
} = await import('../src/pages/Expenses/utils/expenseLedger.ts');

function expenseResponse(overrides = {}) {
  return {
    id: 'expense-1',
    name: 'Aluguel',
    value: 1200,
    valueType: 'LITERAL',
    category: 'FIXED',
    status: 'ACTIVE',
    position: 0,
    createdAt: '2026-08-09T00:00:00.000Z',
    updatedAt: '2026-08-09T00:00:00.000Z',
    ...overrides
  };
}

async function collectTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectTypeScriptFiles(path));
    else if (/\.tsx?$/.test(entry.name)) files.push(path);
  }
  return files;
}

test('Expenses overview parser validates metrics and expense contracts', () => {
  const parsed = parseExpensesOverviewResponse({
    expenses: [expenseResponse()],
    fixedCostPerUnitFactor: 1.2,
    totalVariablePercent: 8
  });

  assert.ok(parsed);
  assert.equal(parsed.expenses[0]?.name, 'Aluguel');
  assert.equal(parsed.fixedCostPerUnitFactor, 1.2);
  assert.equal(parseExpensesOverviewResponse({ expenses: [expenseResponse({ value: -1 })], fixedCostPerUnitFactor: 1, totalVariablePercent: 8 }), null);
  assert.equal(parseExpensesOverviewResponse({ expenses: [], fixedCostPerUnitFactor: '1', totalVariablePercent: 8 }), null);
});

test('Expense history accepts native snapshots and controlled legacy serialization', () => {
  const native = parseExpenseVersionsResponse([{
    id: 'version-1',
    versionDate: '2026-08-09T01:00:00.000Z',
    snapshotData: [expenseResponse()]
  }]);
  const legacy = parseExpenseVersionsResponse([{
    id: 'version-2',
    versionDate: '2026-08-09T02:00:00.000Z',
    snapshotData: JSON.stringify([expenseResponse()])
  }]);

  assert.equal(native?.[0]?.snapshotData[0]?.id, 'expense-1');
  assert.equal(legacy?.[0]?.snapshotData[0]?.id, 'expense-1');
  assert.equal(parseExpenseVersionsResponse([{ id: 'x', versionDate: 'invalid', snapshotData: [] }]), null);
});

test('Expense ledger utilities exclude drafts and keep calculations deterministic', () => {
  const persisted = expenseResponse();
  const blankDraft = expenseResponse({ id: 'temp-1', name: '', value: 0, position: 1 });
  const percent = expenseResponse({ id: 'expense-2', name: 'Taxa', value: 10, valueType: 'PERCENT', category: 'VARIABLE', position: 2 });
  const payload = buildExpenseMutationPayload([persisted, blankDraft, percent]);

  assert.equal(payload.length, 2);
  assert.equal(payload[0]?.id, 'expense-1');
  assert.equal(payload[1]?.category, 'VARIABLE');
  assert.equal(getExpenseRepresentationPercent(percent, 0), 10);

  const filters = { search: '', sortBy: 'value', abcCategory: 'all', unitFilter: 'all' };
  const sorted = filterAndSortExpenses([persisted, expenseResponse({ id: 'expense-3', name: 'Energia', value: 300 })], 'FIXED', filters);
  assert.equal(sorted[0]?.value, 1200);
});

test('Expenses configuration centralizes real endpoints and autosave behavior', () => {
  assert.equal(APP_CONFIG.api.endpoints.expenses.overview, '/expenses');
  assert.equal(APP_CONFIG.api.endpoints.expenses.versions, '/expenses/versions');
  assert.equal(APP_CONFIG.api.endpoints.expenses.status('expense 1'), '/expenses/expense%201/status');
  assert.equal(APP_CONFIG.api.endpoints.expenses.restoreVersion('version 1'), '/expenses/versions/version%201/restore');
  assert.equal(APP_CONFIG.expenses.interactions.autosaveDebounceMs, 800);
  assert.equal(UI_KEYS.expenses.valueInput, 'expenses.row.value');
});

test('Expenses module enforces service, text, theme and UI-key boundaries', async () => {
  const sourceRoot = fileURLToPath(new URL('../src/pages/Expenses/', import.meta.url));
  const files = await collectTypeScriptFiles(sourceRoot);
  const serviceFiles = files.filter((file) => file.includes(`${join('Expenses', 'services')}`));
  const nonServiceFiles = files.filter((file) => !serviceFiles.includes(file));
  const serviceSource = (await Promise.all(serviceFiles.map((file) => readFile(file, 'utf8')))).join('\n');
  const nonServiceSource = (await Promise.all(nonServiceFiles.map((file) => readFile(file, 'utf8')))).join('\n');
  const combined = `${serviceSource}\n${nonServiceSource}`;
  const historySource = await readFile(join(sourceRoot, 'components', 'ExpenseHistoryModal.tsx'), 'utf8');

  assert.match(serviceSource, /api\/client/);
  assert.doesNotMatch(nonServiceSource, /api\/client/);
  assert.doesNotMatch(combined, /console\.(?:log|warn|error)/);
  assert.doesNotMatch(combined, /:\s*any\b|as\s+any\b/);
  assert.doesNotMatch(combined, /['"]\/expenses\/bulk['"]/);
  assert.doesNotMatch(historySource, /JSON\.parse/);
  assert.match(combined, /TEXTS\.expenses/);
  assert.match(combined, /ERP_THEME\.expenses/);
  assert.match(combined, /UI_KEYS\.expenses/);
  assert.match(combined, /expensesService/);
});
