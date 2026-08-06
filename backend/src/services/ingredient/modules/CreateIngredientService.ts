import prismaClient from '../../../config/prisma.js';
import { type Ingredient, ProductStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { createSnapshot } from '../../../utils/snapshotAuditor.js';

interface CreateIngredientRequest {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unit: 'Unidades' | 'Gramas' | 'Quilos' | 'MLs' | 'Centímetros' | 'Metros' | string;
  thumbnail?: string | null;
}

export class CreateIngredientService {
  async execute(data: CreateIngredientRequest): Promise<Ingredient> {
    const cleanSku = data.sku.trim().toUpperCase();
    CustomLogger.info(`Iniciando cadastro de novo insumo SKU: ${cleanSku}`);

    try {
      // ✨ Transação isolada para manter atomicidade: ou cria tudo perfeito ou faz rollback
      return await prismaClient.$transaction(async (tx) => {

        // 1. Encontra a última posição na fila para o reordenamento tátil equilibrado
        const lastIngredient = await tx.ingredient.findFirst({
          orderBy: { position: 'desc' },
          select: { position: true } // Otimização de I/O
        });

        const nextPosition = lastIngredient ? lastIngredient.position + 1 : 0;

        // 💾 2. Insere o insumo na tabela principal usando o Enum estrito
        const ingredient = await tx.ingredient.create({
          data: {
            sku: cleanSku,
            name: data.name.trim(),
            price: Number(data.price),
            quantity: Number(data.quantity),
            unit: data.unit,
            thumbnail: data.thumbnail ?? null,
            position: nextPosition,
            status: ProductStatus.ACTIVE // ✨ Enum estrito do Schema
          }
        });

        // 📜 3. ✨ Reaproveita o assistente de auditoria de snapshots para a versão V1
        await createSnapshot('ingredientVersion', 'ingredientId', ingredient.id, ingredient);

        return ingredient;
      });

    } catch (error) {
      CustomLogger.error(`Falha crítica ao registrar insumo SKU ${cleanSku}`, error);
      throw error;
    }
  }
}
