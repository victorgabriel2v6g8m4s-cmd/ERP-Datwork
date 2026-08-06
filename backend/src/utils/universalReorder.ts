import prismaClient from '../config/prisma.js';
import { CustomLogger } from '../logger/CustomLogger.js';

interface ReorderInput {
    id: string;
    position: number;
}

export async function executeUniversalReorder(
    modelName: 'product' | 'recipe' | 'appointment' | 'ingredient',
    positions: ReorderInput[]
): Promise<void> {
    if (!positions || positions.length === 0) {
        CustomLogger.warn(`[Reorder Universal] Tentativa de reordenação com payload vazio para o modelo: ${modelName}`);
        return;
    }

    CustomLogger.info(`[Reorder Universal] Iniciando otimização de ordenação para ${positions.length} itens no modelo: ${modelName}`);

    // Acessa o modelo do Prisma dinamicamente através do nome da tabela
    const model = (prismaClient as any)[modelName];

    try {
        // 1. ✨ Única query de leitura: Busca o estado atual das posições envolvidas no banco
        const currentItems = await model.findMany({
            where: { id: { in: positions.map(p => p.id) } },
            select: { id: true, position: true }
        });

        // Mapeia para busca rápida O(1) em memória RAM
        const currentPositionsMap = new Map<string, number>(
            currentItems.map((item: any) => [item.id, item.position])
        );

        // 2. ✨ Filtro Inteligente: Separa apenas o que REALMENTE mudou de posição física
        const optimizedUpdates = positions
            .filter((item) => {
                const currentPos = currentPositionsMap.get(item.id);
                return currentPos !== undefined && currentPos !== item.position;
            })
            .map((item) =>
                model.update({
                    where: { id: item.id },
                    data: { position: item.position }
                })
            );

        // Se o usuário soltou o card no mesmo lugar ou o layout não mudou de fato, encerra sem onerar o banco
        if (optimizedUpdates.length === 0) {
            CustomLogger.info(`[Reorder Universal] Nenhuma alteração real detectada para ${modelName}. Operação abortada.`);
            return;
        }

        CustomLogger.info(`[Reorder Universal] Enviando transação atômica. Reduzido de ${positions.length} para ${optimizedUpdates.length} escritas.`);

        // 3. ✨ Executa em bloco paralelo as escritas necessárias
        await prismaClient.$transaction(optimizedUpdates);

        CustomLogger.info(`[Reorder Universal] Ordenação em lote para ${modelName} finalizada com sucesso absoluto.`);
    } catch (error) {
        CustomLogger.error(`[Reorder Universal] Falha catastrófica ao reordenar o modelo ${modelName}`, error);
        throw error;
    }
}
