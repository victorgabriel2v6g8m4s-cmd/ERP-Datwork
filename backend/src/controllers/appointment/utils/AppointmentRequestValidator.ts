import { AppointmentStatus } from '@prisma/client';
import type {
  AppointmentCascadeDirection,
  AppointmentCascadeInput,
  AppointmentFinancialItem,
  AppointmentMediaItem,
  AppointmentMutationInput,
  AppointmentSubStatus,
  AppointmentTimeUnit,
  AppointmentUpdateInput
} from '../../../contracts/appointment/AppointmentContract.js';
import {
  APPOINTMENT_CASCADE_DIRECTIONS,
  APPOINTMENT_SUB_STATUSES,
  APPOINTMENT_TIME_UNITS,
  DEFAULT_APPOINTMENT_SUB_STATUS
} from '../../../contracts/appointment/AppointmentContract.js';

export class AppointmentRequestValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message);
    this.name = 'AppointmentRequestValidationError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppointmentRequestValidationError(field, `O campo ${field} é obrigatório e deve ser um texto válido.`);
  }
  return value.trim();
}

function nullableText(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') {
    throw new AppointmentRequestValidationError(field, `O campo ${field} deve ser um texto válido.`);
  }
  return value.trim() || null;
}

function parseTime(value: unknown): string {
  const time = requiredText(value, 'time');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new AppointmentRequestValidationError('time', 'O horário deve usar o formato HH:MM.');
  }
  return time;
}

function parseScheduledDate(value: unknown): Date {
  const raw = requiredText(value, 'createdAt');
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00.000Z` : raw;
  const parsed = new Date(dateOnly);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppointmentRequestValidationError('createdAt', 'A data do agendamento é inválida.');
  }
  return parsed;
}

function parseSubStatus(value: unknown, required = false): AppointmentSubStatus {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new AppointmentRequestValidationError('subStatus', 'O sub-status é obrigatório.');
    }
    return DEFAULT_APPOINTMENT_SUB_STATUS;
  }
  if (typeof value === 'string' && APPOINTMENT_SUB_STATUSES.includes(value as AppointmentSubStatus)) {
    return value as AppointmentSubStatus;
  }
  throw new AppointmentRequestValidationError('subStatus', 'O sub-status informado não pertence ao catálogo permitido.');
}

function parseMedia(value: unknown): AppointmentMediaItem[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new AppointmentRequestValidationError('medias', 'O campo medias deve ser uma lista.');
  }
  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new AppointmentRequestValidationError(`medias[${index}]`, 'A mídia possui estrutura inválida.');
    }
    const id = requiredText(entry.id, `medias[${index}].id`);
    const name = requiredText(entry.name, `medias[${index}].name`);
    const url = requiredText(entry.url, `medias[${index}].url`);
    if (entry.type !== 'image' && entry.type !== 'video' && entry.type !== 'document') {
      throw new AppointmentRequestValidationError(`medias[${index}].type`, 'O tipo da mídia é inválido.');
    }
    return { id, name, url, type: entry.type };
  });
}

function parseFinancials(value: unknown): AppointmentFinancialItem[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new AppointmentRequestValidationError('financials', 'O campo financials deve ser uma lista.');
  }
  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new AppointmentRequestValidationError(`financials[${index}]`, 'O lançamento financeiro possui estrutura inválida.');
    }
    const numericValue = typeof entry.value === 'number' ? entry.value : Number(entry.value);
    if (!Number.isFinite(numericValue)) {
      throw new AppointmentRequestValidationError(`financials[${index}].value`, 'O valor financeiro deve ser um número válido.');
    }
    if (entry.type !== 'income' && entry.type !== 'expense') {
      throw new AppointmentRequestValidationError(`financials[${index}].type`, 'O tipo financeiro deve ser income ou expense.');
    }
    const description = requiredText(entry.description, `financials[${index}].description`);
    return { value: numericValue, type: entry.type, description };
  });
}

function parseMutation(value: unknown): AppointmentMutationInput {
  if (!isRecord(value)) {
    throw new AppointmentRequestValidationError('body', 'O payload do agendamento deve ser um objeto válido.');
  }
  return {
    title: requiredText(value.title, 'title'),
    time: parseTime(value.time),
    createdAt: parseScheduledDate(value.createdAt),
    subStatus: parseSubStatus(value.subStatus),
    description: nullableText(value.description, 'description'),
    medias: parseMedia(value.medias),
    financials: parseFinancials(value.financials),
    firstName: nullableText(value.firstName, 'firstName'),
    lastName: nullableText(value.lastName, 'lastName'),
    documentType: nullableText(value.documentType, 'documentType'),
    documentNumber: nullableText(value.documentNumber, 'documentNumber'),
    phone: nullableText(value.phone, 'phone'),
    email: nullableText(value.email, 'email'),
    cep: nullableText(value.cep, 'cep'),
    state: nullableText(value.state, 'state'),
    city: nullableText(value.city, 'city'),
    neighborhood: nullableText(value.neighborhood, 'neighborhood'),
    street: nullableText(value.street, 'street'),
    houseNumber: nullableText(value.houseNumber, 'houseNumber'),
    complement: nullableText(value.complement, 'complement'),
    referencePoint: nullableText(value.referencePoint, 'referencePoint')
  };
}

export function parseAppointmentCreate(value: unknown): AppointmentMutationInput {
  return parseMutation(value);
}

export function parseAppointmentUpdate(idValue: unknown, value: unknown): AppointmentUpdateInput {
  return { id: parseAppointmentId(idValue), ...parseMutation(value) };
}

export function parseAppointmentId(value: unknown): string {
  return requiredText(value, 'id');
}

export function parseAppointmentStatus(value: unknown): AppointmentStatus {
  if (value === AppointmentStatus.PENDING || value === AppointmentStatus.COMPLETED || value === AppointmentStatus.CANCELED) {
    return value;
  }
  throw new AppointmentRequestValidationError('status', 'O status deve ser PENDING, COMPLETED ou CANCELED.');
}

export function parseAppointmentSubStatus(value: unknown): AppointmentSubStatus {
  return parseSubStatus(value, true);
}

export function parseAppointmentListStatus(value: unknown): AppointmentStatus | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    throw new AppointmentRequestValidationError('status', 'O filtro status deve possuir um único valor.');
  }
  return parseAppointmentStatus(value);
}

export function parseAppointmentCascade(value: unknown): AppointmentCascadeInput {
  if (!isRecord(value)) {
    throw new AppointmentRequestValidationError('body', 'O payload de reagendamento deve ser um objeto válido.');
  }
  if (!Array.isArray(value.appointmentIds) || value.appointmentIds.length === 0) {
    throw new AppointmentRequestValidationError('appointmentIds', 'Informe ao menos um agendamento afetado.');
  }
  const ids = value.appointmentIds.map((id, index) => requiredText(id, `appointmentIds[${index}]`));
  if (new Set(ids).size !== ids.length) {
    throw new AppointmentRequestValidationError('appointmentIds', 'A lista de agendamentos contém IDs duplicados.');
  }
  const offsetValue = typeof value.offsetValue === 'number' ? value.offsetValue : Number(value.offsetValue);
  if (!Number.isFinite(offsetValue) || offsetValue <= 0) {
    throw new AppointmentRequestValidationError('offsetValue', 'O deslocamento deve ser maior que zero.');
  }
  const newPosition = typeof value.newPosition === 'number' ? value.newPosition : Number(value.newPosition);
  if (!Number.isInteger(newPosition) || newPosition < 0) {
    throw new AppointmentRequestValidationError('newPosition', 'A nova posição deve ser um inteiro maior ou igual a zero.');
  }
  if (typeof value.unit !== 'string' || !APPOINTMENT_TIME_UNITS.includes(value.unit as AppointmentTimeUnit)) {
    throw new AppointmentRequestValidationError('unit', 'A unidade temporal é inválida.');
  }
  if (typeof value.actionType !== 'string' || !APPOINTMENT_CASCADE_DIRECTIONS.includes(value.actionType as AppointmentCascadeDirection)) {
    throw new AppointmentRequestValidationError('actionType', 'A direção do reagendamento é inválida.');
  }
  return {
    appointmentIds: ids,
    offsetValue,
    unit: value.unit as AppointmentTimeUnit,
    newPosition,
    targetId: requiredText(value.targetId, 'targetId'),
    actionType: value.actionType as AppointmentCascadeDirection
  };
}
