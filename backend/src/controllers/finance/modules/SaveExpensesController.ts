import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços do módulo de finanças
import { financeService } from '../../../services/finance/FinanceServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class SaveExpensesController {
    async handle(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para consolidação e salvamento de planilha financeira em lote');

        const { expenses } = req.body;

        // Validação defensiva precoce na camada HTTP antes de abrir conexão com o banco
        if (!expenses || !Array.isArray(expenses)) {
            CustomLogger.warn('Tentativa de persistência financeira rejeitada: payload em lote ausente ou malformatado');
            return res.status(400).json({ error: 'O payload de despesas em lote é obrigatório e deve ser um array estruturado.' });
        }

        try {
            // ✨ Otimização: Consome diretamente a instância unificada, sem o "new" manual
            const updatedExpensesList = await financeService.saveExpenses.execute(expenses);

            return res.status(200).json(updatedExpensesList);
        } catch (error) {
            CustomLogger.error('Erro crítico não tratado ao persistir lote de despesas operacionais na camada HTTP', error);
            return res.status(500).json({ error: 'Internal Server Error ao salvar as alterações financeiras.' });
        }
    }
}
