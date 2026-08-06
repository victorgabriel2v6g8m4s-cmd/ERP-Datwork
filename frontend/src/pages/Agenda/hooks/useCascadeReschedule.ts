import { useState, useMemo } from 'react';
import { type Appointment } from '../../../types/appointment.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

interface UseCascadeRescheduleProps {
    isOpen: boolean;
    targetAppointment: Appointment | null;
    fullList: Appointment[];
}

export function useCascadeReschedule({ isOpen, targetAppointment, fullList }: UseCascadeRescheduleProps) {
    const [activeTab, setActiveTab] = useState<'POSTERIOR' | 'ANTERIOR'>('POSTERIOR');
    const [offsetValue, setOffsetValue] = useState<number>(0);
    const [timeUnit, setTimeUnit] = useState<string>('MINUTES');
    const [startIndex, setStartIndex] = useState<number>(-1);
    const [endIndex, setEndIndex] = useState<number>(-1);

    // 🤖 MOTOR 1: Filtra agendamentos elegíveis ao reagendamento em bloco
    const candidatesList = useMemo(() => {
        if (!isOpen || !targetAppointment) return [];

        return fullList.filter((apt, idx) => {
            if (apt.status === 'CANCELED' || apt.status === 'COMPLETED') return false;
            if (apt.id === targetAppointment.id) return false;

            // Se for posterior, pega índices maiores que a nova vaga física, se anterior menores
            const targetIndexInFullList = fullList.findIndex(a => a.id === targetAppointment.id);
            return activeTab === 'POSTERIOR' ? idx >= targetIndexInFullList : idx < targetIndexInFullList;
        });
    }, [fullList, activeTab, targetAppointment, isOpen]);

    // 🤖 MOTOR 2: Extrai e mapeia em tempo real a lista de IDs contidos no intervalo de clique
    const affectedIds = useMemo(() => {
        if (startIndex === -1 || endIndex === -1) return [];
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        const ids = candidatesList.slice(start, end + 1).map(apt => apt.id);

        CustomLogger.info(`[Cascade Engine] Intervalo selecionado: ${start} até ${end}. Total de itens impactados: ${ids.length}`);
        return ids;
    }, [candidatesList, startIndex, endIndex]);

    const handleRowClick = (idx: number) => {
        if (startIndex === -1 || (startIndex !== -1 && endIndex !== -1)) {
            setStartIndex(idx);
            setEndIndex(-1);
        } else {
            setEndIndex(idx);
        }
    };

    const isRowSelected = (idx: number) => {
        if (startIndex === -1) return false;
        if (endIndex === -1) return idx === startIndex;
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        return idx >= start && idx <= end;
    };

    const resetSelection = () => {
        setStartIndex(-1);
        setEndIndex(-1);
    };

    return {
        activeTab, setActiveTab, offsetValue, setOffsetValue, timeUnit, setTimeUnit,
        candidatesList, affectedIds, handleRowClick, isRowSelected, resetSelection
    };
}
