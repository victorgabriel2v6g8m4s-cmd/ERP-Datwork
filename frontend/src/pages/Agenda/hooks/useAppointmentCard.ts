import { useState } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';
import { type Appointment, type FinancialItem } from '../../../types/appointment.ts';
import { useLongPress } from '../../../hooks/useLongPress.ts';

interface UseAppointmentCardProps {
    appointment: Appointment;
    onSwipeRight: (id: string) => void;
    onSwipeLeft: (appointment: Appointment) => void;
    onLongPress: (appointment: Appointment) => void;
    onClick: (appointment: Appointment) => void;
}

export function useAppointmentCard({
    appointment, onSwipeRight, onSwipeLeft, onLongPress, onClick
}: UseAppointmentCardProps) {
    const x = useMotionValue(0);
    const [isPressing, setIsPressing] = useState(false);

    // 🧮 1. EXTRATOR DE SALDO FINANCEIRO DEFENSIVO
    const financials: FinancialItem[] = typeof appointment.financials === 'string'
        ? (() => { try { return JSON.parse(appointment.financials); } catch { return []; } })()
        : (Array.isArray(appointment.financials) ? appointment.financials : []);

    const balance = financials.reduce((acc, curr) => {
        if (curr.type === 'income') return acc + Number(curr.value || 0);
        if (curr.type === 'expense') return acc - Number(curr.value || 0);
        return acc;
    }, 0);

    // 📐 2. INTERPOLADOR DINÂMICO DE CORES E OPACIDADE (Framer Motion)
    const backgroundColor = useTransform(x, [-150, 0, 150], [
        '#ef4444', // Esquerda (Deletar)
        appointment.status === 'COMPLETED' ? '#f0fdf4' : appointment.status === 'CANCELED' ? '#fef2f2' : '#ffffff',
        '#22c55e'  // Direita (Concluir)
    ]);

    const opacityRight = useTransform(x, [0, 100], [0, 1]);
    const opacityLeft = useTransform(x, [-100, 0], [1, 0]);

    // 📱 3. DISPARADOR DE TOQUE LONGO CALIBRADO ANTI-SCROLL
    const longPressEvents = useLongPress({
        onLongPress: () => {
            if (Math.abs(x.get()) > 5) { setIsPressing(false); return; }
            setIsPressing(false);
            onLongPress(appointment);
        },
        onClick: () => {
            if (Math.abs(x.get()) > 5) return;
            setTimeout(() => onClick(appointment), 150);
        },
        delay: 800
    });

    // Ouve modificações em tempo real no arrasto para interromper a onda translúcida
    x.on("change", (latestX) => {
        if (Math.abs(latestX) > 5 && isPressing) setIsPressing(false);
    });

    const handleDragEnd = (_: any, info: any) => {
        setIsPressing(false);
        if (info.offset.x > 150) {
            onSwipeRight(appointment.id);
        } else if (info.offset.x < -150) {
            onSwipeLeft(appointment);
        }
        x.set(0);
    };

    const formattedDate = new Date(appointment.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return {
        x, isPressing, setIsPressing, financials, balance, backgroundColor,
        opacityRight, opacityLeft, longPressEvents, handleDragEnd, formattedDate
    };
}
