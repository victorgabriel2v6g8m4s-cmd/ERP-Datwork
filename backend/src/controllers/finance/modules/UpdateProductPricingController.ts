import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços do módulo financeiro e enums
import { financeService } from '../../../services/finance/FinanceServiceHandler.js';
import { CostInclusion } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateProductPricingController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { finalPrice, includeFixedCosts } = req.body;

        CustomLogger.info(`Recebendo requisição HTTP para alteração rápida de precificação do produto ID: ${id}`);

        // Validação estrita na camada HTTP para Narrowing do TypeScript
        if (!id || typeof id !== 'string') {
            CustomLogger.warn('Requisição de precificação rejeitada: parâmetro ID inválido ou ausente');
            return res.status(400).json({ error: 'O parâmetro ID do produto é obrigatório e deve ser um texto válido.' });
        }

        try {
            // 🛠️ Monta o payload dinamicamente para respeitar a regra rígida exactOptionalPropertyTypes: true
            const payload: any = { id };

            if (includeFixedCosts !== undefined) {
                payload.includeFixedCosts = includeFixedCosts as CostInclusion;
            }

            if (finalPrice !== undefined) {
                payload.finalPrice = Number(finalPrice);
            }

            // ✨ Otimização: Consome diretamente a instância unificada, sem o "new" manual
            const updated = await financeService.updatePricing.execute(payload);

            return res.status(200).json(updated);
        } catch (error: any) {
            if (error.message === 'ProductNotFoundException') {
                CustomLogger.warn(`Atualização de preços abortada na camada HTTP: Produto ID ${id} não existe`);
                return res.status(404).json({ error: 'O produto solicitado não foi encontrado no sistema.' });
            }

            CustomLogger.error(`Erro crítico não tratado ao atualizar precificação do produto ${id}`, error);
            return res.status(500).json({ error: 'Erro interno do servidor ao salvar os novos parâmetros de preço.' });
        }
    }
}
