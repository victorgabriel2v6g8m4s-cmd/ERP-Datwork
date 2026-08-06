import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o banco de dados respeitando os índices e as boas práticas de I/O
import prismaClient from '../../../config/prisma.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListExpenseVersionsController {
    async handle(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para carregar o histórico de versões da planilha de despesas');

        try {
            // ✨ Otimização de performance: O campo snapshotData agora entrega o objeto JSON nativo diretamente
            const versions = await prismaClient.expenseVersion.findMany({
                orderBy: {
                    versionDate: 'desc'
                },
                take: 30 // Mantém a trava de segurança de paginação para não sobrecarregar a memória
            });

            return res.status(200).json(versions);
        } catch (error) {
            CustomLogger.error('Erro crítico ao buscar histórico de versões financeiras na camada HTTP', error);
            return res.status(500).json({ error: 'Erro interno do servidor ao buscar histórico de auditoria.' });
        }
    }
}
