export type { MediaItem, MediaType } from './media.ts';

export interface FinancialItem {
  value: number;
  type: 'income' | 'expense';
  description: string;
}

export type AppointmentSubStatus = 
  | 'RASCUNHO' | 'AGUARDANDO_PAGAMENTO' | 'EM_ANALISE' | 'RECUSADO'
  | 'CONFIRMADO' | 'CHECK_IN' | 'EM_ESPERA' | 'EM_ANDAMENTO' | 'PAUSADO'
  | 'CONCLUIDO' | 'PARCIAL' | 'NAO_COMPARECEU' | 'REAGENDADO';

export interface Appointment {
  id: string;
  title: string; 
  time: string;
  position: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
  subStatus: AppointmentSubStatus;
  description?: string;
  medias?: string;      
  financials?: string;  
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  houseNumber?: string;
  complement?: string;
  referencePoint?: string;
}
