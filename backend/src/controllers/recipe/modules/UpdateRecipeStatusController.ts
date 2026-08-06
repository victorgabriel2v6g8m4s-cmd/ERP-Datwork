import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o banco de dados e enums do Schema
import prismaClient from '../../../config/prisma.js';
import { ProductStatus, Prisma } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class UpdateRecipeStatusController {
    async handle(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { status } = req.body;

        CustomLogger.info(`Recebendo requisição HTTP para alteração rápida de status da receita ${id} para ${status}`);

        // 🛡️ Validação defensiva rígida contra arrays e nulos para o TSConfig corporativo
        if (!id || typeof id !== 'string' || status !== ProductStatus.ACTIVE && status !== ProductStatus.INACTIVE) {
            CustomLogger.warn(`Requisição de status rejeitada na camada HTTP: ID inválido ou status incorreto: ${status}`);
            return res.status(400).json({ error: 'Parâmetros inválidos. O ID deve ser um texto e o status ACTIVE ou INACTIVE.' });
        }

        try {
            // 💾 Atualiza o status de forma direta na tabela de receitas
            const updated = await prismaClient.recipe.update({
                where: { id },
                data: {
                    status: status as ProductStatus // ✨ Uso do Enum estrito do Schema
                }
            });

            return res.status(200).json(updated);
        } catch (error: any) {
            // ✨ Captura erro conhecido do Prisma para registro não encontrado (P2025)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                CustomLogger.warn(`Alteração de status abortada na camada HTTP: Receita ID ${id} não existe`);
                return res.status(404).json({ error: 'A receita solicitada não foi encontrada no sistema.' });
            }

            CustomLogger.error(`Erro crítico não tratado ao alterar status da receita ${id}`, error);
            return res.status(500).json({ error: 'Erro ao mutar status da receita.' });
        }
    }
}
