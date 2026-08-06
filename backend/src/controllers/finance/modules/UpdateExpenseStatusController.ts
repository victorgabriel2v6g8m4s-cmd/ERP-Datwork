import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o banco de dados, motor de cálculo e enums do Schema
import prismaClient from '../../../config/prisma.js';
import { PricingEngine } from '../../../math/PricingEngine.js';
import { ProductStatus, Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateExpenseStatusController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { status } = req.body;

        CustomLogger.info(`Recebendo requisição HTTP para alteração de status da despesa ${id} para ${status}`);

        // 🛡️ Validação defensiva rígida: garante que o ID é string e blinda contra 'string[]'
        if (!id || typeof id !== 'string' || status !== ProductStatus.ACTIVE && status !== ProductStatus.INACTIVE) {
            CustomLogger.warn(`Requisição rejeitada na camada HTTP: ID inválido ou status incorreto: ${status}`);
            return res.status(400).json({ error: 'Parâmetros inválidos. O ID deve ser um texto e o status ACTIVE ou INACTIVE.' });
        }

        try {
            // 💾 1. Atualiza o status de forma direta na tabela de despesas operacionais do SQLite
            const updated = await prismaClient.expense.update({
                where: { id },
                data: {
                    status: status as ProductStatus // ✨ Uso do Enum estrito do Schema
                }
            });

            CustomLogger.info(`Despesa ${id} alterada para ${status}. Disparando motor de recálculo PricingEngine.`);

            // 🧮 2. GATILHO EM CADEIA: Como a despesa mudou/sumiu, o custo de rateio e markup de todos os produtos mudou na hora!
            await PricingEngine.recalculateAll();

            return res.status(200).json(updated);
        } catch (error: any) {
            // ✨ Interceptação explícita de erro conhecido do Prisma para registro não encontrado (P2025)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                CustomLogger.warn(`Alteração de status abortada na camada HTTP: Despesa ID ${id} não existe`);
                return res.status(404).json({ error: 'A despesa solicitada não foi encontrada no sistema.' });
            }

            CustomLogger.error(`Erro crítico não tratado ao desativar despesa ID ${id}`, error);
            return res.status(500).json({ error: 'Internal Server Error ao mutar status da despesa.' });
        }
    }
}
