import { AppointmentStatus, Prisma } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { AppointmentResponse } from '../../../contracts/appointment/AppointmentContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentAppointment } from '../../../presenters/appointment/AppointmentPresenter.js';

export class DeleteAppointmentService {
  async execute({ id }: { id: string }): Promise<AppointmentResponse> {
    CustomLogger.info(`[Agenda] Soft-canceling appointment ${id}`);
    try {
      const updated = await prismaClient.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.CANCELED }
      });
      return presentAppointment(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('AppointmentNotFoundException');
      }
      CustomLogger.error(`[Agenda] Failed to cancel appointment ${id}`, error);
      throw error;
    }
  }
}
