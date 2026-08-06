import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { AppointmentCard } from './AppointmentCard.tsx';
import { AppointmentListEmpty } from './AppointmentListEmpty.tsx'; // ✨ Importado
import { type Appointment } from '../../../../types/appointment.ts';

interface AppointmentListProps {
  appointments: Appointment[];
  onDragEnd: (result: any) => void;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (appointment: Appointment) => void;
  onLongPress: (appointment: Appointment) => void;
  onClick: (appointment: Appointment) => void;
  onUpdateSubStatus: (id: string, nextSub: string) => void;
}

export function AppointmentList({
  appointments,
  onDragEnd,
  onSwipeRight,
  onSwipeLeft,
  onLongPress,
  onClick,
  onUpdateSubStatus
}: AppointmentListProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="appointments-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            /* ✨ CORREÇÃO CRÍTICA: Removido o px-6 duplicado para liberar largura útil ao gesto de Swipe */
            className="w-full mx-auto min-h-[220px] pb-4 space-y-1"
          >
            {appointments.length === 0 ? (
              <AppointmentListEmpty />
            ) : (
              appointments.map((item, index) => (
                <AppointmentCard
                  key={item.id}
                  appointment={item}
                  index={index}
                  onSwipeRight={onSwipeRight}
                  onSwipeLeft={onSwipeLeft}
                  onLongPress={onLongPress}
                  onClick={onClick}
                  onUpdateSubStatus={onUpdateSubStatus}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
