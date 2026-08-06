import prismaClient from '../config/prisma.js';
import { AbcCategory, CostInclusion } from '@prisma/client';
import { CustomLogger } from '../logger/CustomLogger.js';

export class PricingEngine {
    static async recalculateAll(): Promise<void> {
        CustomLogger.info('[PricingEngine] Iniciando recálculo global de preços em lote...');

        try {
            // 1. Busca configurações globais (Singleton)
            let settings = await prismaClient.pricingSetting.findUnique({ where: { id: 'GLOBAL_CONFIG' } });
            if (!settings) {
                CustomLogger.warn('[PricingEngine] Configurações globais não encontradas. Criando Singleton...');
                settings = await prismaClient.pricingSetting.create({ data: { id: 'GLOBAL_CONFIG' } });
            }

            // 🔄 BYPASS/FLAG OPCIONAL: Altere para ler do banco (settings.enableAutoABC) quando aplicar a migration
            const isAutoABCEnabled = (settings as any).enableAutoABC ?? false;

            // 2. Calcula custos fixos agregados
            const fixedExpenses = await prismaClient.expense.findMany({ where: { category: 'FIXED', status: 'ACTIVE' } });
            const totalFixedCost = fixedExpenses.reduce((acc, e) => acc + e.value, 0);
            const fixedCostPerUnitFactor = totalFixedCost / (settings.maxProductionCap || 1);

            // 3. Calcula multiplicador de despesas variáveis
            const variableExpenses = await prismaClient.expense.findMany({ where: { category: 'VARIABLE', valueType: 'PERCENT', status: 'ACTIVE' } });
            const totalVariablePercentSum = variableExpenses.reduce((acc, e) => acc + e.value, 0);
            const variableMultiplier = Math.max(0.01, 1 - (totalVariablePercentSum / 100));

            // 4. ✨ OTIMIZAÇÃO CRÍTICA: Traz produtos e receitas em uma única query em massa
            const products = await prismaClient.product.findMany({
                where: { status: 'ACTIVE' },
                include: {
                    recipe: {
                        include: {
                            items: { include: { ingredient: true } }
                        }
                    }
                }
            });

            if (products.length === 0) {
                CustomLogger.info('[PricingEngine] Nenhum produto ativo encontrado para recálculo.');
                return;
            }

            // ==========================================
            // ✨ FEATURE ATIVADA: CLASSIFICAÇÃO ABC OPCIONAL (PARETO)
            // ==========================================
            if (isAutoABCEnabled) {
                CustomLogger.info('[PricingEngine] Inteligência de Curva ABC Automática ATIVA. Classificando produtos...');

                // Pré-calcula o custo total de base de produção temporariamente em memória para ordenar
                const productValueMap = products.map(prod => {
                    let recipeCost = 0;
                    if (prod.recipe && prod.recipe.items.length > 0) {
                        const totalIngredients = prod.recipe.items.reduce((sum, item) => {
                            const price = item.ingredient?.price || 0;
                            const qty = item.ingredient?.quantity || 1;
                            return sum + ((price / qty) * item.quantityNeeded);
                        }, 0);
                        recipeCost = totalIngredients / Math.max(1, prod.recipe.unitsPerBatch);
                    }
                    return { id: prod.id, totalCostWeight: recipeCost + (prod.indirectCost || 0) };
                });

                // Ordena do maior custo/peso para o menor
                productValueMap.sort((a, b) => b.totalCostWeight - a.totalCostWeight);

                const totalItems = products.length;
                const limitA = Math.ceil(totalItems * 0.20); // Top 20%
                const limitB = Math.ceil(totalItems * 0.50); // Próximos 30% (acumulado 50%)

                // Reescreve a categoria ABC na memória dos objetos antes de calcular os preços sugeridos
                products.forEach((prod, index) => {
                    const orderIndex = productValueMap.findIndex(p => p.id === prod.id);
                    if (orderIndex < limitA) {
                        prod.abcCategory = AbcCategory.A;
                    } else if (orderIndex < limitB) {
                        prod.abcCategory = AbcCategory.B;
                    } else {
                        prod.abcCategory = AbcCategory.C;
                    }
                });
            }

            // 5. Bloco de Processamento Matemático de Margens em Lote
            const updatePromises = products.map((prod) => {
                let currentRecipeCostPerUnit = 0;

                // Processa a receita pré-carregada em memória RAM (Velocidade Relâmpago)
                if (prod.recipe && prod.recipe.items.length > 0) {
                    const totalIngredientsCost = prod.recipe.items.reduce((sum, item) => {
                        const price = item.ingredient?.price || 0;
                        const quantityMax = item.ingredient?.quantity || 1;
                        return sum + ((price / quantityMax) * item.quantityNeeded);
                    }, 0);
                    currentRecipeCostPerUnit = totalIngredientsCost / Math.max(1, prod.recipe.unitsPerBatch);
                }

                const baseProductionCost = currentRecipeCostPerUnit + (prod.indirectCost || 0);
                const computedTotalUnitCost = baseProductionCost / variableMultiplier;

                // Atribui margens dinâmicas baseadas na curva ABC (Seja vinda do banco ou calculada acima)
                let targetMarginPercent = settings!.marginCategoryC;
                if (prod.abcCategory === AbcCategory.A) targetMarginPercent = settings!.marginCategoryA;
                if (prod.abcCategory === AbcCategory.B) targetMarginPercent = settings!.marginCategoryB;

                const applyFixed = prod.includeFixedCosts === CostInclusion.YES || prod.includeFixedCosts === CostInclusion.DEFAULT;
                const fixedCostShare = applyFixed ? fixedCostPerUnitFactor : 0;

                const marginMultiplier = 1 - (targetMarginPercent / 100);
                const computedSuggestedPrice = (computedTotalUnitCost + fixedCostShare) / (marginMultiplier || 1);

                const activeSellingPrice = prod.finalPrice && prod.finalPrice > 0 ? prod.finalPrice : computedSuggestedPrice;
                const computedNetProfit = (activeSellingPrice - computedTotalUnitCost) - fixedCostShare;

                // Retorna a promessa de escrita isolada
                return prismaClient.product.update({
                    where: { id: prod.id },
                    data: {
                        abcCategory: prod.abcCategory, // Salva a categoria caso ela tenha sido mutada dinamicamente
                        recipeCostPerUnit: currentRecipeCostPerUnit,
                        totalUnitCost: computedTotalUnitCost,
                        suggestedPrice: computedSuggestedPrice,
                        predictedNetProfit: computedNetProfit
                    }
                });
            });

            // ✨ Executa todas as atualizações de precificação de forma paralela atômica
            await prismaClient.$transaction(updatePromises);

            CustomLogger.info(`[PricingEngine] Recálculo global finalizado com sucesso. ${products.length} itens sincronizados.`);
        } catch (error) {
            CustomLogger.error('[PricingEngine] Erro crítico fatal no processamento matemático em lote', error);
            throw error;
        }
    }
}
