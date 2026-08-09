import { APP_CONFIG } from '../../../config/app.config.ts';
import type {
  Appointment,
  AppointmentStatus,
  AppointmentSubStatus,
  FinancialItem,
  MediaItem,
  MediaType
} from '../../../types/appointment.ts';

const STATUS_VALUES: AppointmentStatus[] = ['PENDING', 'COMPLETED', 'CANCELED'];
const SUB_STATUS_VALUES: AppointmentSubStatus[] = [
  'RASCUNHO', 'AGUARDANDO_PAGAMENTO', 'EM_ANALISE', 'RECUSADO', 'CONFIRMADO',
  'CHECK_IN', 'EM_ESPERA', 'EM_ANDAMENTO', 'PAUSADO', 'CONCLUIDO', 'PARCIAL',
  'NAO_COMPARECEU', 'REAGENDADO'
];
const MEDIA_TYPES: MediaType[] = ['image', 'video', 'document'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseLegacyArray(value: unknown): unknown[] | null {
  let parsed = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  if (parsed === null || parsed === undefined) return [];
  return Array.isArray(parsed) ? parsed : null;
}

function parseMediaList(value: unknown): MediaItem[] | null {
  const entries = parseLegacyArray(value);
  if (!entries) return null;
  const output: MediaItem[] = [];
  for (const entry of entries) {
    if (!isRecord(entry)) return null;
    if (
      typeof entry.id !== 'string' ||
      typeof entry.name !== 'string' ||
      typeof entry.url !== 'string' ||
      typeof entry.type !== 'string' ||
      !MEDIA_TYPES.includes(entry.type as MediaType)
    ) return null;
    output.push({ id: entry.id, name: entry.name, url: entry.url, type: entry.type as MediaType });
  }
  return output;
}

function parseFinancials(value: unknown): FinancialItem[] | null {
  const entries = parseLegacyArray(value);
  if (!entries) return null;
  const output: FinancialItem[] = [];
  for (const entry of entries) {
    if (!isRecord(entry)) return null;
    const amount = typeof entry.value === 'number' ? entry.value : Number(entry.value);
    if (
      !Number.isFinite(amount) ||
      (entry.type !== 'income' && entry.type !== 'expense') ||
      typeof entry.description !== 'string'
    ) return null;
    output.push({ value: amount, type: entry.type, description: entry.description });
  }
  return output;
}

function nullableText(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : undefined;
}

export function parseAppointmentResponse(value: unknown): Appointment | null {
  if (!isRecord(value)) return null;
  const status = typeof value.status === 'string' && STATUS_VALUES.includes(value.status as AppointmentStatus)
    ? value.status as AppointmentStatus
    : null;
  const subStatus = typeof value.subStatus === 'string' && SUB_STATUS_VALUES.includes(value.subStatus as AppointmentSubStatus)
    ? value.subStatus as AppointmentSubStatus
    : APP_CONFIG.agenda.defaults.subStatus;
  const medias = parseMediaList(value.medias);
  const financials = parseFinancials(value.financials);
  const position = typeof value.position === 'number' ? value.position : Number(value.position);

  if (
    typeof value.id !== 'string' || !value.id ||
    typeof value.title !== 'string' || !value.title ||
    typeof value.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time) ||
    !Number.isInteger(position) || position < 0 ||
    !status || !medias || !financials ||
    typeof value.createdAt !== 'string' || Number.isNaN(Date.parse(value.createdAt)) ||
    typeof value.updatedAt !== 'string' || Number.isNaN(Date.parse(value.updatedAt))
  ) return null;

  const optionalFields = {
    description: nullableText(value.description),
    firstName: nullableText(value.firstName),
    lastName: nullableText(value.lastName),
    documentType: nullableText(value.documentType),
    documentNumber: nullableText(value.documentNumber),
    phone: nullableText(value.phone),
    email: nullableText(value.email),
    cep: nullableText(value.cep),
    state: nullableText(value.state),
    city: nullableText(value.city),
    neighborhood: nullableText(value.neighborhood),
    street: nullableText(value.street),
    houseNumber: nullableText(value.houseNumber),
    complement: nullableText(value.complement),
    referencePoint: nullableText(value.referencePoint)
  };
  if (Object.values(optionalFields).some((field) => field === undefined)) return null;

  return {
    id: value.id,
    title: value.title,
    time: value.time,
    position,
    status,
    subStatus,
    medias,
    financials,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    description: optionalFields.description ?? null,
    firstName: optionalFields.firstName ?? null,
    lastName: optionalFields.lastName ?? null,
    documentType: optionalFields.documentType ?? null,
    documentNumber: optionalFields.documentNumber ?? null,
    phone: optionalFields.phone ?? null,
    email: optionalFields.email ?? null,
    cep: optionalFields.cep ?? null,
    state: optionalFields.state ?? null,
    city: optionalFields.city ?? null,
    neighborhood: optionalFields.neighborhood ?? null,
    street: optionalFields.street ?? null,
    houseNumber: optionalFields.houseNumber ?? null,
    complement: optionalFields.complement ?? null,
    referencePoint: optionalFields.referencePoint ?? null
  };
}

export function parseAppointmentList(value: unknown): Appointment[] | null {
  if (!Array.isArray(value)) return null;
  const appointments = value.map(parseAppointmentResponse);
  return appointments.every((appointment): appointment is Appointment => appointment !== null)
    ? appointments.sort((a, b) => a.position - b.position)
    : null;
}
