import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o banco de dados e enums globais do Schema
import prismaClient from '../../../config/prisma.js';
import { ProductStatus, ExpenseCategory, ValueType } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListExpensesController {
    async handle(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para carregar lote de despesas operacionais e metadados');

        try {
            // 1. Busca os parâmetros de capacidade global para o cálculo de rateio (Garante Singleton)
            let settings = await prismaClient.pricingSetting.findUnique({ where: { id: 'GLOBAL_CONFIG' } });
            if (!settings) {
                settings = await prismaClient.pricingSetting.create({ data: { id: 'GLOBAL_CONFIG' } });
            }

            // 2. Carrega todas as despesas ativas do banco usando o Enum correto
            const allExpenses = await prismaClient.expense.findMany({
                where: {
                    status: ProductStatus.ACTIVE // ✨ Uso do Enum estrito do Schema
                },
                orderBy: {
                    position: 'asc'
                }
            });

            // 3. Calcula o montante fixo acumulado para extrair o fator de rateio por unidade/lote
            const fixedExpenses = allExpenses.filter(e => e.category === ExpenseCategory.FIXED); // ✨ Enum estrito
            const totalFixedCost = fixedExpenses.reduce((acc, e) => acc + e.value, 0);
            const fixedCostPerUnitFactor = totalFixedCost / (settings.maxProductionCap || 1);

            // 4. Calcula o percentual acumulado de todas as despesas variáveis em %
            const variableExpenses = allExpenses.filter(
                e => e.category === ExpenseCategory.VARIABLE && e.valueType === ValueType.PERCENT // ✨ Enums estritos
            );
            const totalVariablePercent = variableExpenses.reduce((acc, e) => acc + e.value, 0);

            CustomLogger.info(`Centro de custos hidratado com sucesso. Fator de Rateio Fixo: R$ ${fixedCostPerUnitFactor}`);

            // 📡 RETORNO HIDRATADO: Entrega a lista de despesas e os metadados do micro-dashboard
            return res.status(200).json({
                expenses: allExpenses,
                fixedCostPerUnitFactor,
                totalVariablePercent
            });
        } catch (error) {
            CustomLogger.error('Erro crítico ao listar despesas no centro de custos na camada HTTP', error);
            return res.status(500).json({ error: 'Internal Server Error ao processar centro de custos.' });
        }
    }
}
