import { AppointmentStatus, Prisma } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { AppointmentResponse } from '../../../contracts/appointment/AppointmentContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentAppointment } from '../../../presenters/appointment/AppointmentPresenter.js';

interface StatusRequest {
  id: string;
  status: AppointmentStatus;
}

export class UpdateAppointmentStatusService {
  async execute({ id, status }: StatusRequest): Promise<AppointmentResponse> {
    CustomLogger.info(`[Agenda] Updating status for appointment ${id} to ${status}`);
    try {
      const updated = await prismaClient.appointment.update({ where: { id }, data: { status } });
      return presentAppointment(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('AppointmentNotFoundException');
      }
      CustomLogger.error(`[Agenda] Failed to update status for appointment ${id}`, error);
      throw error;
    }
  }
}
