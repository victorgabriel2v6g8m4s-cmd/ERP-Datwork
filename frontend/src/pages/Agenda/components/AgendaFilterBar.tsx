import { CalendarIcon } from 'lucide-react';
import { UniversalSearchBar } from '../../../components/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import { type AgendaFiltersState } from '../hooks/useAgendaFilters.ts';

interface AgendaFilterBarProps {
    activeFilters: AgendaFiltersState;
    setActiveFilters: (filters: AgendaFiltersState) => void;
    onToggleViewMode: () => void;
}

export function AgendaFilterBar({ activeFilters, setActiveFilters, onToggleViewMode }: AgendaFilterBarProps) {
    return (
        <UniversalSearchBar
            type="agenda"
            filters={activeFilters}
            onFilterChange={(filters) => setActiveFilters(filters as AgendaFiltersState)}
            placeholder="Pesquisar por agendamento..."
        >
            {/* Botão de Gatilho da Janela de Calendário Infinito */}
            <button
                type="button"
                onClick={onToggleViewMode}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer border border-slate-950 transition-transform active:scale-95 shrink-0 h-[32px] sm:h-[34px]"
            >
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ver Calendário</span>
            </button>

            {/* Seletor estrito de Status Operacionais */}
            <select
                value={activeFilters.statusFilter}
                onChange={(e) => setActiveFilters({ ...activeFilters, statusFilter: e.target.value })}
                className={ERP_THEME.input.select}
            >
                <option value="all">Qualquer Status</option>
                <option value="PENDING">Agendados</option>
                <option value="COMPLETED">Realizados</option>
                <option value="CANCELED">Cancelados</option>
            </select>

            {/* Seletor reativo de Fuso Cronológico */}
            <select
                value={activeFilters.dateFilter}
                onChange={(e) => setActiveFilters({ ...activeFilters, dateFilter: e.target.value })}
                className={ERP_THEME.input.select}
            >
                <option value="all">Todas as Datas</option>
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
                <option value="custom" disabled>Personalizado</option>
            </select>
        </UniversalSearchBar>
    );
}
