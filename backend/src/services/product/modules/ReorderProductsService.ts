import { executeUniversalReorder } from '../../../utils/universalReorder.js';

interface ReorderItem {
  id: string;
  position: number;
}

export class ReorderProductsService {
  async execute(positions: ReorderItem[]): Promise<void> {
    // ✨ Invoca o assistente universal repassando o nome do modelo cadastrado no Prisma
    await executeUniversalReorder('product', positions);
  }
}
