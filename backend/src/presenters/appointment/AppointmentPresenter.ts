import type { Appointment, Prisma } from '@prisma/client';
import type {
  AppointmentFinancialItem,
  AppointmentMediaItem,
  AppointmentPublicStatus,
  AppointmentResponse,
  AppointmentSubStatus
} from '../../contracts/appointment/AppointmentContract.js';
import {
  APPOINTMENT_SUB_STATUSES,
  DEFAULT_APPOINTMENT_SUB_STATUS
} from '../../contracts/appointment/AppointmentContract.js';

function parseLegacyJson(value: Prisma.JsonValue | null): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeMedia(value: Prisma.JsonValue | null): AppointmentMediaItem[] {
  const parsed = parseLegacyJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const { id, name, url, type } = entry;
    if (
      typeof id !== 'string' || !id.trim() ||
      typeof name !== 'string' || !name.trim() ||
      typeof url !== 'string' || !url.trim() ||
      (type !== 'image' && type !== 'video' && type !== 'document')
    ) return [];

    return [{ id: id.trim(), name: name.trim(), url: url.trim(), type }];
  });
}

function normalizeFinancials(value: Prisma.JsonValue | null): AppointmentFinancialItem[] {
  const parsed = parseLegacyJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const numericValue = typeof entry.value === 'number' ? entry.value : Number(entry.value);
    if (
      !Number.isFinite(numericValue) ||
      (entry.type !== 'income' && entry.type !== 'expense') ||
      typeof entry.description !== 'string'
    ) return [];

    return [{ value: numericValue, type: entry.type, description: entry.description.trim() }];
  });
}

function normalizeSubStatus(value: string | null): AppointmentSubStatus {
  return APPOINTMENT_SUB_STATUSES.includes(value as AppointmentSubStatus)
    ? value as AppointmentSubStatus
    : DEFAULT_APPOINTMENT_SUB_STATUS;
}

function normalizeStatus(value: Appointment['status']): AppointmentPublicStatus {
  if (value === 'COMPLETED' || value === 'CANCELED') return value;
  return 'PENDING';
}

export function presentAppointment(appointment: Appointment): AppointmentResponse {
  return {
    id: appointment.id,
    title: appointment.title,
    time: appointment.time,
    position: appointment.position,
    status: normalizeStatus(appointment.status),
    subStatus: normalizeSubStatus(appointment.subStatus),
    description: appointment.description,
    medias: normalizeMedia(appointment.medias),
    financials: normalizeFinancials(appointment.financials),
    firstName: appointment.firstName,
    lastName: appointment.lastName,
    documentType: appointment.documentType,
    documentNumber: appointment.documentNumber,
    phone: appointment.phone,
    email: appointment.email,
    cep: appointment.cep,
    state: appointment.state,
    city: appointment.city,
    neighborhood: appointment.neighborhood,
    street: appointment.street,
    houseNumber: appointment.houseNumber,
    complement: appointment.complement,
    referencePoint: appointment.referencePoint,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString()
  };
}

export function presentAppointmentList(appointments: Appointment[]): AppointmentResponse[] {
  return appointments.map(presentAppointment);
}
