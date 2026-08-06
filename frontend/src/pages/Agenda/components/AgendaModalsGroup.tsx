import { CancelAppointmentDialog } from './CancelAppointmentDialog.tsx';
import { EditAppointmentModal } from './appointmentEditor/EditAppointmentModal.tsx';
import { ViewAppointmentModal } from './appointmentViewer/ViewAppointmentModal.tsx';
import { CascadeRescheduleModal } from './appointmentCascade/CascadeRescheduleModal.tsx';
import { type Appointment } from '../../../types/appointment.ts';

interface AgendaModalsGroupProps {
    confirmModalOpen: boolean;
    editModalOpen: boolean;
    viewModalOpen: boolean;
    cascadeModalOpen: boolean;
    selectedAppointment: Appointment | null;
    cascadeTargetItem: Appointment | null;
    cascadeTargetIndex: number;
    appointments: Appointment[];
    setConfirmModalOpen: (open: boolean) => void;
    setEditModalOpen: (open: boolean) => void;
    setViewModalOpen: (open: boolean) => void;
    setCascadeModalOpen: (open: boolean) => void;
    setSelectedAppointment: (item: Appointment | null) => void;
    setCascadeTargetItem: (item: Appointment | null) => void;
    handleUpdateAppointment: (id: string, data: any) => Promise<void>;
    handleExecuteCascadeReschedule: (ids: string[], val: number, unit: string) => Promise<void>;
}

export function AgendaModalsGroup({
    confirmModalOpen, editModalOpen, viewModalOpen, cascadeModalOpen,
    selectedAppointment, cascadeTargetItem, cascadeTargetIndex, appointments,
    setConfirmModalOpen, setEditModalOpen, setViewModalOpen, setCascadeModalOpen,
    setSelectedAppointment, setCascadeTargetItem, handleUpdateAppointment, handleExecuteCascadeReschedule,
    actions
}: AgendaModalsGroupProps & { actions: any }) {
    return (
        <>
            <CancelAppointmentDialog
                isOpen={confirmModalOpen}
                onClose={() => { setConfirmModalOpen(false); setSelectedAppointment(null); }}
                onConfirm={() => actions.executeConfirmDelete('CANCELED')}
            />

            <EditAppointmentModal
                isOpen={editModalOpen}
                appointment={selectedAppointment}
                onClose={() => { setEditModalOpen(false); setSelectedAppointment(null); }}
                onSave={handleUpdateAppointment}
            />

            <ViewAppointmentModal
                isOpen={viewModalOpen}
                appointment={selectedAppointment}
                onClose={() => { setViewModalOpen(false); setSelectedAppointment(null); }}
            />

            <CascadeRescheduleModal
                isOpen={cascadeModalOpen}
                targetAppointment={cascadeTargetItem}
                droppedIndex={cascadeTargetIndex}
                fullList={appointments}
                onClose={() => { setCascadeModalOpen(false); setCascadeTargetItem(null); }}
                onExecuteCascade={(ids, val, unit) => handleExecuteCascadeReschedule(ids, val, unit)}
            />
        </>
    );
}
