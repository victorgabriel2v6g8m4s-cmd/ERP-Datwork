import type { FinancialItem } from '../../../types/appointment.ts';

export function calculateAppointmentBalance(financials: FinancialItem[]): number {
  return financials.reduce((total, item) => (
    item.type === 'income' ? total + item.value : total - item.value
  ), 0);
}

export function getFinancialSearchText(financials: FinancialItem[]): string {
  return financials
    .map((item) => `${item.description} ${item.type} ${item.value}`)
    .join(' ')
    .toLocaleLowerCase();
}
