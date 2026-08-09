import { Prisma } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { AppointmentResponse, AppointmentUpdateInput } from '../../../contracts/appointment/AppointmentContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentAppointment } from '../../../presenters/appointment/AppointmentPresenter.js';
import { toAppointmentFinancialJson, toAppointmentMediaJson } from '../utils/AppointmentJson.js';

export class UpdateAppointmentService {
  async execute(data: AppointmentUpdateInput): Promise<AppointmentResponse> {
    CustomLogger.info(`[Agenda] Updating appointment ${data.id}`);
    const { id, medias, financials, ...fields } = data;

    try {
      const updated = await prismaClient.appointment.update({
        where: { id },
        data: {
          ...fields,
          medias: toAppointmentMediaJson(medias),
          financials: toAppointmentFinancialJson(financials)
        }
      });
      return presentAppointment(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('AppointmentNotFoundException');
      }
      CustomLogger.error(`[Agenda] Failed to update appointment ${id}`, error);
      throw error;
    }
  }
}
