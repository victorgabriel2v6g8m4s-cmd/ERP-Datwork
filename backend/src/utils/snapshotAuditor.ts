import prismaClient from '../config/prisma.js';
import { CustomLogger } from '../logger/CustomLogger.js';

export async function createSnapshot(
    versionModelName: 'productVersion' | 'ingredientVersion' | 'expenseVersion',
    foreignKeyName: 'productId' | 'ingredientId' | 'id', // 'id' para despesas que usam chave fictícia ou nula
    foreignKeyValue: string | null,
    snapshotData: any
): Promise<void> {
    CustomLogger.info(`[Snapshot Auditor] Gerando trilha de auditoria para o modelo: ${versionModelName}`);

    const model = (prismaClient as any)[versionModelName];

    try {
        // Monta o objeto de dados de forma dinâmica
        const insertData: any = {
            snapshotData: snapshotData as any,
            versionDate: snapshotData.updatedAt || snapshotData.versionDate || new Date()
        };

        // Só injeta a chave estrangeira se ela não for nula (casos como ExpenseVersion)
        if (foreignKeyName !== 'id' && foreignKeyValue) {
            insertData[foreignKeyName] = foreignKeyValue;
        }

        await model.create({ data: insertData });

        CustomLogger.info(`[Snapshot Auditor] Instantâneo histórico salvo com sucesso em ${versionModelName}.`);
    } catch (error: any) {
        // 🛡️ Falhas de auditoria não devem travar a experiência do usuário final do ERP
        CustomLogger.error(`[Snapshot Auditor] Falha não-crítica ao congelar snapshot em ${versionModelName}: ${error.message}`);
    }
}
