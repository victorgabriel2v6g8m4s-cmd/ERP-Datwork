import { AppointmentStatus, Prisma } from '@prisma/client';
import prismaClient from '../../../config/prisma.js';
import type { AppointmentResponse } from '../../../contracts/appointment/AppointmentContract.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentAppointmentList } from '../../../presenters/appointment/AppointmentPresenter.js';

interface ListFilterRequest {
  status?: AppointmentStatus;
}

export class ListAppointmentsService {
  async execute(filter?: ListFilterRequest): Promise<AppointmentResponse[]> {
    CustomLogger.info('[Agenda] Loading appointment queue', { filter });

    const where: Prisma.AppointmentWhereInput = {};
    if (filter?.status) where.status = filter.status;

    const appointments = await prismaClient.appointment.findMany({
      where,
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }]
    });

    return presentAppointmentList(appointments);
  }
}
