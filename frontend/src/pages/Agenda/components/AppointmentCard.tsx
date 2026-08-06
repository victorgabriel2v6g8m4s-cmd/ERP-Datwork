import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Draggable } from '@hello-pangea/dnd';
import { Check, Trash2, GripVertical, Clock, CalendarDays } from 'lucide-react';
import { type Appointment, type FinancialItem } from '../../../types/appointment.ts';
import { useLongPress } from '../../../hooks/useLongPress.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts'; // 
import { UniversalSubStatusSelect } from '../../../components/index.ts';

interface AppointmentCardProps {
  appointment: Appointment;
  index: number;
  onSwipeRight: (id: string) => void;
  onSwipeLeft: (appointment: Appointment) => void;
  onLongPress: (appointment: Appointment) => void;
  onClick: (appointment: Appointment) => void;
  onUpdateSubStatus: (id: string, nextSub: string) => void;
}

export function AppointmentCard({
  appointment,
  index,
  onSwipeRight,
  onSwipeLeft,
  onLongPress,
  onClick,
  onUpdateSubStatus
}: AppointmentCardProps) {
  const x = useMotionValue(0);
  const [isPressing, setIsPressing] = useState(false);

  const backgroundColor = useTransform(x, [-150, 0, 150], [
    '#ef4444',
    appointment.status === 'COMPLETED' ? '#f0fdf4' : appointment.status === 'CANCELED' ? '#fef2f2' : '#ffffff',
    '#22c55e'
  ]);

  const opacityRight = useTransform(x, [0, 100], [0, 1]); // Conforme arrasta para a direita (> 0), mostra o "Atendido"
  const opacityLeft = useTransform(x, [-100, 0], [1, 0]);  // Conforme arrasta para a esquerda (< 0), mostra o "Desmarcar"

  const longPressEvents = useLongPress({
    onLongPress: () => {
      // 🛡️ PROTEÇÃO ADICIONAL: Se houver qualquer deslocamento horizontal no momento do gatilho, bloqueia
      if (Math.abs(x.get()) > 5) {
        setIsPressing(false);
        return;
      }
      setIsPressing(false);
      onLongPress(appointment);
    },
    onClick: () => {
      // Proteção de clique para o Swipe-Clique
      if (Math.abs(x.get()) > 5) return;

      setTimeout(() => {
        onClick(appointment);
      }, 150);
    },
    delay: 800
  });

  x.on("change", (latestX) => {
    if (Math.abs(latestX) > 5 && isPressing) {
      setIsPressing(false); // Mata a onda translúcida e sinaliza interrupção do toque longo
    }
  });

  const handleDragEnd = (_: any, info: any) => {
    setIsPressing(false); // Garante o reset tátil ao soltar
    if (info.offset.x > 150) {
      onSwipeRight(appointment.id);
    } else if (info.offset.x < -150) {
      onSwipeLeft(appointment);
    }
    x.set(0);
  };

  const financials: FinancialItem[] = appointment.financials ? JSON.parse(appointment.financials) : [];
  const totalIncome = financials.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.value, 0);
  const totalExpense = financials.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.value, 0);
  const balance = totalIncome - totalExpense;

  const formattedDate = new Date(appointment.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <Draggable draggableId={appointment.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="relative mb-3 group"
          style={{ ...provided.draggableProps.style }}
        >
          {/* Camada Inferior: Swipe Icons */}
          <div className="absolute inset-0 rounded-2xl flex items-center justify-between px-6 overflow-hidden pointer-events-none">
            <motion.div style={{ opacity: opacityRight }} className="flex items-center gap-2 text-white font-semibold">
              <Check className="w-5 h-5" /> Realizado
            </motion.div>
            <motion.div style={{ opacity: opacityLeft }} className="flex items-center gap-2 text-white font-semibold">
              <Trash2 className="w-5 h-5" /> Desmarcar
            </motion.div>
          </div>

          {/* 📱 Card Interativo */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.5, right: 0.5 }}
            {...longPressEvents}
            onPointerDown={() => setIsPressing(true)}
            onPointerUp={() => setIsPressing(false)}
            onPointerLeave={() => setIsPressing(false)}
            style={{ x, backgroundColor }}
            onDragEnd={handleDragEnd}

            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}

            className={`flex items-center justify-between p-4 rounded-2xl shadow-sm border transition-all select-none touch-pan-y cursor-pointer relative overflow-hidden
              ${snapshot.isDragging ? 'shadow-md ring-2 ring-indigo-500/20' : 'hover:shadow-md'}
              ${appointment.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50/50 opacity-60 text-slate-500 line-through' : ''}
              ${appointment.status === 'CANCELED' ? 'border-red-200 bg-red-50/50 opacity-40 text-slate-400 line-through' : ''}
              ${appointment.status === 'PENDING' ? 'border-slate-100 bg-white text-slate-800' : ''}
              ${isPressing ? 'border-indigo-400 shadow-sm' : ''}
            `}
          >
            {/* Onda de Toque Longo */}
            {isPressing && (
              <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 7, opacity: 0 }}
                transition={{ duration: 0.8, ease: "linear" }}
                className="absolute left-1/2 top-1/2 w-24 h-24 bg-indigo-500/15 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"
              />
            )}

            <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
              <div
                {...provided.dragHandleProps}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-grab active:cursor-grabbing shrink-0"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-800 text-base truncate">{appointment.title}</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-indigo-500/70" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 shrink-0 pl-2">
              {financials.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-lg border font-black tracking-tight tabular-nums ${balance >= 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                  {/* ✨ Aplicando a formatação BRL Real padrão no card */}
                  {formatCurrencyBRL(balance)}
                </span>
              )}

              <div className="flex items-center gap-2 flex-wrap">

                {/* Badge do Status Principal (PENDING, COMPLETED, CANCELED) governado pelo Swipe */}
                <span className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-lg border ${appointment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                  appointment.status === 'CANCELED' ? 'bg-rose-50 text-rose-700 border-rose-150' :
                    'bg-indigo-50 text-indigo-700 border-indigo-150'
                  }`}>
                  {appointment.status === 'COMPLETED' ? 'Realizado' : appointment.status === 'CANCELED' ? 'Cancelado' : 'Agendado'}
                </span>

                {/* 🔮 INTERFACE DA BOLINHA DE SUB-STATUS INTERATIVA */}
                <div
                  className="relative flex items-center gap-1.5 group cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >

                  {/* 📐 GATILHO COMPACTO SELECT: Fica invisível por cima do elemento, abrindo o menu nativo do celular ao clicar */}
                  <UniversalSubStatusSelect
                    value={appointment.subStatus}
                    onChange={(nextSub) => onUpdateSubStatus(appointment.id, nextSub)}
                    variant="compact" // Puxa o layout invisível anti-vazamento com bolinha lateral
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
