import { APP_CONFIG } from '../../../config/app.config.ts';

const ISO_DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function getAppointmentDayKey(createdAt: string): string | null {
  const match = ISO_DAY_PATTERN.exec(createdAt);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function getLocalDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatAppointmentDate(createdAt: string): string {
  const key = getAppointmentDayKey(createdAt);
  if (!key) return '';
  const [year, month, day] = key.split('-');
  return `${day}/${month}/${year}`;
}

export function formatAppointmentMonth(createdAt: string): string {
  const key = getAppointmentDayKey(createdAt);
  if (!key) return '';
  const [year, month, day] = key.split('-').map(Number);
  return new Intl.DateTimeFormat(APP_CONFIG.locale, { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, day));
}

export function getWeekRangeKeys(now: Date): { start: string; end: string } {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayFromMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayFromMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start: getLocalDayKey(start), end: getLocalDayKey(end) };
}
