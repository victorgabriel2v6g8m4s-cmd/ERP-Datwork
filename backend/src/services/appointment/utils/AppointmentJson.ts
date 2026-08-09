import type { Prisma } from '@prisma/client';
import type {
  AppointmentFinancialItem,
  AppointmentMediaItem
} from '../../../contracts/appointment/AppointmentContract.js';

export function toAppointmentMediaJson(items: AppointmentMediaItem[]): Prisma.InputJsonArray {
  return items.map(({ id, name, url, type }) => ({ id, name, url, type }));
}

export function toAppointmentFinancialJson(items: AppointmentFinancialItem[]): Prisma.InputJsonArray {
  return items.map(({ value, type, description }) => ({ value, type, description }));
}
