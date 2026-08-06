import { type Request, type Response } from 'express';
import { PricingEngine } from '../../../math/PricingEngine.js';
import prismaClient from '../../../config/prisma.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class PricingSettingsController {
    // 📋 GET: Recupera as constantes globais de precificação
    async get(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para buscar configurações globais de precificação');

        try {
            let settings = await prismaClient.pricingSetting.findUnique({ where: { id: 'GLOBAL_CONFIG' } });

            // ✨ Otimização: Singleton defensivo limpo
            if (!settings) {
                CustomLogger.warn('Configurações globais não localizadas. Inicializando Singleton padrão...');
                settings = await prismaClient.pricingSetting.create({ data: { id: 'GLOBAL_CONFIG' } });
            }

            return res.status(200).json(settings);
        } catch (error) {
            CustomLogger.error('Erro crítico ao buscar ajustes globais de precificação na camada HTTP', error);
            return res.status(500).json({ error: 'Erro interno ao buscar ajustes de precificação.' });
        }
    }

    // 💾 PUT: Salva as atualizações das margens alvo e do teto de produção
    async update(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para atualizar configurações globais do simulador');

        const { maxProductionCap, marginCategoryA, marginCategoryB, marginCategoryC, enableAutoABC } = req.body;

        try {
            // 🛠️ Monta o objeto dinamicamente para respeitar a regra rígida exactOptionalPropertyTypes: true
            const updateData: any = {};
            const createData: any = { id: 'GLOBAL_CONFIG' };

            if (maxProductionCap !== undefined) {
                const val = Number(maxProductionCap);
                updateData.maxProductionCap = val;
                createData.maxProductionCap = val;
            }
            if (marginCategoryA !== undefined) {
                const val = Number(marginCategoryA);
                updateData.marginCategoryA = val;
                createData.marginCategoryA = val;
            }
            if (marginCategoryB !== undefined) {
                const val = Number(marginCategoryB);
                updateData.marginCategoryB = val;
                createData.marginCategoryB = val;
            }
            if (marginCategoryC !== undefined) {
                const val = Number(marginCategoryC);
                updateData.marginCategoryC = val;
                createData.marginCategoryC = val;
            }

            // ✨ FEATURE ATIVADA: Mapeamento da flag opcional da Curva ABC automática que criamos no motor
            if (enableAutoABC !== undefined) {
                const val = Boolean(enableAutoABC);
                updateData.enableAutoABC = val;
                createData.enableAutoABC = val;
            }

            const settings = await prismaClient.pricingSetting.upsert({
                where: { id: 'GLOBAL_CONFIG' },
                create: createData,
                update: updateData
            });

            CustomLogger.info('Configurações globais salvas com sucesso. Acionando motor de recálculo PricingEngine.');

            // 🧮 GATILHO EM CADEIA: Recalcula na hora todo o mix comercial com os novos parâmetros
            await PricingEngine.recalculateAll();

            return res.status(200).json(settings);
        } catch (error) {
            CustomLogger.error('Erro crítico ao salvar novas configurações do simulador na camada HTTP', error);
            return res.status(500).json({ error: 'Erro interno ao salvar ajustes de precificação.' });
        }
    }
}
