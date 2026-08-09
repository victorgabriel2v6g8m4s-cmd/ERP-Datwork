import { AppointmentStatus } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { AppointmentMutationInput, AppointmentResponse } from '../../../contracts/appointment/AppointmentContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentAppointment } from '../../../presenters/appointment/AppointmentPresenter.js';
import { toAppointmentFinancialJson, toAppointmentMediaJson } from '../utils/AppointmentJson.js';

export class CreateAppointmentService {
  async execute(data: AppointmentMutationInput): Promise<AppointmentResponse> {
    CustomLogger.info('[Agenda] Creating appointment', { title: data.title });

    const appointment = await prismaClient.$transaction(async (tx) => {
      const lastAppointment = await tx.appointment.findFirst({
        orderBy: { position: 'desc' },
        select: { position: true }
      });

      return tx.appointment.create({
        data: {
          ...data,
          medias: toAppointmentMediaJson(data.medias),
          financials: toAppointmentFinancialJson(data.financials),
          position: lastAppointment ? lastAppointment.position + 1 : 0,
          status: AppointmentStatus.PENDING
        }
      });
    });

    return presentAppointment(appointment);
  }
}
