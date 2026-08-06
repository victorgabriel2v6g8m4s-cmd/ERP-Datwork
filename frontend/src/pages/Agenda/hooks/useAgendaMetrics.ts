import { useState, useEffect, useMemo } from 'react';
import { type Appointment } from '../../../types/appointment.ts';

export function useAgendaMetrics(appointments: Appointment[]) {
    // ⏱️ Relógio de Auditoria Operacional
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    // Sincronização Dinâmica e Batimento de Ciclo de Vida do Cronômetro
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 📆 Formatadores Cronológicos Puros Ajustados ao Fuso Local
    const formattedDate = useMemo(() => {
        return currentDateTime.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
        });
    }, [currentDateTime]);

    const formattedTime = useMemo(() => {
        return currentDateTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }, [currentDateTime]);

    // 🧮 KPI METRICS ENGINE: Cálculos matemáticos memoizados baseados no banco SQLite
    const metrics = useMemo(() => {
        const total = appointments?.length || 0;

        let pending = 0;
        let completed = 0;
        let canceled = 0;

        appointments.forEach((item) => {
            if (item.status === 'PENDING') pending++;
            else if (item.status === 'COMPLETED') completed++;
            else if (item.status === 'CANCELED') canceled++;
        });

        return {
            totalAppointments: total,
            pendingAppointments: pending,
            completedAppointments: completed,
            canceledAppointments: canceled
        };
    }, [appointments]);

    return {
        formattedDate,
        formattedTime,
        ...metrics
    };
}
