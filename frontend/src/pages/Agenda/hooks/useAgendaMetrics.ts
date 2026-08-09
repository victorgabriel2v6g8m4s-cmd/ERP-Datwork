import { useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Appointment } from '../../../types/appointment.ts';

export function useAgendaMetrics(appointments: Appointment[]) {
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(
      () => setCurrentDateTime(new Date()),
      APP_CONFIG.agenda.interactions.metricsClockIntervalMs
    );
    return () => window.clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => currentDateTime.toLocaleDateString(APP_CONFIG.locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  }), [currentDateTime]);

  const formattedTime = useMemo(() => currentDateTime.toLocaleTimeString(APP_CONFIG.locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }), [currentDateTime]);

  const metrics = useMemo(() => appointments.reduce((current, item) => ({
    totalAppointments: current.totalAppointments + 1,
    pendingAppointments: current.pendingAppointments + (item.status === 'PENDING' ? 1 : 0),
    completedAppointments: current.completedAppointments + (item.status === 'COMPLETED' ? 1 : 0),
    canceledAppointments: current.canceledAppointments + (item.status === 'CANCELED' ? 1 : 0)
  }), {
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    canceledAppointments: 0
  }), [appointments]);

  return { formattedDate, formattedTime, ...metrics };
}
