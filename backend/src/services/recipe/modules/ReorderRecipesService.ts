import { executeUniversalReorder } from '../../../utils/universalReorder.js';

interface PositionInput {
    id: string;
    position: number;
}

export class ReorderRecipesService {
    async execute(positions: PositionInput[]): Promise<void> {
        // ✨ Invoca o assistente universal reaproveitando 100% da inteligência de lote para o modelo 'recipe'
        await executeUniversalReorder('recipe', positions);
    }
}
