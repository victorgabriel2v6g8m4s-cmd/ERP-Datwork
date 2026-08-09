import { type Request, type Response } from 'express';
import prismaClient from '../../../config/prisma.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { ProductStatus, ExpenseCategory, ValueType } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { presentProduct } from '../../../presenters/product/ProductPresenter.js';

export class ListPricingProductsController {
    async handle(_req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para carregar o Simulador de Preços (Filtro por Ficha Técnica)');

        try {
            await PricingEngine.recalculateAll();

            let settings = await prismaClient.pricingSetting.findUnique({ where: { id: 'GLOBAL_CONFIG' } });
            if (!settings) {
                settings = await prismaClient.pricingSetting.create({ data: { id: 'GLOBAL_CONFIG' } });
            }

            const fixedExpenses = await prismaClient.expense.findMany({
                where: { category: ExpenseCategory.FIXED, status: ProductStatus.ACTIVE }
            });
            const totalFixedCost = fixedExpenses.reduce((acc, expense) => acc + expense.value, 0);
            const fixedCostPerUnitFactor = totalFixedCost / (settings.maxProductionCap || 1);

            const variableExpenses = await prismaClient.expense.findMany({
                where: { category: ExpenseCategory.VARIABLE, valueType: ValueType.PERCENT, status: ProductStatus.ACTIVE }
            });
            const totalVariablePercent = variableExpenses.reduce((acc, expense) => acc + expense.value, 0);

            const products = await prismaClient.product.findMany({
                where: {
                    recipe: { isNot: null },
                    status: ProductStatus.ACTIVE
                },
                orderBy: { name: 'asc' },
                include: {
                    recipe: {
                        select: { unitsPerBatch: true }
                    }
                }
            });

            const responseProducts = products.map(presentProduct);
            CustomLogger.info(`Simulador de preços carregado com sucesso. Itens filtrados com receita: ${responseProducts.length}`);

            return res.status(200).json({
                fixedCostPerUnitFactor,
                totalVariablePercent,
                products: responseProducts
            });
        } catch (error) {
            CustomLogger.error('Erro crítico ao consolidar cabeçalho financeiro do simulador na camada HTTP', error);
            return res.status(500).json({ error: 'Erro ao consolidar cabeçalho financeiro.' });
        }
    }
}
