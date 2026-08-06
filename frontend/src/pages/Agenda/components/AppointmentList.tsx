import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { AppointmentCard } from './AppointmentCard.tsx';
import { type Appointment } from '../../../types/appointment.ts';
import { Sparkles } from 'lucide-react';

interface AppointmentListProps {
  appointments: Appointment[];
  onDragEnd: (result: any) => void;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (appointment: Appointment) => void;
  onLongPress: (appointment: Appointment) => void; // ✨ Recebe o Toque Longo do App
  onClick: (appointment: Appointment) => void;     // ✨ Recebe o Clique Simples do App
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
            className="w-full px-6 mx-auto min-h-[200px]"
          >
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
                <p className="text-sm font-medium">Nenhum agendamento.</p>
              </div>
            ) : (
              appointments.map((item, index) => (
                <AppointmentCard
                  key={item.id}
                  appointment={item}
                  index={index}
                  onSwipeRight={onSwipeRight}
                  onSwipeLeft={onSwipeLeft} // Passa a função atualizada
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
