import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços e enums do Prisma
import { ingredientService } from '../../../services/ingredient/IngredientServiceHandler.js';
import { ProductStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateIngredientStatusController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { status } = req.body;

        CustomLogger.info(`Recebendo requisição HTTP para alteração rápida de status do insumo ${id} para ${status}`);

        // 🛡️ Validação defensiva rígida: garante que o ID é uma string e blinda contra 'string[]'
        if (!id || typeof id !== 'string' || status !== ProductStatus.ACTIVE && status !== ProductStatus.INACTIVE) {
            CustomLogger.warn(`Requisição rejeitada na camada HTTP: ID inválido ou status incorreto: ${status}`);
            return res.status(400).json({ error: 'Parâmetros inválidos. O ID deve ser um texto e o status ACTIVE ou INACTIVE.' });
        }

        try {
            // ✨ Otimização: Consome diretamente a instância unificada (rebatizada para updateStatus)
            const ingredient = await ingredientService.updateStatus.execute(id, status as ProductStatus);

            return res.status(200).json(ingredient);
        } catch (error: any) {
            if (error.message === 'IngredientNotFoundException') {
                CustomLogger.warn(`Alteração de status abortada na camada HTTP: Insumo ID ${id} não existe`);
                return res.status(404).json({ error: 'O insumo solicitado não foi encontrado no sistema.' });
            }

            CustomLogger.error(`Erro crítico não tratado ao alterar status do insumo ${id}`, error);
            return res.status(500).json({ error: 'Erro interno do servidor ao mutar status do insumo.' });
        }
    }
}
