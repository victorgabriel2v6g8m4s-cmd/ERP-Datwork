import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, GripVertical } from 'lucide-react';
import { UniversalSubStatusSelect } from '../../../../components/index.ts';
import { TEXTS } from '../../../../i18n/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';
import type { Appointment, AppointmentSubStatus } from '../../../../types/appointment.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';
import { formatCurrencyBRL } from '../../../../utils/format.ts';
import { useAppointmentCard } from '../../hooks/useAppointmentCard.ts';
import { AppointmentCardSwipeBg } from './AppointmentCardSwipeBg.tsx';

interface AppointmentCardProps {
  appointment: Appointment;
  index: number;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (appointment: Appointment) => void;
  onLongPress: (appointment: Appointment) => void;
  onClick: (appointment: Appointment) => void;
  onUpdateSubStatus: (id: string, nextSub: AppointmentSubStatus) => void;
}

export function AppointmentCard(props: AppointmentCardProps) {
  const card = useAppointmentCard(props);
  const { appointment, index } = props;
  const statusTheme = appointment.status === 'COMPLETED'
    ? ERP_THEME.card.success
    : appointment.status === 'CANCELED' ? ERP_THEME.card.danger : ERP_THEME.card.white;

  return (
    <Draggable draggableId={appointment.id} index={index}>
      {(provided, snapshot) => (
        <div
          data-ui-key={UI_KEYS.agenda.card}
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={ERP_THEME.agenda.card.wrapper}
          style={{ ...provided.draggableProps.style }}
        >
          <AppointmentCardSwipeBg opacityRight={card.opacityRight} opacityLeft={card.opacityLeft} />

          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.5, right: 0.5 }}
            {...card.longPressEvents}
            onDragEnd={card.handleDragEnd}
            onPointerDown={() => card.setIsPressing(true)}
            onPointerUp={() => card.setIsPressing(false)}
            onPointerLeave={() => card.setIsPressing(false)}
            style={{ x: card.x, backgroundColor: card.backgroundColor }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`${ERP_THEME.card.base} ${statusTheme} ${snapshot.isDragging ? ERP_THEME.agenda.card.dragging : ''} ${card.isPressing ? ERP_THEME.agenda.card.pressing : ''}`}
          >
            <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
              <div
                {...provided.dragHandleProps}
                className={ERP_THEME.agenda.card.dragHandle}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 data-ui-key={UI_KEYS.agenda.cardTitle} className="font-bold text-slate-800 text-base truncate">{appointment.title}</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                  <div className="flex items-center gap-1 shrink-0"><Clock className="w-3.5 h-3.5 text-indigo-500/70" /><span>{appointment.time}</span></div>
                  <div className="flex items-center gap-1 shrink-0"><CalendarDays className="w-3.5 h-3.5 text-slate-400" /><span>{card.formattedDate}</span></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 shrink-0 pl-2">
              {card.financials.length > 0 && (
                <span
                  data-ui-key={UI_KEYS.agenda.cardBalance}
                  className={`${ERP_THEME.agenda.card.balance} ${card.balance >= 0 ? ERP_THEME.agenda.card.balancePositive : ERP_THEME.agenda.card.balanceNegative}`}
                >
                  {formatCurrencyBRL(card.balance)}
                </span>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span data-ui-key={UI_KEYS.agenda.cardStatus} className={`${ERP_THEME.badge.base} ${ERP_THEME.badge[appointment.status]}`}>
                  {TEXTS.agenda.status[appointment.status]}
                </span>
                <UniversalSubStatusSelect
                  value={appointment.subStatus}
                  onChange={(nextSub) => props.onUpdateSubStatus(appointment.id, nextSub)}
                  variant="compact"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
