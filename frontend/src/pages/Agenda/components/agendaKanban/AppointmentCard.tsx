import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { GripVertical, Clock, CalendarDays } from 'lucide-react';
import { type Appointment } from '../../../../types/appointment.ts';
import { formatCurrencyBRL } from '../../../../utils/format.ts';
import { UniversalSubStatusSelect } from '../../../../components/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';
import { useAppointmentCard } from '../../hooks/useAppointmentCard.ts'; // ✨ Hook isolado
import { AppointmentCardSwipeBg } from './AppointmentCardSwipeBg.tsx'; // ✨ Background isolado

interface AppointmentCardProps {
  appointment: Appointment;
  index: number;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (appointment: Appointment) => void;
  onLongPress: (appointment: Appointment) => void;
  onClick: (appointment: Appointment) => void;
  onUpdateSubStatus: (id: string, nextSub: string) => void;
}

const STATUS_TEXT_LABELS: Record<string, string> = { COMPLETED: 'Realizado', CANCELED: 'Cancelado', PENDING: 'Agendado' };

export function AppointmentCard(props: AppointmentCardProps) {
  const card = useAppointmentCard(props);
  const { appointment, index, onUpdateSubStatus } = props;

  const getThemeClass = () => {
    if (appointment.status === 'COMPLETED') return ERP_THEME.card.success;
    if (appointment.status === 'CANCELED') return ERP_THEME.card.danger;
    return ERP_THEME.card.white;
  };

  return (
    <Draggable draggableId={appointment.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="relative mb-3 group" style={{ ...provided.draggableProps.style }}>

          <AppointmentCardSwipeBg opacityRight={card.opacityRight} opacityLeft={card.opacityLeft} />

          <motion.div
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0.5, right: 0.5 }}
            {...card.longPressEvents} onDragEnd={card.handleDragEnd}
            onPointerDown={() => card.setIsPressing(true)} onPointerUp={() => card.setIsPressing(false)} onPointerLeave={() => card.setIsPressing(false)}
            style={{ x: card.x, backgroundColor: card.backgroundColor }} whileTap={{ scale: 0.94 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`${ERP_THEME.card.base} ${snapshot.isDragging ? 'shadow-md ring-2 ring-indigo-500/20' : ''} ${getThemeClass()} ${card.isPressing ? 'border-indigo-400 shadow-sm' : ''}`}
          >
            {card.isPressing && (
              <motion.div initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 7, opacity: 0 }} transition={{ duration: 0.8, ease: "linear" }} className="absolute left-1/2 top-1/2 w-24 h-24 bg-indigo-500/15 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
            )}

            <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
              <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 p-1 cursor-grab active:cursor-grabbing shrink-0" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-800 text-base truncate">{appointment.title}</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                  <div className="flex items-center gap-1 shrink-0"><Clock className="w-3.5 h-3.5 text-indigo-500/70" /><span>{appointment.time}</span></div>
                  <div className="flex items-center gap-1 shrink-0"><CalendarDays className="w-3.5 h-3.5 text-slate-400" /><span>{card.formattedDate}</span></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 shrink-0 pl-2">
              {card.financials.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-lg border font-black tracking-tight tabular-nums ${card.balance >= 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                  {formatCurrencyBRL(card.balance)}
                </span>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`${ERP_THEME.badge.base} ${ERP_THEME.badge[appointment.status as keyof typeof ERP_THEME.badge] || ERP_THEME.badge.PENDING}`}>{STATUS_TEXT_LABELS[appointment.status] || STATUS_TEXT_LABELS.PENDING}</span>
                <div className="relative flex items-center gap-1.5 group cursor-pointer" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
                  <UniversalSubStatusSelect value={appointment.subStatus} onChange={nextSub => onUpdateSubStatus(appointment.id, nextSub)} variant="compact" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
