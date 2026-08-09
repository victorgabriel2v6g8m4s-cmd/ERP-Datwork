import { CalendarIcon } from 'lucide-react';
import { UniversalSearchBar } from '../../../components/index.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import type { AgendaDateFilter, AgendaFiltersState, AgendaStatusFilter } from '../types/agenda.types.ts';

interface AgendaFilterBarProps {
  activeFilters: AgendaFiltersState;
  setActiveFilters: (filters: AgendaFiltersState) => void;
  onToggleViewMode: () => void;
}

export function AgendaFilterBar({ activeFilters, setActiveFilters, onToggleViewMode }: AgendaFilterBarProps) {
  return (
    <div data-ui-key={UI_KEYS.agenda.filters}>
      <UniversalSearchBar
        type="agenda"
        filters={activeFilters}
        onFilterChange={(filters) => setActiveFilters(filters as AgendaFiltersState)}
        placeholder={TEXTS.agenda.filters.searchPlaceholder}
      >
        <button
          data-ui-key={UI_KEYS.agenda.calendarAction}
          type="button"
          onClick={onToggleViewMode}
          className={ERP_THEME.agenda.filters.calendarButton}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>{TEXTS.agenda.filters.calendarAction}</span>
        </button>

        <select
          data-ui-key={UI_KEYS.agenda.statusFilter}
          value={activeFilters.statusFilter}
          onChange={(event) => setActiveFilters({ ...activeFilters, statusFilter: event.target.value as AgendaStatusFilter })}
          className={ERP_THEME.input.select}
        >
          <option value="all">{TEXTS.agenda.filters.statusAll}</option>
          <option value="PENDING">{TEXTS.agenda.filters.pending}</option>
          <option value="COMPLETED">{TEXTS.agenda.filters.completed}</option>
          <option value="CANCELED">{TEXTS.agenda.filters.canceled}</option>
        </select>

        <select
          data-ui-key={UI_KEYS.agenda.dateFilter}
          value={activeFilters.dateFilter}
          onChange={(event) => setActiveFilters({ ...activeFilters, dateFilter: event.target.value as AgendaDateFilter })}
          className={ERP_THEME.input.select}
        >
          <option value="all">{TEXTS.agenda.filters.dateAll}</option>
          <option value="today">{TEXTS.agenda.filters.today}</option>
          <option value="week">{TEXTS.agenda.filters.week}</option>
          <option value="month">{TEXTS.agenda.filters.month}</option>
          <option value="custom" disabled>{TEXTS.agenda.filters.custom}</option>
        </select>
      </UniversalSearchBar>
    </div>
  );
}
