import { type Request, type Response } from 'express';
// 🌟 Acoplamento com a instância centralizadora e enums do Prisma
import { productService } from '../../../services/product/ProductServiceHandler.js';
import { ProductStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateProductStatusController {
    async handle(req: Request, res: Response): Promise<Response> {
        // ✨ Forçamos a desestruturação explícita do parâmetro
        const { id } = req.params;
        const { status } = req.body;

        CustomLogger.info(`Recebendo requisição HTTP para alteração rápida de status do produto ${id} para ${status}`);

        // 🛡️ Validação defensiva rígida: garante que o ID é uma string de fato e barra 'string[]'
        if (!id || typeof id !== 'string' || status !== ProductStatus.ACTIVE && status !== ProductStatus.INACTIVE) {
            CustomLogger.warn(`Requisição rejeitada na camada HTTP: ID inválido ou status incorreto: ${status}`);
            return res.status(400).json({ error: 'Parâmetros inválidos. O ID deve ser um texto e o status ACTIVE ou INACTIVE.' });
        }

        try {
            // ✨ CORREÇÃO: Usando '.updateStatus' e com o ID garantido como string pura pelo check acima
            const product = await productService.updateStatus.execute(id, status as ProductStatus);

            return res.status(200).json(product);
        } catch (error: any) {
            if (error.message === 'ProductNotFoundException') {
                CustomLogger.warn(`Alteração de status abortada na camada HTTP: Produto ID ${id} não existe`);
                return res.status(404).json({ error: 'O produto solicitado não foi encontrado no sistema.' });
            }

            CustomLogger.error(`Erro crítico não tratado ao alterar status do produto ${id}`, error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
