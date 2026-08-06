import { useState, useMemo } from 'react';
import { type Appointment } from '../../../types/appointment.ts';

export interface AgendaFiltersState {
    search: string;
    sortBy: string;
    statusFilter: string;
    dateFilter: string;
}

export function useAgendaFilters(appointments: Appointment[], showCanceledItems: boolean) {
    const [calendarRange, setCalendarRange] = useState<{ start: number | null; end: number | null }>({ start: null, end: null });

    const [activeFilters, setActiveFilters] = useState<AgendaFiltersState>({
        search: '',
        sortBy: 'custom',
        statusFilter: 'all',
        dateFilter: 'all'
    });

    // ✨ Toda a complexa inteligência matemática isolada da folha do JSX
    const filteredAppointments = useMemo(() => {
        if (!appointments) return [];

        return appointments.filter((item) => {
            if (!showCanceledItems && item.status === 'CANCELED') return false;

            // A. Filtragem de Busca Direta Textual
            if (activeFilters.search) {
                const searchLower = activeFilters.search.toLowerCase();
                const matchesTitle = (item.title || '').toLowerCase().includes(searchLower);
                const matchesClient = ((item as any).clientName || '').toLowerCase().includes(searchLower);
                const matchesDescription = ((item as any).description || '').toLowerCase().includes(searchLower);

                // Tratamento reativo seguro para o financials (que agora vem como Objeto ou String)
                const financialsStr = typeof item.financials === 'string'
                    ? item.financials
                    : JSON.stringify(item.financials || '');
                const matchesFinance = financialsStr.toLowerCase().includes(searchLower);

                if (!matchesTitle && !matchesClient && !matchesDescription && !matchesFinance) {
                    return false;
                }
            }

            // B. Filtragem pelo Estado do Atendimento
            if (activeFilters.statusFilter !== 'all' && item.status !== activeFilters.statusFilter) {
                return false;
            }

            // C. Filtragem Temporal de Calendário
            if (activeFilters.dateFilter !== 'all') {
                const rawDate = item.createdAt || item.time || (item as any).date;
                if (!rawDate || isNaN(Date.parse(rawDate))) return false;

                const d = new Date(rawDate);
                const itemDayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                if (activeFilters.dateFilter === 'today' && itemDayStr !== todayStr) return false;

                if (activeFilters.dateFilter === 'week') {
                    const startOfWeek = new Date();
                    startOfWeek.setDate(startOfWeek.getDate() - 7);
                    startOfWeek.setHours(0, 0, 0, 0);
                    const endOfWeek = new Date();
                    endOfWeek.setHours(23, 59, 59, 999);

                    if (d.getTime() < startOfWeek.getTime() || d.getTime() > endOfWeek.getTime()) return false;
                }

                if (activeFilters.dateFilter === 'month' && (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth())) {
                    return false;
                }

                if (activeFilters.dateFilter === 'custom' && calendarRange.start && calendarRange.end) {
                    const startD = new Date(calendarRange.start);
                    const endD = new Date(calendarRange.end);
                    const targetStartStr = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`;
                    const targetEndStr = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`;

                    if (itemDayStr < targetStartStr || itemDayStr > targetEndStr) return false;
                }
            }

            return true;
        });
    }, [appointments, activeFilters, showCanceledItems, calendarRange]);

    return {
        activeFilters,
        setActiveFilters,
        calendarRange,
        setCalendarRange,
        filteredAppointments
    };
}
