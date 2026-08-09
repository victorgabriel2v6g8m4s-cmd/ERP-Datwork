import test from 'node:test';
import assert from 'node:assert/strict';

const {
  ExpenseRequestValidationError,
  parseExpenseMutationList,
  parseExpenseStatusMutation
} = await import('../dist/controllers/finance/utils/ExpenseRequestValidator.js');
const {
  ExpenseSnapshotValidationError,
  parseStoredExpenseSnapshot
} = await import('../dist/utils/expense/ExpenseSnapshot.js');

function snapshotExpense(overrides = {}) {
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

test('expense request validator normalizes supported bulk mutations', () => {
  const parsed = parseExpenseMutationList([
    { id: ' expense-1 ', name: ' Aluguel ', value: '1200.50', valueType: 'LITERAL', category: 'FIXED' },
    { name: 'Taxa', value: 8, valueType: 'PERCENT', category: 'VARIABLE' }
  ]);

  assert.equal(parsed[0]?.id, 'expense-1');
  assert.equal(parsed[0]?.name, 'Aluguel');
  assert.equal(parsed[0]?.value, 1200.5);
  assert.equal(parsed[1]?.category, 'VARIABLE');
  assert.equal(parseExpenseStatusMutation({ status: 'INACTIVE' }), 'INACTIVE');
});

test('expense request validator rejects unsafe numbers, enums and duplicate IDs', () => {
  assert.throws(
    () => parseExpenseMutationList([{ name: 'X', value: -1, valueType: 'LITERAL', category: 'FIXED' }]),
    ExpenseRequestValidationError
  );
  assert.throws(
    () => parseExpenseMutationList([{ name: 'X', value: 1, valueType: 'OTHER', category: 'FIXED' }]),
    ExpenseRequestValidationError
  );
  assert.throws(
    () => parseExpenseMutationList([
      { id: 'same', name: 'A', value: 1, valueType: 'LITERAL', category: 'FIXED' },
      { id: 'same', name: 'B', value: 2, valueType: 'LITERAL', category: 'FIXED' }
    ]),
    ExpenseRequestValidationError
  );
  assert.throws(() => parseExpenseStatusMutation({ status: 'DELETED' }), ExpenseRequestValidationError);
});

test('stored expense snapshot parser supports native and legacy serialized arrays', () => {
  const native = parseStoredExpenseSnapshot([snapshotExpense()]);
  const legacy = parseStoredExpenseSnapshot(JSON.stringify([snapshotExpense()]));

  assert.equal(native[0]?.id, 'expense-1');
  assert.equal(legacy[0]?.name, 'Aluguel');
  assert.throws(
    () => parseStoredExpenseSnapshot([snapshotExpense({ createdAt: 'invalid' })]),
    ExpenseSnapshotValidationError
  );
});
