import prismaClient from '../../../config/prisma.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListRecipesService {
  async execute() {
    CustomLogger.info('[Recipes] Loading complete recipe catalog including inactive records');

    return prismaClient.recipe.findMany({
      orderBy: { position: 'asc' },
      include: {
        product: {
          select: {
            sku: true,
            name: true,
            thumbnail: true,
            abcCategory: true,
            recipeCostPerUnit: true,
            indirectCost: true,
            totalUnitCost: true
          }
        },
        items: {
          include: {
            ingredient: {
              select: {
                name: true,
                price: true,
                quantity: true,
                unit: true
              }
            }
          }
        }
      }
    });
  }
}
