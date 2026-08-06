import { useState } from 'react';
import { api } from '../../../api/client.ts';
import { type Appointment } from '../../../types/appointment.ts';
import { useGridGestures } from '../../../hooks/useGridGestures.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts'

export function useAgendaActions() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [cascadeModalOpen, setCascadeModalOpen] = useState(false);
    const [cascadeTargetIndex, setCascadeDroppedIndex] = useState<number>(0);
    const [cascadeTargetItem, setCascadeTargetItem] = useState<Appointment | null>(null);

    const fetchAppointments = async () => {
        CustomLogger.info('Carregando grade de agendamentos ativa do banco...');
        try {
            const response = await api.get<Appointment[]>('/appointments');
            const sorted = response.data.sort((a, b) => a.position - b.position);
            setAppointments(sorted);
        } catch (error) {
            CustomLogger.error('Falha na sincronização de dados com o SQLite', error);
        } finally {
            setLoading(false);
        }
    };

    const {
        activeItem: selectedAppointment,
        setActiveItem: setSelectedAppointment,
        confirmModalOpen,
        setConfirmModalOpen,
        editModalOpen,
        setEditModalOpen,
        viewModalOpen,
        setViewModalOpen,
        actions
    } = useGridGestures<Appointment>({
        endpoint: '/appointments',
        currentList: appointments,
        setListState: setAppointments,
        onRefresh: fetchAppointments
    });

    const handleCreateAppointment = async (payload: any) => {
        CustomLogger.info('Enviando payload do assistente (Wizard) para criação de registro');
        try {
            const response = await api.post<Appointment>('/appointments', payload);
            setAppointments((prev) => [...prev, response.data]);
            CustomLogger.info(`Agendamento criado com sucesso absoluto. ID: ${response.data.id}`);
        } catch (error) {
            CustomLogger.error('Falha ao instanciar novo agendamento no servidor', error);
        }
    };

    const handleUpdateAppointment = async (id: string, updatedData: any) => {
        CustomLogger.info(`Disparando atualização cadastral (Axios PUT) para o ID: ${id}`);
        try {
            const response = await api.put<Appointment>(`/appointments/${id}`, updatedData);
            setAppointments((prev) => prev.map((item) => (item.id === id ? response.data : item)));
            setEditModalOpen(false);
            setSelectedAppointment(null);
            await fetchAppointments();
            CustomLogger.info(`Mudaça consolidada com sucesso no ID: ${id}`);
        } catch (error) {
            CustomLogger.error(`Erro crítico ao atualizar parâmetros do agendamento ${id}`, error);
        }
    };

    const handleDragEnd = async (result: any) => {
        const { destination, source, draggableId } = result;
        if (!destination || destination.index === source.index) return;

        CustomLogger.info(`Movimentação tátil detectada. Item ${draggableId} movido da vaga ${source.index} para ${destination.index}`);
        const targetItem = appointments.find(a => a.id === draggableId) || null;
        setCascadeTargetItem(targetItem);
        setCascadeDroppedIndex(destination.index);
        setCascadeModalOpen(true);
    };

    const handleExecuteCascadeReschedule = async (selectedIds: string[], offsetValue: number, unit: string) => {
        CustomLogger.info(`Acionando motor temporal em cascata para ${selectedIds.length} cards afetados`);
        try {
            setLoading(true);
            setAppointments(prev => prev.map(item =>
                selectedIds.includes(item.id) || item.id === cascadeTargetItem?.id
                    ? { ...item, subStatus: 'REAGENDADO' }
                    : item
            ));

            await api.patch('/appointments/cascade-reschedule', {
                appointmentIds: selectedIds,
                offsetValue,
                unit,
                newPosition: cascadeTargetIndex,
                targetId: cascadeTargetItem?.id,
                actionType: 'POSTERIOR'
            });

            setCascadeModalOpen(false);
            setCascadeTargetItem(null);
            await fetchAppointments();
            CustomLogger.info('Reajuste temporal em bloco finalizado com sucesso.');
        } catch (error) {
            CustomLogger.error('Erro no processamento da transação em cascata no backend', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        appointments,
        loading,
        fetchAppointments,
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
        actions,
        handleCreateAppointment,
        handleUpdateAppointment,
        handleDragEnd,
        handleExecuteCascadeReschedule
    };
}
