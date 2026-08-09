export type { MediaItem, MediaType } from './media.ts';
import type { MediaItem } from './media.ts';

export interface FinancialItem {
  value: number;
  type: 'income' | 'expense';
  description: string;
}

export type AppointmentStatus = 'PENDING' | 'COMPLETED' | 'CANCELED';

export type AppointmentSubStatus =
  | 'RASCUNHO'
  | 'AGUARDANDO_PAGAMENTO'
  | 'EM_ANALISE'
  | 'RECUSADO'
  | 'CONFIRMADO'
  | 'CHECK_IN'
  | 'EM_ESPERA'
  | 'EM_ANDAMENTO'
  | 'PAUSADO'
  | 'CONCLUIDO'
  | 'PARCIAL'
  | 'NAO_COMPARECEU'
  | 'REAGENDADO';

export interface Appointment {
  id: string;
  title: string;
  time: string;
  position: number;
  status: AppointmentStatus;
  subStatus: AppointmentSubStatus;
  description: string | null;
  medias: MediaItem[];
  financials: FinancialItem[];
  createdAt: string;
  updatedAt: string;
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
