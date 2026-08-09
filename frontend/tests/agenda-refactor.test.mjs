import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const { APP_CONFIG } = await import('../src/config/app.config.ts');
const { UI_KEYS } = await import('../src/ui/keys.ts');
const { parseAppointmentResponse, parseAppointmentList } = await import('../src/pages/Agenda/utils/appointmentContract.ts');
const { filterAndSortAppointments } = await import('../src/pages/Agenda/utils/appointmentFilters.ts');
const { getAppointmentDayKey, formatAppointmentDate } = await import('../src/pages/Agenda/utils/appointmentSchedule.ts');

function appointmentResponse(overrides = {}) {
  return {
    id: 'appointment-1',
    title: 'Consulta Comercial',
    time: '14:30',
    position: 0,
    status: 'PENDING',
    subStatus: 'CONFIRMADO',
    description: 'Primeira reunião',
    medias: [{ id: 'media-1', name: 'briefing.pdf', url: '/uploads/briefing.pdf', type: 'document' }],
    financials: [{ value: 120, type: 'income', description: 'Entrada' }],
    firstName: 'Ana', lastName: 'Silva', documentType: 'CPF', documentNumber: null,
    phone: '67999999999', email: null, cep: null, state: null, city: 'Campo Grande', neighborhood: null,
    street: null, houseNumber: null, complement: null, referencePoint: null,
    createdAt: '2026-08-10T00:00:00.000Z',
    updatedAt: '2026-08-09T20:00:00.000Z',
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

test('Agenda contract accepts native JSON and controlled legacy arrays', () => {
  const native = parseAppointmentResponse(appointmentResponse());
  const legacy = parseAppointmentResponse(appointmentResponse({
    medias: JSON.stringify(appointmentResponse().medias),
    financials: JSON.stringify(appointmentResponse().financials)
  }));

  assert.equal(native?.medias[0]?.type, 'document');
  assert.equal(native?.financials[0]?.value, 120);
  assert.equal(legacy?.medias[0]?.name, 'briefing.pdf');
  assert.equal(legacy?.financials[0]?.description, 'Entrada');
  assert.equal(parseAppointmentResponse(appointmentResponse({ status: 'UNKNOWN' })), null);
});

test('Agenda contract applies centralized safe sub-status fallback', () => {
  const missing = parseAppointmentResponse(appointmentResponse({ subStatus: null }));
  const invalid = parseAppointmentResponse(appointmentResponse({ subStatus: 'CUSTOM_TEXT' }));
  assert.equal(missing?.subStatus, APP_CONFIG.agenda.defaults.subStatus);
  assert.equal(invalid?.subStatus, APP_CONFIG.agenda.defaults.subStatus);
});

test('Agenda schedule utilities preserve the stored calendar day independently from timezone parsing', () => {
  const createdAt = '2026-08-10T00:00:00.000Z';
  assert.equal(getAppointmentDayKey(createdAt), '2026-08-10');
  assert.equal(formatAppointmentDate(createdAt), '10/08/2026');
});

test('Agenda filtering searches customer data and applies chronological ordering', () => {
  const first = appointmentResponse();
  const second = appointmentResponse({ id: 'appointment-2', title: 'Retorno', firstName: 'Bruno', time: '09:00', position: 1, createdAt: '2026-08-11T00:00:00.000Z' });
  const filters = { search: 'bruno', sortBy: 'time', statusFilter: 'all', dateFilter: 'all' };
  const result = filterAndSortAppointments(parseAppointmentList([first, second]) ?? [], filters, { start: null, end: null }, true, new Date(2026, 7, 10));
  assert.deepEqual(result.map((item) => item.id), ['appointment-2']);

  const chronological = filterAndSortAppointments(parseAppointmentList([second, first]) ?? [], { ...filters, search: '' }, { start: null, end: null }, true, new Date(2026, 7, 10));
  assert.deepEqual(chronological.map((item) => item.id), ['appointment-1', 'appointment-2']);
});

test('Agenda configuration centralizes endpoints, gesture thresholds and visual keys', () => {
  assert.equal(APP_CONFIG.api.endpoints.agenda.appointments, '/appointments');
  assert.equal(APP_CONFIG.api.endpoints.agenda.status('a b'), '/appointments/a%20b/status');
  assert.equal(APP_CONFIG.api.endpoints.agenda.subStatus('a b'), '/appointments/a%20b/sub-status');
  assert.equal(APP_CONFIG.agenda.interactions.swipeActionThresholdPx, 150);
  assert.equal(APP_CONFIG.agenda.defaults.subStatus, 'CONFIRMADO');
  assert.equal(UI_KEYS.agenda.cardSubStatus, 'agenda.card.subStatus');
});

test('Agenda module enforces service-only HTTP and centralized text/theme/UI boundaries', async () => {
  const sourceRoot = fileURLToPath(new URL('../src/pages/Agenda/', import.meta.url));
  const files = await collectTypeScriptFiles(sourceRoot);
  const serviceFiles = files.filter((file) => file.includes(`${join('Agenda', 'services')}`));
  const nonServiceFiles = files.filter((file) => !serviceFiles.includes(file));
  const serviceSource = (await Promise.all(serviceFiles.map((file) => readFile(file, 'utf8')))).join('\n');
  const nonServiceSource = (await Promise.all(nonServiceFiles.map((file) => readFile(file, 'utf8')))).join('\n');
  const combined = `${serviceSource}\n${nonServiceSource}`;

  assert.match(serviceSource, /api\/client/);
  assert.doesNotMatch(nonServiceSource, /api\/client/);
  assert.doesNotMatch(nonServiceSource, /useGridGestures/);
  assert.doesNotMatch(nonServiceSource, /console\.(?:log|warn|error)/);
  assert.doesNotMatch(combined, /:\s*any\b|as\s+any\b/);
  assert.match(combined, /TEXTS\.agenda/);
  assert.match(combined, /ERP_THEME\.agenda/);
  assert.match(combined, /UI_KEYS\.agenda/);
  assert.match(combined, /agendaService/);
});
