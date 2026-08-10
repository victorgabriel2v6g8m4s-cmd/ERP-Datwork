export const APPOINTMENT_SUB_STATUSES = [
  'RASCUNHO',
  'AGUARDANDO_PAGAMENTO',
  'EM_ANALISE',
  'RECUSADO',
  'CONFIRMADO',
  'CHECK_IN',
  'EM_ESPERA',
  'EM_ANDAMENTO',
  'PAUSADO',
  'CONCLUIDO',
  'PARCIAL',
  'NAO_COMPARECEU',
  'REAGENDADO'
] as const;

export const APPOINTMENT_TIME_UNITS = ['MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS'] as const;
export const APPOINTMENT_CASCADE_DIRECTIONS = ['POSTERIOR', 'ANTERIOR'] as const;
export const DEFAULT_APPOINTMENT_SUB_STATUS = 'CONFIRMADO' as const;

export type AppointmentPublicStatus = 'PENDING' | 'COMPLETED' | 'CANCELED';
export type AppointmentSubStatus = typeof APPOINTMENT_SUB_STATUSES[number];
export type AppointmentTimeUnit = typeof APPOINTMENT_TIME_UNITS[number];
export type AppointmentCascadeDirection = typeof APPOINTMENT_CASCADE_DIRECTIONS[number];
export type AppointmentFinancialType = 'income' | 'expense';
export type AppointmentMediaType = 'image' | 'video' | 'document';

export interface AppointmentMediaItem {
  id: string;
  name: string;
  url: string;
  type: AppointmentMediaType;
}

export interface AppointmentFinancialItem {
  value: number;
  type: AppointmentFinancialType;
  description: string;
}

export interface AppointmentResponse {
  id: string;
  title: string;
  time: string;
  position: number;
  status: AppointmentPublicStatus;
  subStatus: AppointmentSubStatus;
  description: string | null;
  medias: AppointmentMediaItem[];
  financials: AppointmentFinancialItem[];
  firstName: string | null;
  lastName: string | null;
  documentType: string | null;
  documentNumber: string | null;
  phone: string | null;
  email: string | null;
  cep: string | null;
  state: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  houseNumber: string | null;
  complement: string | null;
  referencePoint: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentMutationInput {
  title: string;
  time: string;
  createdAt: Date;
  subStatus: AppointmentSubStatus;
  description: string | null;
  medias: AppointmentMediaItem[];
  financials: AppointmentFinancialItem[];
  firstName: string | null;
  lastName: string | null;
  documentType: string | null;
  documentNumber: string | null;
  phone: string | null;
  email: string | null;
  cep: string | null;
  state: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  houseNumber: string | null;
  complement: string | null;
  referencePoint: string | null;
}

export interface AppointmentUpdateInput extends AppointmentMutationInput {
  id: string;
}

export interface AppointmentCascadeInput {
  appointmentIds: string[];
  offsetValue: number;
  unit: AppointmentTimeUnit;
  newPosition: number;
  targetId: string;
  actionType: AppointmentCascadeDirection;
}

export interface AppointmentOrderInput {
  id: string;
  newPosition: number;
}
