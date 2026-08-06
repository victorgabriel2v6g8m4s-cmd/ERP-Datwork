import prismaClient from '../../../config/prisma.js';
import { Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class CustomOrderService {
  // 💾 Salva ou atualiza um perfil de ordenação
  async save(name: string, positions: any[]) {
    CustomLogger.info('Salvando novo perfil de ordenação customizada', { name });

    try {
      return await prismaClient.customOrderProfile.create({
        // ✨ Otimização: Passa o array direto, o Prisma já lida com o formato JSON nativamente!
        data: {
          name,
          positions
        }
      });
    } catch (error) {
      CustomLogger.error('Erro ao criar perfil de ordenação customizada', error);
      throw new Error('DatabaseInsertException');
    }
  }

  // 📋 Lista todos os perfis cadastrados
  async list() {
    CustomLogger.info('Buscando todos os perfis de ordenação cadastrados');

    try {
      return await prismaClient.customOrderProfile.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      CustomLogger.error('Erro ao listar perfis de ordenação do banco', error);
      throw new Error('DatabaseFetchException');
    }
  }

  // ✏️ Renomeia um perfil existente (Clique e Segure)
  async rename(id: string, newName: string) {
    CustomLogger.info(`Solicitação de renomeação para o perfil ID: ${id}`);

    try {
      return await prismaClient.customOrderProfile.update({
        where: { id },
        data: { name: newName }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        CustomLogger.warn(`Falha ao renomear: Perfil ID ${id} não encontrado`);
        throw new Error('OrderProfileNotFoundException');
      }
      CustomLogger.error(`Falha crítica ao renomear perfil ${id}`, error);
      throw error;
    }
  }

  // ❌ Exclui um perfil (Arrastar para a esquerda)
  async delete(id: string) {
    CustomLogger.info(`Solicitação de exclusão física para o perfil ID: ${id}`);

    try {
      return await prismaClient.customOrderProfile.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        CustomLogger.warn(`Falha ao deletar: Perfil ID ${id} já foi removido ou não existe`);
        throw new Error('OrderProfileNotFoundException');
      }
      CustomLogger.error(`Falha crítica ao deletar perfil ${id}`, error);
      throw error;
    }
  }
}
