import prismaClient from '../../../config/prisma.js';
import { type Appointment, Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface UpdateRequest {
  id: string;
  title: string;
  time: string;
  createdAt: string;
  subStatus?: string;
  description?: string | null;
  medias?: any;      // ✨ Sincronizado com o tipo Json do Schema
  financials?: any;  // ✨ Sincronizado com o tipo Json do Schema

  // Campos opcionais das categorias do Accordion
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

export class UpdateAppointmentService {
  async execute(data: UpdateRequest): Promise<Appointment> {
    CustomLogger.info(`Iniciando atualização completa do agendamento ${data.id}`);

    // ✨ Validação preventiva da data
    const parsedDate = new Date(data.createdAt);
    if (isNaN(parsedDate.getTime())) {
      CustomLogger.error('Data inválida fornecida para atualização', { createdAt: data.createdAt });
      throw new Error('InvalidDateException');
    }

    try {
      // ✨ Clean Code: Isola o id e o texto da data, jogando o resto das propriedades em 'restOfData'
      const { id, createdAt, ...restOfData } = data;

      // ✨ Otimização: Executa o update direto economizando uma query no banco
      return await prismaClient.appointment.update({
        where: { id },
        data: {
          ...restOfData,
          createdAt: parsedDate,
        },
      });
    } catch (error) {
      // ✨ Captura o erro nativo do Prisma para id não encontrado (P2025)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        CustomLogger.warn(`Tentativa de atualização falhou: ID ${data.id} não encontrado`);
        throw new Error('AppointmentNotFoundException');
      }

      CustomLogger.error(`Falha ao atualizar dados do agendamento ${data.id}`, error);
      throw error;
    }
  }
}
