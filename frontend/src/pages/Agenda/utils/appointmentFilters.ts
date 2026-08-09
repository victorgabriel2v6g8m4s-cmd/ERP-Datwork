import type { Appointment } from '../../../types/appointment.ts';
import type { AgendaCalendarRange, AgendaFiltersState } from '../types/agenda.types.ts';
import { getFinancialSearchText } from './appointmentFinancials.ts';
import { getAppointmentDayKey, getLocalDayKey, getWeekRangeKeys } from './appointmentSchedule.ts';

function matchesSearch(appointment: Appointment, search: string): boolean {
  if (!search.trim()) return true;
  const needle = search.trim().toLocaleLowerCase();
  const text = [
    appointment.title,
    appointment.firstName,
    appointment.lastName,
    appointment.phone,
    appointment.email,
    appointment.description,
    appointment.city,
    appointment.neighborhood,
    getFinancialSearchText(appointment.financials)
  ].filter(Boolean).join(' ').toLocaleLowerCase();
  return text.includes(needle);
}

function matchesDate(
  appointment: Appointment,
  filter: AgendaFiltersState['dateFilter'],
  calendarRange: AgendaCalendarRange,
  now: Date
): boolean {
  if (filter === 'all') return true;
  const dayKey = getAppointmentDayKey(appointment.createdAt);
  if (!dayKey) return false;

  if (filter === 'today') return dayKey === getLocalDayKey(now);
  if (filter === 'month') {
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return dayKey.startsWith(monthPrefix);
  }
  if (filter === 'week') {
    const range = getWeekRangeKeys(now);
    return dayKey >= range.start && dayKey <= range.end;
  }
  if (filter === 'custom' && calendarRange.start !== null && calendarRange.end !== null) {
    const start = getLocalDayKey(new Date(calendarRange.start));
    const end = getLocalDayKey(new Date(calendarRange.end));
    return dayKey >= start && dayKey <= end;
  }
  return false;
}

export function filterAndSortAppointments(
  appointments: Appointment[],
  filters: AgendaFiltersState,
  calendarRange: AgendaCalendarRange,
  showCanceledItems: boolean,
  now = new Date()
): Appointment[] {
  const filtered = appointments.filter((appointment) => {
    if (!showCanceledItems && appointment.status === 'CANCELED') return false;
    if (filters.statusFilter !== 'all' && appointment.status !== filters.statusFilter) return false;
    return matchesSearch(appointment, filters.search) && matchesDate(appointment, filters.dateFilter, calendarRange, now);
  });

  return [...filtered].sort((a, b) => {
    if (filters.sortBy === 'az') return a.title.localeCompare(b.title);
    if (filters.sortBy === 'date') {
      const aKey = `${getAppointmentDayKey(a.createdAt) ?? ''}T${a.time}`;
      const bKey = `${getAppointmentDayKey(b.createdAt) ?? ''}T${b.time}`;
      return bKey.localeCompare(aKey);
    }
    if (filters.sortBy === 'time') {
      const aKey = `${getAppointmentDayKey(a.createdAt) ?? ''}T${a.time}`;
      const bKey = `${getAppointmentDayKey(b.createdAt) ?? ''}T${b.time}`;
      return aKey.localeCompare(bKey);
    }
    return a.position - b.position;
  });
}
