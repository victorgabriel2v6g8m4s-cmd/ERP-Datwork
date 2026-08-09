import { api } from '../../../api/client.ts';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Appointment, AppointmentStatus, AppointmentSubStatus } from '../../../types/appointment.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import type { AgendaCascadePayload, AppointmentMutationPayload } from '../types/agenda.types.ts';
import { parseAppointmentList, parseAppointmentResponse } from '../utils/appointmentContract.ts';

function invalidContract(operation: string): never {
  CustomLogger.error(`[Agenda] Invalid response contract received during ${operation}`);
  throw new Error('InvalidAppointmentResponseContract');
}

export const agendaService = {
  async list(): Promise<Appointment[]> {
    const response = await api.get<unknown>(APP_CONFIG.api.endpoints.agenda.appointments);
    return parseAppointmentList(response.data) ?? invalidContract('list');
  },

  async create(payload: AppointmentMutationPayload): Promise<Appointment> {
    const response = await api.post<unknown>(APP_CONFIG.api.endpoints.agenda.appointments, payload);
    return parseAppointmentResponse(response.data) ?? invalidContract('create');
  },

  async update(id: string, payload: AppointmentMutationPayload): Promise<Appointment> {
    const response = await api.put<unknown>(APP_CONFIG.api.endpoints.agenda.appointment(id), payload);
    return parseAppointmentResponse(response.data) ?? invalidContract('update');
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const response = await api.patch<unknown>(APP_CONFIG.api.endpoints.agenda.status(id), { status });
    return parseAppointmentResponse(response.data) ?? invalidContract('status update');
  },

  async updateSubStatus(id: string, subStatus: AppointmentSubStatus): Promise<Appointment> {
    const response = await api.patch<unknown>(APP_CONFIG.api.endpoints.agenda.subStatus(id), { subStatus });
    return parseAppointmentResponse(response.data) ?? invalidContract('sub-status update');
  },

  async cascadeReschedule(payload: AgendaCascadePayload): Promise<Appointment[]> {
    const response = await api.patch<unknown>(APP_CONFIG.api.endpoints.agenda.cascadeReschedule, payload);
    return parseAppointmentList(response.data) ?? invalidContract('cascade reschedule');
  }
};
