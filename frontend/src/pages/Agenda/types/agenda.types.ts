import type {
  AppointmentStatus,
  AppointmentSubStatus,
  FinancialItem,
  MediaItem
} from '../../../types/appointment.ts';

export type AgendaViewMode = 'LIST' | 'CALENDAR';
export type AgendaSortMode = 'custom' | 'az' | 'date' | 'time';
export type AgendaDateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
export type AgendaStatusFilter = 'all' | AppointmentStatus;
export type AgendaTimeUnit = 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS' | 'MONTHS';
export type AgendaCascadeDirection = 'POSTERIOR' | 'ANTERIOR';

export interface AgendaFiltersState {
  search: string;
  sortBy: AgendaSortMode;
  statusFilter: AgendaStatusFilter;
  dateFilter: AgendaDateFilter;
}

export interface AgendaCalendarRange {
  start: number | null;
  end: number | null;
}

export interface AppointmentMutationPayload {
  title: string;
  time: string;
  createdAt: string;
  subStatus: AppointmentSubStatus;
  description: string | null;
  medias: MediaItem[];
  financials: FinancialItem[];
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

export interface AgendaCascadePayload {
  appointmentIds: string[];
  offsetValue: number;
  unit: AgendaTimeUnit;
  newPosition: number;
  targetId: string;
  actionType: AgendaCascadeDirection;
}
