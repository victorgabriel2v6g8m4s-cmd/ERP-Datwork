import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com o gerenciador de serviços centralizado do domínio da agenda
import { appointmentService } from '../../../services/appointment/AppointmentServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class CascadeRescheduleController {
    async handle(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para reagendamento em cascata temporal');

        // ✨ Extrai o payload completo enviado pelo Axios do frontend do ERP
        const { appointmentIds, offsetValue, unit, newPosition, targetId, actionType } = req.body;

        // Validações defensivas essenciais na camada de entrada HTTP
        if (!targetId || !appointmentIds || !Array.isArray(appointmentIds) || appointmentIds.length === 0) {
            CustomLogger.warn('Reagendamento em cascata rejeitado: IDs afetados ou ID alvo ausentes');
            return res.status(400).json({ error: 'O id do item alvo e uma lista de ids afetados são obrigatórios.' });
        }

        if (offsetValue === undefined || isNaN(Number(offsetValue)) || Number(offsetValue) <= 0) {
            CustomLogger.warn(`Tentativa de cascata com valor de deslocamento inválido: ${offsetValue}`);
            return res.status(400).json({ error: 'O valor de deslocamento (offsetValue) deve ser um número maior que zero.' });
        }

        if (!unit || !['MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS'].includes(unit)) {
            CustomLogger.warn(`Unidade de tempo inválida rejeitada na API: ${unit}`);
            return res.status(400).json({ error: 'Unidade de tempo inválida. Escolha entre MINUTES, HOURS, DAYS, WEEKS ou MONTHS.' });
        }

        if (!actionType || !['POSTERIOR', 'ANTERIOR'].includes(actionType)) {
            CustomLogger.warn(`Direção da cascata temporal inválida: ${actionType}`);
            return res.status(400).json({ error: 'A direção (actionType) deve ser ANTERIOR (adiantar) ou POSTERIOR (adiar).' });
        }

        try {
            // ✨ Otimização: Consome diretamente do Singleton centralizado, sem overhead de "new"
            await appointmentService.cascadeReschedule.execute({
                appointmentIds,
                offsetValue: Number(offsetValue),
                unit,
                newPosition: Number(newPosition),
                targetId,
                actionType
            });

            return res.status(200).json({ message: 'SUCCESS' });
        } catch (error: any) {
            CustomLogger.error('Erro crítico não tratado ao processar cascata temporal de agendamentos', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
