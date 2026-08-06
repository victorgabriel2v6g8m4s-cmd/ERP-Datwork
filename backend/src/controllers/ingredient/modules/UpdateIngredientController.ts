import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços do módulo de insumos
import { ingredientService } from '../../../services/ingredient/IngredientServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateIngredientController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { sku, name, price, quantity, unit, thumbnail, medias } = req.body;

        CustomLogger.info(`Recebendo requisição HTTP para atualização do insumo ID: ${id}`);

        // Validação estrita na camada HTTP para Narrowing do TypeScript
        if (!id || typeof id !== 'string') {
            CustomLogger.warn('Requisição de atualização rejeitada: parâmetro ID inválido ou ausente');
            return res.status(400).json({ error: 'O parâmetro ID é obrigatório e deve ser um texto válido.' });
        }

        if (!sku || !name || price === undefined || quantity === undefined || !unit) {
            CustomLogger.warn(`Tentativa de atualização do insumo ${id} sem os campos obrigatórios`);
            return res.status(400).json({ error: 'Campos SKU, Nome, Preço, Quantidade e Unidade são obrigatórios.' });
        }

        try {
            // 🛠️ Monta o payload dinamicamente para respeitar a regra rígida exactOptionalPropertyTypes: true
            const payload: any = {
                id,
                sku,
                name,
                price: Number(price),
                quantity: Number(quantity),
                unit
            };

            if (thumbnail !== undefined) payload.thumbnail = thumbnail;
            if (medias !== undefined) payload.medias = medias;

            // ✨ Otimização: Consome diretamente a instância unificada, sem o "new" manual
            const ingredient = await ingredientService.update.execute(payload);

            return res.status(200).json(ingredient);
        } catch (error: any) {
            if (error.message === 'IngredientNotFoundException') {
                CustomLogger.warn(`Atualização abortada na camada HTTP: Insumo ID ${id} não existe`);
                return res.status(404).json({ error: 'Insumo não encontrado para edição.' });
            }

            CustomLogger.error(`🔥 Erro crítico ao atualizar insumo ID ${id}:`, error);
            return res.status(500).json({ error: 'Erro interno ao processar a atualização do insumo.' });
        }
    }
}
