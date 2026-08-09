import { type Request, type Response } from 'express';
// 🌟 Acoplamento com a instância centralizadora e enums do Prisma
import prismaClient from '../../../config/prisma.js';
import { ProductStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListIngredientsController {
  async handle(req: Request, res: Response): Promise<Response> {
    CustomLogger.info('Recebendo requisição HTTP para listar catálogo de insumos ativos');

    try {
      // ✨ Otimização: Filtra apenas os insumos ativos para o grid, ordenando pelo Drag-and-Drop
      const ingredients = await prismaClient.ingredient.findMany({
        orderBy: {
          position: 'asc'
        },
        include: {
          versions: {
            select: {
              id: true,
              versionDate: true
            }
          }
        }
      });

      return res.status(200).json(ingredients);
    } catch (error) {
      CustomLogger.error('Erro crítico ao listar insumos na camada HTTP', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
