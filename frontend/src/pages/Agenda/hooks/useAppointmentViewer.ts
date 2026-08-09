import { useMemo } from 'react';
import type { Appointment } from '../../../types/appointment.ts';
import { formatAppointmentDate } from '../utils/appointmentSchedule.ts';

interface UseAppointmentViewerProps {
  isOpen: boolean;
  appointment: Appointment | null;
}

export function useAppointmentViewer({ isOpen, appointment }: UseAppointmentViewerProps) {
  return useMemo(() => {
    if (!appointment || !isOpen) {
      return { description: '', medias: [], financials: [], formattedDate: '' };
    }

    return {
      description: appointment.description ?? '',
      medias: appointment.medias,
      financials: appointment.financials,
      formattedDate: formatAppointmentDate(appointment.createdAt)
    };
  }, [appointment, isOpen]);
}
