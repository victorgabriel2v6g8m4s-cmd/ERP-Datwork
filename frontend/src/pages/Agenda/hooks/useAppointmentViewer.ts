import { useMemo } from 'react';
import { type Appointment, type FinancialItem, type MediaItem } from '../../../types/appointment.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

interface UseAppointmentViewerProps {
    isOpen: boolean;
    appointment: Appointment | null;
}

export function useAppointmentViewer({ isOpen, appointment }: UseAppointmentViewerProps) {
    return useMemo(() => {
        if (!appointment || !isOpen) {
            return { description: '', medias: [], financials: [], formattedDate: '' };
        }

        CustomLogger.info(`[Viewer] Hidratando dados de resumo para o agendamento ID: ${appointment.id}`);

        const description = appointment.description || '';

        // Proteção defensiva: se for string faz o parse, se já for objeto/array consome direto
        const medias: MediaItem[] = typeof appointment.medias === 'string'
            ? (() => { try { return JSON.parse(appointment.medias); } catch { return []; } })()
            : (Array.isArray(appointment.medias) ? appointment.medias : []);

        const financials: FinancialItem[] = typeof appointment.financials === 'string'
            ? (() => { try { return JSON.parse(appointment.financials); } catch { return []; } })()
            : (Array.isArray(appointment.financials) ? appointment.financials : []);

        const formattedDate = new Date(appointment.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        return { description, medias, financials, formattedDate };
    }, [appointment, isOpen]);
}
