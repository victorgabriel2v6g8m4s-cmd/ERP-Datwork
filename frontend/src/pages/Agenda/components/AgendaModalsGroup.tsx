import { UniversalConfirmDialog } from '../../../components/UniversalConfirmModal.tsx';
import { TEXTS } from '../../../i18n/index.ts';
import type { Appointment } from '../../../types/appointment.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import type { AgendaCascadeDirection, AgendaTimeUnit, AppointmentMutationPayload } from '../types/agenda.types.ts';
import { CascadeRescheduleModal } from './appointmentCascade/CascadeRescheduleModal.tsx';
import { EditAppointmentModal } from './appointmentEditor/EditAppointmentModal.tsx';
import { ViewAppointmentModal } from './appointmentViewer/ViewAppointmentModal.tsx';

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
  handleUpdateAppointment: (id: string, data: AppointmentMutationPayload) => Promise<void>;
  handleExecuteCascadeReschedule: (ids: string[], value: number, unit: AgendaTimeUnit, direction: AgendaCascadeDirection) => Promise<void>;
  executeConfirmDelete: () => Promise<void>;
}

export function AgendaModalsGroup(props: AgendaModalsGroupProps) {
  const closeSelection = () => {
    props.setConfirmModalOpen(false);
    props.setSelectedAppointment(null);
  };

  return (
    <>
      <div data-ui-key={UI_KEYS.agenda.cancelDialog}>
        <UniversalConfirmDialog
          isOpen={props.confirmModalOpen}
          title={TEXTS.agenda.confirm.cancelTitle}
          description={TEXTS.agenda.confirm.cancelDescription}
          onClose={closeSelection}
          onConfirm={() => void props.executeConfirmDelete()}
        />
      </div>

      <EditAppointmentModal
        isOpen={props.editModalOpen}
        appointment={props.selectedAppointment}
        onClose={() => { props.setEditModalOpen(false); props.setSelectedAppointment(null); }}
        onSave={props.handleUpdateAppointment}
      />

      <ViewAppointmentModal
        isOpen={props.viewModalOpen}
        appointment={props.selectedAppointment}
        onClose={() => { props.setViewModalOpen(false); props.setSelectedAppointment(null); }}
      />

      <CascadeRescheduleModal
        isOpen={props.cascadeModalOpen}
        targetAppointment={props.cascadeTargetItem}
        droppedIndex={props.cascadeTargetIndex}
        fullList={props.appointments}
        onClose={() => { props.setCascadeModalOpen(false); props.setCascadeTargetItem(null); }}
        onExecuteCascade={props.handleExecuteCascadeReschedule}
      />
    </>
  );
}
