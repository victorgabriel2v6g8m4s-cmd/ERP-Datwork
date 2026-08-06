import prismaClient from '../../../config/prisma.js';
import { type Appointment, AppointmentStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface CreateRequest {
  title: string;
  time: string;
  createdAt: string; // Data vinda do Wizard
  description?: string | null;
  medias?: any;      // ✨ Alterado para aceitar estruturas JSON do novo Schema
  financials?: any;  // ✨ Alterado para aceitar estruturas JSON do novo Schema
  firstName?: string | null;
  lastName?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  cep?: string | null;
  state?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  complement?: string | null;
  referencePoint?: string | null;
}

export class CreateAppointmentService {
  async execute(data: CreateRequest): Promise<Appointment> {
    CustomLogger.info('Iniciando persistência completa de agendamento', { title: data.title });

    // ✨ Validação preventiva da data do Wizard
    const parsedDate = new Date(data.createdAt);
    if (isNaN(parsedDate.getTime())) {
      CustomLogger.error('Data do Wizard inválida fornecida', { createdAt: data.createdAt });
      throw new Error('InvalidDateException');
    }

    try {
      // ✨ Usando transação para mitigar Race Conditions na concorrência da 'position'
      return await prismaClient.$transaction(async (tx) => {
        const lastAppointment = await tx.appointment.findFirst({
          orderBy: { position: 'desc' },
          select: { position: true } // Busca apenas a coluna necessária (Performance)
        });

        const nextPosition = lastAppointment ? lastAppointment.position + 1 : 0;

        // ✨ Clean Code: Separamos o que precisa de tratamento e usamos o spread no resto
        const { createdAt, ...restOfData } = data;

        return await tx.appointment.create({
          data: {
            ...restOfData,
            createdAt: parsedDate,
            position: nextPosition,
            status: AppointmentStatus.PENDING, // ✨ Utiliza o Enum estrito do Prisma
          }
        });
      });

    } catch (error) {
      CustomLogger.error('Falha ao inserir agendamento completo no banco', error);
      throw new Error('DatabaseInsertException');
    }
  }
}
