import { useCallback, useEffect, useState } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import { TEXTS } from '../../../i18n/index.ts';
import type { Appointment, AppointmentStatus, AppointmentSubStatus } from '../../../types/appointment.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { agendaService } from '../services/agenda.service.ts';
import type {
  AgendaCascadeDirection,
  AgendaTimeUnit,
  AppointmentMutationPayload
} from '../types/agenda.types.ts';

function replaceAppointment(list: Appointment[], updated: Appointment): Appointment[] {
  return list.map((item) => item.id === updated.id ? updated : item).sort((a, b) => a.position - b.position);
}

export function useAgendaActions() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [cascadeModalOpen, setCascadeModalOpen] = useState(false);
  const [cascadeTargetIndex, setCascadeTargetIndex] = useState(0);
  const [cascadeTargetItem, setCascadeTargetItem] = useState<Appointment | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAppointments(await agendaService.list());
    } catch (error) {
      CustomLogger.error(`[Agenda] ${TEXTS.agenda.errors.load}`, error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateAppointment = useCallback(async (payload: AppointmentMutationPayload) => {
    try {
      const created = await agendaService.create(payload);
      setAppointments((current) => [...current, created].sort((a, b) => a.position - b.position));
    } catch (error) {
      CustomLogger.error(`[Agenda] ${TEXTS.agenda.errors.create}`, error);
      throw error;
    }
  }, []);

  const handleUpdateAppointment = useCallback(async (id: string, payload: AppointmentMutationPayload) => {
    try {
      const updated = await agendaService.update(id, payload);
      setAppointments((current) => replaceAppointment(current, updated));
      setEditModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      CustomLogger.error(`[Agenda] ${TEXTS.agenda.errors.update}`, error);
      throw error;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    try {
      const updated = await agendaService.updateStatus(id, status);
      setAppointments((current) => replaceAppointment(current, updated));
    } catch (error) {
      CustomLogger.error(`[Agenda] ${TEXTS.agenda.errors.status}`, error);
      throw error;
    }
  }, []);

  const cycleStatus = useCallback(async (id: string) => {
    const target = appointments.find((item) => item.id === id);
    if (!target) return;
    const nextStatus: AppointmentStatus = target.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    await updateStatus(id, nextStatus);
  }, [appointments, updateStatus]);

  const triggerSoftDelete = useCallback(async (appointment: Appointment) => {
    if (appointment.status === 'CANCELED') {
      await updateStatus(appointment.id, 'PENDING');
      return;
    }
    setSelectedAppointment(appointment);
    setConfirmModalOpen(true);
  }, [updateStatus]);

  const executeConfirmDelete = useCallback(async () => {
    if (!selectedAppointment) return;
    try {
      await updateStatus(selectedAppointment.id, 'CANCELED');
      setConfirmModalOpen(false);
      setSelectedAppointment(null);
    } catch {
      // updateStatus already logs the operational failure.
    }
  }, [selectedAppointment, updateStatus]);

  const openEditModal = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditModalOpen(true);
  }, []);

  const openViewModal = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewModalOpen(true);
  }, []);

  const updateSubStatus = useCallback(async (id: string, subStatus: AppointmentSubStatus) => {
    try {
      const updated = await agendaService.updateSubStatus(id, subStatus);
      setAppointments((current) => replaceAppointment(current, updated));
    } catch (error) {
      CustomLogger.error(`[Agenda] ${TEXTS.agenda.errors.subStatus}`, error);
    }
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.index === source.index) return;
    const target = appointments.find((appointment) => appointment.id === draggableId);
    if (!target) return;
    setCascadeTargetItem(target);
    setCascadeTargetIndex(destination.index);
    setCascadeModalOpen(true);
  }, [appointments]);

  const handleExecuteCascadeReschedule = useCallback(async (
    selectedIds: string[],
    offsetValue: number,
    unit: AgendaTimeUnit,
    actionType: AgendaCascadeDirection
  ) => {
    if (!cascadeTargetItem) return;
    setLoading(true);
    try {
      const updated = await agendaService.cascadeReschedule({
        appointmentIds: selectedIds,
        offsetValue,
        unit,
        newPosition: cascadeTargetIndex,
        targetId: cascadeTargetItem.id,
        actionType
      });
      setAppointments(updated);
      setCascadeModalOpen(false);
      setCascadeTargetItem(null);
    } catch (error) {
      CustomLogger.error(`[Agenda] ${TEXTS.agenda.errors.cascade}`, error);
    } finally {
      setLoading(false);
    }
  }, [cascadeTargetIndex, cascadeTargetItem]);

  return {
    appointments,
    loading,
    reload: load,
    selectedAppointment,
    setSelectedAppointment,
    confirmModalOpen,
    setConfirmModalOpen,
    editModalOpen,
    setEditModalOpen,
    viewModalOpen,
    setViewModalOpen,
    cascadeModalOpen,
    setCascadeModalOpen,
    cascadeTargetIndex,
    cascadeTargetItem,
    setCascadeTargetItem,
    actions: {
      cycleStatus,
      triggerSoftDelete,
      executeConfirmDelete,
      openEditModal,
      openViewModal,
      updateSubStatus
    },
    handleCreateAppointment,
    handleUpdateAppointment,
    handleDragEnd,
    handleExecuteCascadeReschedule
  };
}
