import prismaClient from '../../../config/prisma.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { type Expense, ProductStatus, ValueType, ExpenseCategory } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';
import { createSnapshot } from '../../../utils/snapshotAuditor.js';

interface ExpenseInput {
    id?: string;
    name: string;
    value: number;
    valueType: ValueType;
    category: ExpenseCategory;
}

export class SaveExpensesService {
    async execute(expenses: ExpenseInput[]): Promise<Expense[]> {
        CustomLogger.info(`Iniciando consolidação de lote financeiro com ${expenses.length} despesas`);

        try {
            return await prismaClient.$transaction(async (tx) => {
                let idx = 0;

                // Separamos o payload para otimizar as operações em lote no banco
                const updates = expenses
                    .filter(item => item.id)
                    .map(item =>
                        tx.expense.update({
                            where: { id: item.id! },
                            data: {
                                name: item.name.trim(),
                                value: Number(item.value),
                                valueType: item.valueType,
                                position: idx++
                            }
                        })
                    );

                const newExpensesData = expenses
                    .filter(item => !item.id)
                    .map(item => ({
                        name: item.name.trim(),
                        value: Number(item.value),
                        valueType: item.valueType,
                        category: item.category,
                        position: idx++,
                        status: ProductStatus.ACTIVE
                    }));

                // Processa todos os updates em paralelo
                if (updates.length > 0) await Promise.all(updates);

                // Cria os novos itens em uma única query em bloco
                if (newExpensesData.length > 0) {
                    await tx.expense.createMany({ data: newExpensesData });
                }

                // 2. Consolida o Snapshot histórico de auditoria por data
                const allActiveExpenses = await tx.expense.findMany({
                    where: { status: ProductStatus.ACTIVE },
                    orderBy: { position: 'asc' }
                });

                // ✨ Reaproveita o assistente de auditoria de forma limpa.
                // Como o modelo ExpenseVersion não usa FK direta de ID de despesa, passamos 'id' e null.
                await createSnapshot('expenseVersion', 'id', null, allActiveExpenses);

                CustomLogger.info('Despesas salvas com sucesso. Acionando motor de precificação em lote...');

                // 🧮 3. MOTOR OPERACIONAL: RE-PRECIFICAÇÃO EM CADEIA DE PRODUTOS
                await PricingEngine.recalculateAll();

                return allActiveExpenses;
            });
        } catch (error) {
            CustomLogger.error('Falha catastrófica ao persistir lote de despesas operacionais', error);
            throw error;
        }
    }
}
