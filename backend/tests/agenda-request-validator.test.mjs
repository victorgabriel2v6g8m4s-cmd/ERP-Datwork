import test from 'node:test';
import assert from 'node:assert/strict';

const {
  AppointmentRequestValidationError,
  parseAppointmentCreate,
  parseAppointmentSubStatus,
  parseAppointmentCascade,
  parseAppointmentOrder
} = await import('../dist/controllers/appointment/utils/AppointmentRequestValidator.js');

function validCreate(overrides = {}) {
  return {
    title: 'Consulta',
    time: '14:30',
    createdAt: '2026-08-10',
    description: null,
    medias: [{ id: 'media-1', name: 'briefing.pdf', url: '/briefing.pdf', type: 'document' }],
    financials: [{ value: 150, type: 'income', description: 'Entrada' }],
    firstName: 'Ana',
    ...overrides
  };
}

test('appointment validator normalizes create payload and applies default sub-status', () => {
  const payload = parseAppointmentCreate(validCreate());
  assert.equal(payload.title, 'Consulta');
  assert.equal(payload.time, '14:30');
  assert.equal(payload.subStatus, 'CONFIRMADO');
  assert.equal(payload.createdAt.toISOString(), '2026-08-10T00:00:00.000Z');
  assert.equal(payload.medias[0]?.type, 'document');
  assert.equal(payload.financials[0]?.value, 150);
});

test('appointment validator rejects invalid time, media and arbitrary sub-status values', () => {
  assert.throws(() => parseAppointmentCreate(validCreate({ time: '25:90' })), AppointmentRequestValidationError);
  assert.throws(() => parseAppointmentCreate(validCreate({ medias: [{ id: 'x', name: 'x', url: '/x', type: 'binary' }] })), AppointmentRequestValidationError);
  assert.throws(() => parseAppointmentSubStatus('CUSTOM_STATUS'), AppointmentRequestValidationError);
});

test('appointment cascade validator rejects duplicates and unsafe position values', () => {
  assert.throws(() => parseAppointmentCascade({
    appointmentIds: ['a', 'a'], offsetValue: 1, unit: 'HOURS', newPosition: 0, targetId: 'b', actionType: 'POSTERIOR'
  }), AppointmentRequestValidationError);

  assert.throws(() => parseAppointmentCascade({
    appointmentIds: ['a'], offsetValue: 1, unit: 'HOURS', newPosition: -1, targetId: 'b', actionType: 'POSTERIOR'
  }), AppointmentRequestValidationError);

  const parsed = parseAppointmentCascade({
    appointmentIds: ['a'], offsetValue: 2, unit: 'HOURS', newPosition: 1, targetId: 'b', actionType: 'ANTERIOR'
  });
  assert.equal(parsed.unit, 'HOURS');
  assert.equal(parsed.actionType, 'ANTERIOR');
});

test('appointment reorder validator requires a valid ID and a non-negative integer position', () => {
  assert.deepEqual(parseAppointmentOrder(' appointment-1 ', { newPosition: '2' }), {
    id: 'appointment-1',
    newPosition: 2
  });

  assert.throws(() => parseAppointmentOrder('', { newPosition: 0 }), AppointmentRequestValidationError);
  assert.throws(() => parseAppointmentOrder('appointment-1', { newPosition: -1 }), AppointmentRequestValidationError);
  assert.throws(() => parseAppointmentOrder('appointment-1', { newPosition: 1.5 }), AppointmentRequestValidationError);
  assert.throws(() => parseAppointmentOrder('appointment-1', {}), AppointmentRequestValidationError);
});
