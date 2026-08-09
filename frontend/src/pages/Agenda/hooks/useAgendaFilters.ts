import { useMemo, useState } from 'react';
import type { Appointment } from '../../../types/appointment.ts';
import type { AgendaCalendarRange, AgendaFiltersState } from '../types/agenda.types.ts';
import { filterAndSortAppointments } from '../utils/appointmentFilters.ts';

const DEFAULT_FILTERS: AgendaFiltersState = {
  search: '',
  sortBy: 'custom',
  statusFilter: 'all',
  dateFilter: 'all'
};

export function useAgendaFilters(appointments: Appointment[], showCanceledItems = true) {
  const [calendarRange, setCalendarRange] = useState<AgendaCalendarRange>({ start: null, end: null });
  const [activeFilters, setActiveFilters] = useState<AgendaFiltersState>(DEFAULT_FILTERS);

  const filteredAppointments = useMemo(
    () => filterAndSortAppointments(appointments, activeFilters, calendarRange, showCanceledItems),
    [appointments, activeFilters, calendarRange, showCanceledItems]
  );

  return {
    activeFilters,
    setActiveFilters,
    calendarRange,
    setCalendarRange,
    filteredAppointments
  };
}
