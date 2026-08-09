import { useEffect, useState } from 'react';
import { useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import type { Appointment } from '../../../types/appointment.ts';
import { useLongPress } from '../../../hooks/useLongPress.ts';
import { calculateAppointmentBalance } from '../utils/appointmentFinancials.ts';
import { formatAppointmentDate } from '../utils/appointmentSchedule.ts';

interface UseAppointmentCardProps {
  appointment: Appointment;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (appointment: Appointment) => void;
  onLongPress: (appointment: Appointment) => void;
  onClick: (appointment: Appointment) => void;
}

export function useAppointmentCard({ appointment, onSwipeRight, onSwipeLeft, onLongPress, onClick }: UseAppointmentCardProps) {
  const x = useMotionValue(0);
  const [isPressing, setIsPressing] = useState(false);
  const interactionConfig = APP_CONFIG.agenda.interactions;
  const colors = ERP_THEME.agenda.card.motionColors;
  const neutralColor = appointment.status === 'COMPLETED'
    ? colors.completed
    : appointment.status === 'CANCELED' ? colors.canceled : colors.pending;

  const backgroundColor = useTransform(
    x,
    [-interactionConfig.swipeActionThresholdPx, 0, interactionConfig.swipeActionThresholdPx],
    [colors.delete, neutralColor, colors.complete]
  );
  const opacityRight = useTransform(x, [0, interactionConfig.swipeOpacityThresholdPx], [0, 1]);
  const opacityLeft = useTransform(x, [-interactionConfig.swipeOpacityThresholdPx, 0], [1, 0]);

  useEffect(() => x.on('change', (latestX) => {
    if (Math.abs(latestX) > interactionConfig.movementCancelThresholdPx) setIsPressing(false);
  }), [interactionConfig.movementCancelThresholdPx, x]);

  const longPressEvents = useLongPress({
    onLongPress: () => {
      if (Math.abs(x.get()) > interactionConfig.movementCancelThresholdPx) return;
      setIsPressing(false);
      onLongPress(appointment);
    },
    onClick: () => {
      if (Math.abs(x.get()) > interactionConfig.movementCancelThresholdPx) return;
      window.setTimeout(() => onClick(appointment), interactionConfig.clickDelayMs);
    },
    delay: interactionConfig.longPressDelayMs
  });

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsPressing(false);
    if (info.offset.x > interactionConfig.swipeActionThresholdPx) onSwipeRight(appointment.id);
    if (info.offset.x < -interactionConfig.swipeActionThresholdPx) onSwipeLeft(appointment);
    x.set(0);
  };

  return {
    x,
    isPressing,
    setIsPressing,
    financials: appointment.financials,
    balance: calculateAppointmentBalance(appointment.financials),
    backgroundColor,
    opacityRight,
    opacityLeft,
    longPressEvents,
    handleDragEnd,
    formattedDate: formatAppointmentDate(appointment.createdAt)
  };
}
