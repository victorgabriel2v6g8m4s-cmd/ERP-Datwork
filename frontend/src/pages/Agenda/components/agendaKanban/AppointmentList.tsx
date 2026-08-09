import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import type { Appointment, AppointmentSubStatus } from '../../../../types/appointment.ts';
import { AppointmentCard } from './AppointmentCard.tsx';
import { AppointmentListEmpty } from './AppointmentListEmpty.tsx';

interface AppointmentListProps {
  appointments: Appointment[];
  onDragEnd: (result: DropResult) => void;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (appointment: Appointment) => void;
  onLongPress: (appointment: Appointment) => void;
  onClick: (appointment: Appointment) => void;
  onUpdateSubStatus: (id: string, nextSub: AppointmentSubStatus) => void;
}

export function AppointmentList(props: AppointmentListProps) {
  return (
    <DragDropContext onDragEnd={props.onDragEnd}>
      <Droppable droppableId="appointments-list">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="w-full mx-auto min-h-[220px] pb-4 space-y-1">
            {props.appointments.length === 0 ? <AppointmentListEmpty /> : props.appointments.map((item, index) => (
              <AppointmentCard
                key={item.id}
                appointment={item}
                index={index}
                onSwipeRight={props.onSwipeRight}
                onSwipeLeft={props.onSwipeLeft}
                onLongPress={props.onLongPress}
                onClick={props.onClick}
                onUpdateSubStatus={props.onUpdateSubStatus}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
