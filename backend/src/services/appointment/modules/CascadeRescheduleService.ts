import { Prisma } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { AppointmentCascadeInput, AppointmentResponse } from '../../../contracts/appointment/AppointmentContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentAppointmentList } from '../../../presenters/appointment/AppointmentPresenter.js';

const MILLIS_BY_UNIT = {
  MINUTES: 60 * 1000,
  HOURS: 60 * 60 * 1000,
  DAYS: 24 * 60 * 60 * 1000,
  WEEKS: 7 * 24 * 60 * 60 * 1000
} as const;

function shiftAppointmentDateTime(
  createdAt: Date,
  time: string,
  offsetValue: number,
  unit: AppointmentCascadeInput['unit'],
  direction: AppointmentCascadeInput['actionType']
): { createdAt: Date; time: string } {
  const datePart = createdAt.toISOString().slice(0, 10);
  const combined = new Date(`${datePart}T${time}:00.000Z`);
  const signedOffset = direction === 'ANTERIOR' ? -offsetValue : offsetValue;

  if (unit === 'MONTHS') {
    combined.setUTCMonth(combined.getUTCMonth() + signedOffset);
  } else {
    combined.setTime(combined.getTime() + signedOffset * MILLIS_BY_UNIT[unit]);
  }

  const nextDate = new Date(Date.UTC(
    combined.getUTCFullYear(),
    combined.getUTCMonth(),
    combined.getUTCDate()
  ));
  const hours = String(combined.getUTCHours()).padStart(2, '0');
  const minutes = String(combined.getUTCMinutes()).padStart(2, '0');
  return { createdAt: nextDate, time: `${hours}:${minutes}` };
}

export class CascadeRescheduleService {
  async execute(payload: AppointmentCascadeInput): Promise<AppointmentResponse[]> {
    CustomLogger.info(`[Agenda] Running ${payload.actionType} cascade for ${payload.appointmentIds.length} appointments`);

    try {
      const updatedList = await prismaClient.$transaction(async (tx) => {
        const ordered = await tx.appointment.findMany({
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
        });
        const targetIndex = ordered.findIndex((appointment) => appointment.id === payload.targetId);
        if (targetIndex < 0) throw new Error('AppointmentNotFoundException');

        const [target] = ordered.splice(targetIndex, 1);
        if (!target) throw new Error('AppointmentNotFoundException');
        const destination = Math.min(payload.newPosition, ordered.length);
        ordered.splice(destination, 0, target);

        await Promise.all(ordered.map((appointment, position) => (
          appointment.position === position
            ? Promise.resolve()
            : tx.appointment.update({ where: { id: appointment.id }, data: { position } })
        )));

        const affected = await tx.appointment.findMany({
          where: { id: { in: payload.appointmentIds } }
        });
        if (affected.length !== payload.appointmentIds.length) {
          throw new Error('AppointmentNotFoundException');
        }

        await Promise.all(affected.map((appointment) => {
          const shifted = shiftAppointmentDateTime(
            appointment.createdAt,
            appointment.time,
            payload.offsetValue,
            payload.unit,
            payload.actionType
          );
          return tx.appointment.update({
            where: { id: appointment.id },
            data: { ...shifted, subStatus: 'REAGENDADO' }
          });
        }));

        await tx.appointment.update({
          where: { id: payload.targetId },
          data: { subStatus: 'REAGENDADO' }
        });

        return tx.appointment.findMany({
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
        });
      });

      return presentAppointmentList(updatedList);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('AppointmentNotFoundException');
      }
      CustomLogger.error('[Agenda] Cascade reschedule failed', error);
      throw error;
    }
  }
}
