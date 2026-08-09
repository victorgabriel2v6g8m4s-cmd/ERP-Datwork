import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const backendRoot = fileURLToPath(new URL('../', import.meta.url));
const databasePath = fileURLToPath(new URL('../agenda-contract-integration.db', import.meta.url));
const databaseUrl = 'file:./agenda-contract-integration.db';
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

process.env.DATABASE_URL = databaseUrl;

execFileSync(npxCommand, ['prisma', 'migrate', 'deploy'], {
  cwd: backendRoot,
  env: { ...process.env, DATABASE_URL: databaseUrl },
  stdio: 'pipe'
});

const { CreateAppointmentService } = await import('../dist/services/appointment/modules/CreateAppointmentService.js');
const { ListAppointmentsService } = await import('../dist/services/appointment/modules/ListAppointmentsService.js');
const { CascadeRescheduleService } = await import('../dist/services/appointment/modules/CascadeRescheduleService.js');
const { parseAppointmentCreate } = await import('../dist/controllers/appointment/utils/AppointmentRequestValidator.js');
const { default: prismaClient } = await import('../dist/config/prisma.js');

after(async () => {
  await prismaClient.$disconnect();
  await rm(databasePath, { force: true });
});

test('agenda services expose canonical JSON, normalize legacy status and shift date plus time in cascades', async () => {
  const target = await new CreateAppointmentService().execute(parseAppointmentCreate({
    title: 'Atendimento alvo',
    time: '10:00',
    createdAt: '2026-08-10',
    medias: [],
    financials: []
  }));

  const affected = await prismaClient.appointment.create({
    data: {
      title: 'Atendimento afetado',
      time: '23:30',
      position: 1,
      status: 'SCHEDULED',
      subStatus: null,
      createdAt: new Date('2026-08-10T00:00:00.000Z'),
      medias: JSON.stringify([{ id: 'legacy-media', name: 'Foto', url: '/foto.jpg', type: 'image' }]),
      financials: JSON.stringify([{ value: 50, type: 'income', description: 'Entrada' }])
    }
  });

  const listed = await new ListAppointmentsService().execute();
  const legacyListed = listed.find((item) => item.id === affected.id);
  assert.ok(legacyListed);
  assert.equal(legacyListed.status, 'PENDING');
  assert.equal(legacyListed.subStatus, 'CONFIRMADO');
  assert.equal(legacyListed.medias[0]?.id, 'legacy-media');
  assert.equal(legacyListed.financials[0]?.value, 50);

  const cascaded = await new CascadeRescheduleService().execute({
    appointmentIds: [affected.id],
    offsetValue: 2,
    unit: 'HOURS',
    newPosition: 1,
    targetId: target.id,
    actionType: 'POSTERIOR'
  });

  const shifted = cascaded.find((item) => item.id === affected.id);
  const movedTarget = cascaded.find((item) => item.id === target.id);
  assert.ok(shifted);
  assert.ok(movedTarget);
  assert.equal(shifted.createdAt.slice(0, 10), '2026-08-11');
  assert.equal(shifted.time, '01:30');
  assert.equal(shifted.subStatus, 'REAGENDADO');
  assert.equal(movedTarget.subStatus, 'REAGENDADO');
  assert.deepEqual(cascaded.map((item) => item.position), [0, 1]);

  await prismaClient.appointment.deleteMany({ where: { id: { in: [target.id, affected.id] } } });
});
