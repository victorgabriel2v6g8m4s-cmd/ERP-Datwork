import { Prisma } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { AppointmentResponse, AppointmentSubStatus } from '../../../contracts/appointment/AppointmentContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentAppointment } from '../../../presenters/appointment/AppointmentPresenter.js';

interface UpdateSubStatusRequest {
  id: string;
  subStatus: AppointmentSubStatus;
}

export class UpdateSubStatusService {
  async execute({ id, subStatus }: UpdateSubStatusRequest): Promise<AppointmentResponse> {
    CustomLogger.info(`[Agenda] Updating sub-status for appointment ${id} to ${subStatus}`);
    try {
      const updated = await prismaClient.appointment.update({ where: { id }, data: { subStatus } });
      return presentAppointment(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('AppointmentNotFoundException');
      }
      CustomLogger.error(`[Agenda] Failed to update sub-status for appointment ${id}`, error);
      throw error;
    }
  }
}
