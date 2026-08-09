import { useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Appointment } from '../../../types/appointment.ts';
import type { AgendaCascadeDirection, AgendaTimeUnit } from '../types/agenda.types.ts';

interface UseCascadeRescheduleOptions {
  isOpen: boolean;
  targetAppointment: Appointment | null;
  droppedIndex: number;
  fullList: Appointment[];
}

export function useCascadeReschedule({
  isOpen,
  targetAppointment,
  droppedIndex,
  fullList
}: UseCascadeRescheduleOptions) {
  const [actionType, setActionType] = useState<AgendaCascadeDirection>(APP_CONFIG.agenda.defaults.cascadeDirection);
  const [offsetValue, setOffsetValue] = useState(0);
  const [timeUnit, setTimeUnit] = useState<AgendaTimeUnit>(APP_CONFIG.agenda.defaults.timeUnit);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const reorderedList = useMemo(() => {
    if (!targetAppointment) return [...fullList].sort((a, b) => a.position - b.position);
    const ordered = [...fullList].sort((a, b) => a.position - b.position);
    const currentIndex = ordered.findIndex((item) => item.id === targetAppointment.id);
    if (currentIndex < 0) return ordered;
    const [target] = ordered.splice(currentIndex, 1);
    if (!target) return ordered;
    ordered.splice(Math.min(Math.max(0, droppedIndex), ordered.length), 0, target);
    return ordered;
  }, [droppedIndex, fullList, targetAppointment]);

  const targetIndex = targetAppointment
    ? reorderedList.findIndex((item) => item.id === targetAppointment.id)
    : -1;

  const candidates = useMemo(() => {
    if (targetIndex < 0) return [];
    const segment = actionType === 'POSTERIOR'
      ? reorderedList.slice(targetIndex + 1)
      : reorderedList.slice(0, targetIndex);
    return segment.filter((item) => item.status === 'PENDING');
  }, [actionType, reorderedList, targetIndex]);

  useEffect(() => {
    if (!isOpen) return;
    setActionType(APP_CONFIG.agenda.defaults.cascadeDirection);
    setOffsetValue(0);
    setTimeUnit(APP_CONFIG.agenda.defaults.timeUnit);
    setSelectedIds([]);
  }, [droppedIndex, isOpen, targetAppointment?.id]);

  useEffect(() => {
    const candidateIds = new Set(candidates.map((item) => item.id));
    setSelectedIds((current) => current.filter((id) => candidateIds.has(id)));
  }, [candidates]);

  const toggleAppointment = (id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((currentId) => currentId !== id)
      : [...current, id]);
  };

  const canSubmit = selectedIds.length > 0 && offsetValue >= APP_CONFIG.agenda.cascade.minOffsetValue;

  return {
    actionType,
    setActionType,
    offsetValue,
    setOffsetValue,
    timeUnit,
    setTimeUnit,
    selectedIds,
    candidates,
    toggleAppointment,
    canSubmit
  };
}
