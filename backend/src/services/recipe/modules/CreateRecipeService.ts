import prismaClient from '../../../config/prisma.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { ProductStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

interface IngredientInput {
    ingredientId: string;
    quantityNeeded: number;
}

interface CreateRecipeRequest {
    productId: string;
    unitsPerBatch: number;
    ingredients: IngredientInput[];
}

export class CreateRecipeService {
    async execute({ productId, unitsPerBatch, ingredients }: CreateRecipeRequest) {
        CustomLogger.info('Iniciando esteira de criação de receita relacionada', { productId });

        const safeUnits = Math.max(1, Number(unitsPerBatch));

        try {
            // ✨ Toda a esteira de validação e escrita unificada na transação (Isolamento total)
            return await prismaClient.$transaction(async (tx) => {

                // 1. Valida existência do produto alvo
                const product = await tx.product.findUnique({
                    where: { id: productId },
                    select: { id: true } // Otimização
                });
                if (!product) throw new Error('ProductNotFoundException');

                // 2. Valida duplicidade de receita para o mesmo produto
                const existingRecipe = await tx.recipe.findFirst({
                    where: { productId },
                    select: { id: true }
                });
                if (existingRecipe) throw new Error('RecipeAlreadyExistsForProductException');

                // 3. Determina a próxima posição linear da listagem
                const lastRecipe = await tx.recipe.findFirst({
                    orderBy: { position: 'desc' },
                    select: { position: true }
                });
                const nextPosition = lastRecipe ? lastRecipe.position + 1 : 0;

                // 💾 4. Insere a Receita com o Enum correto do novo Schema
                const recipe = await tx.recipe.create({
                    data: {
                        productId,
                        position: nextPosition,
                        unitsPerBatch: safeUnits,
                        status: ProductStatus.ACTIVE // ✨ Enum estrito do Schema
                    }
                });

                let calculatedRecipeCostPerUnit = 0;

                // 🧮 5. Processamento dos Insumos e Engenharia de Custos
                if (ingredients && ingredients.length > 0) {
                    const dbIngredients = await tx.ingredient.findMany({
                        where: { id: { in: ingredients.map(i => i.ingredientId) } }
                    });

                    // Engenharia funcional limpa: cria os itens para inserção em lote
                    const recipeItemsData = ingredients.map(item => ({
                        recipeId: recipe.id,
                        ingredientId: item.ingredientId,
                        quantityNeeded: item.quantityNeeded
                    }));

                    // Calcula o custo total acumulado sem efeitos colaterais mutáveis no map
                    const totalIngredientsCost = ingredients.reduce((sum, item) => {
                        const ingBase = dbIngredients.find(db => db.id === item.ingredientId);
                        const basePrice = ingBase ? ingBase.price : 0;
                        const baseVolume = ingBase ? ingBase.quantity : 1;
                        return sum + ((basePrice / baseVolume) * item.quantityNeeded);
                    }, 0);

                    calculatedRecipeCostPerUnit = totalIngredientsCost / safeUnits;

                    // Salva os itens em lote no banco
                    await tx.recipeItem.createMany({ data: recipeItemsData });
                }

                // ✨ 6. Sincroniza o custo de fabricação diretamente na tabela do produto
                await tx.product.update({
                    where: { id: productId },
                    data: { recipeCostPerUnit: calculatedRecipeCostPerUnit }
                });

                CustomLogger.info(`Ficha técnica sincronizada. Rodando motor PricingEngine.`);

                // 🚀 Executa o motor automático de precificação global
                await PricingEngine.recalculateAll();

                return recipe;
            });
        } catch (error) {
            CustomLogger.error('Erro fatal na transação de gravação da ficha técnica', error);
            throw error;
        }
    }
}
