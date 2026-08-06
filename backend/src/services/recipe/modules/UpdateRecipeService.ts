import prismaClient from '../../../config/prisma.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface IngredientInput {
    ingredientId: string;
    quantityNeeded: number;
}

interface UpdateRecipeRequest {
    id: string;
    unitsPerBatch: number;
    ingredients: IngredientInput[];
}

export class UpdateRecipeService {
    async execute({ id, unitsPerBatch, ingredients }: UpdateRecipeRequest) {
        CustomLogger.info(`Iniciando gravação física de Edição na Receita ID: ${id}`);

        const safeUnits = Math.max(1, Number(unitsPerBatch));

        try {
            // ✨ Toda a esteira de leitura e mutação isolada de forma atômica
            return await prismaClient.$transaction(async (tx) => {

                // 1. ✨ Busca e valida a receita dentro da transação (Segurança contra Race Conditions)
                const recipe = await tx.recipe.findUnique({
                    where: { id },
                    select: { productId: true } // Buscamos apenas o productId para otimizar I/O
                });
                if (!recipe) throw new Error('RecipeNotFoundException');

                // 2. Atualiza a quantidade de porções do lote na tabela principal de receitas
                await tx.recipe.update({
                    where: { id },
                    data: { unitsPerBatch: safeUnits }
                });

                // 3. Remove as associações antigas de insumos desta receita
                await tx.recipeItem.deleteMany({ where: { recipeId: id } });

                let calculatedRecipeCostPerUnit = 0;

                // 4. Se houver novos insumos, processa e calcula os novos custos agregados
                if (ingredients && ingredients.length > 0) {
                    const dbIngredients = await tx.ingredient.findMany({
                        where: { id: { in: ingredients.map(i => i.ingredientId) } }
                    });

                    // Mapeamento funcional limpo para inserção em bloco
                    const recipeItemsData = ingredients.map(item => ({
                        recipeId: id,
                        ingredientId: item.ingredientId,
                        quantityNeeded: item.quantityNeeded
                    }));

                    // ✨ Acumulador matemático puro usando reduce (Sem efeitos colaterais)
                    const totalIngredientsCost = ingredients.reduce((sum, item) => {
                        const ingBase = dbIngredients.find(db => db.id === item.ingredientId);
                        const basePrice = ingBase ? ingBase.price : 0;
                        const baseVolume = ingBase ? ingBase.quantity : 1;
                        return sum + ((basePrice / baseVolume) * item.quantityNeeded);
                    }, 0);

                    calculatedRecipeCostPerUnit = totalIngredientsCost / safeUnits;

                    // Insere a nova composição em lote
                    await tx.recipeItem.createMany({ data: recipeItemsData });
                }

                CustomLogger.info(`Sincronizando custo recalculado de R$ ${calculatedRecipeCostPerUnit} no produto associado`);

                // 5. Sincroniza o custo final fracionado na tabela principal de produtos
                await tx.product.update({
                    where: { id: recipe.productId },
                    data: { recipeCostPerUnit: calculatedRecipeCostPerUnit }
                });

                CustomLogger.info('Executando recálculo síncrono através do motor PricingEngine');

                // 🚀 Dispara a atualização global de lucros e margens do simulador
                await PricingEngine.recalculateAll();

                CustomLogger.info(`Edição da receita ${id} finalizada com sucesso absoluto`);
                return { id, productId: recipe.productId };
            });
        } catch (error) {
            CustomLogger.error(`Falha crítica ao atualizar a receita ID ${id}`, error);
            throw error;
        }
    }
}
