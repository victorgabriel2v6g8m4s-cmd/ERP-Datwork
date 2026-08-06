import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o banco de dados e enums globais do Schema
import prismaClient from '../../../config/prisma.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { ProductStatus, ExpenseCategory, ValueType } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListPricingProductsController {
    async handle(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para carregar o Simulador de Preços (Filtro por Ficha Técnica)');

        try {
            // 🛡️ Garante que a esteira matemática esteja 100% sincronizada antes de entregar o payload
            await PricingEngine.recalculateAll();

            // 1. Busca os parâmetros de capacidade global (Garante Singleton)
            let settings = await prismaClient.pricingSetting.findUnique({ where: { id: 'GLOBAL_CONFIG' } });
            if (!settings) {
                settings = await prismaClient.pricingSetting.create({ data: { id: 'GLOBAL_CONFIG' } });
            }

            // 2. Calcula as despesas fixas em lote para extrair o fator de rateio por unidade
            const fixedExpenses = await prismaClient.expense.findMany({
                where: { category: ExpenseCategory.FIXED, status: ProductStatus.ACTIVE }
            });
            const totalFixedCost = fixedExpenses.reduce((acc, e) => acc + e.value, 0);
            const fixedCostPerUnitFactor = totalFixedCost / (settings.maxProductionCap || 1);

            // 3. Calcula o percentual total de despesas variáveis cadastradas
            const variableExpenses = await prismaClient.expense.findMany({
                where: { category: ExpenseCategory.VARIABLE, valueType: ValueType.PERCENT, status: ProductStatus.ACTIVE }
            });
            const totalVariablePercent = variableExpenses.reduce((acc, e) => acc + e.value, 0);

            // 4. ✨ Filtro de UX Estratégico: Carrega produtos que já possuem ficha técnica cadastrada
            const products = await prismaClient.product.findMany({
                where: {
                    recipe: { isNot: null },
                    status: ProductStatus.ACTIVE
                },
                orderBy: {
                    name: 'asc'
                }
            });

            CustomLogger.info(`Simulador de preços carregado com sucesso. Itens filtrados com receita: ${products.length}`);

            return res.status(200).json({
                fixedCostPerUnitFactor,
                totalVariablePercent,
                products
            });
        } catch (error) {
            CustomLogger.error('Erro crítico ao consolidar cabeçalho financeiro do simulador na camada HTTP', error);
            return res.status(500).json({ error: 'Erro ao consolidar cabeçalho financeiro.' });
        }
    }
}
