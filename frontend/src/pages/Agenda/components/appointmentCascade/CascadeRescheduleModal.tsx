import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarClock, X } from 'lucide-react';
import { TEXTS } from '../../../../i18n/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';
import type { Appointment } from '../../../../types/appointment.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';
import { useCascadeReschedule } from '../../hooks/useCascadeReschedule.ts';
import type { AgendaCascadeDirection, AgendaTimeUnit } from '../../types/agenda.types.ts';
import { CascadeTimeConfig } from './CascadeTimeConfig.tsx';

interface CascadeRescheduleModalProps {
  isOpen: boolean;
  targetAppointment: Appointment | null;
  droppedIndex: number;
  fullList: Appointment[];
  onClose: () => void;
  onExecuteCascade: (ids: string[], value: number, unit: AgendaTimeUnit, direction: AgendaCascadeDirection) => Promise<void>;
}

export function CascadeRescheduleModal(props: CascadeRescheduleModalProps) {
  const cascade = useCascadeReschedule({
    isOpen: props.isOpen,
    targetAppointment: props.targetAppointment,
    droppedIndex: props.droppedIndex,
    fullList: props.fullList
  });

  if (!props.targetAppointment) return null;

  return (
    <AnimatePresence>
      {props.isOpen && (
        <div data-ui-key={UI_KEYS.agenda.cascadeModal} className={ERP_THEME.modal.overlay}>
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className={ERP_THEME.agenda.cascade.container}>
            <div className={ERP_THEME.agenda.cascade.header}>
              <div>
                <h3 className="font-black text-sm flex items-center gap-1.5"><CalendarClock className="w-4 h-4 text-indigo-300" />{TEXTS.agenda.cascade.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{TEXTS.agenda.cascade.movedPosition(props.droppedIndex + 1)}</p>
              </div>
              <button type="button" onClick={props.onClose} className="text-slate-400 hover:text-white cursor-pointer" aria-label={TEXTS.common.actions.close}><X className="w-4 h-4" /></button>
            </div>

            <div className={ERP_THEME.agenda.cascade.tabs}>
              {(['POSTERIOR', 'ANTERIOR'] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  onClick={() => cascade.setActionType(direction)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 cursor-pointer ${cascade.actionType === direction ? ERP_THEME.agenda.cascade.tabActive : ERP_THEME.agenda.cascade.tabInactive}`}
                >
                  {direction === 'POSTERIOR' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                  {direction === 'POSTERIOR' ? TEXTS.agenda.cascade.postponeTab : TEXTS.agenda.cascade.advanceTab}
                </button>
              ))}
            </div>

            <div className={ERP_THEME.agenda.cascade.content}>
              <CascadeTimeConfig offsetValue={cascade.offsetValue} setOffsetValue={cascade.setOffsetValue} timeUnit={cascade.timeUnit} setTimeUnit={cascade.setTimeUnit} />
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{TEXTS.agenda.cascade.intervalHint}</p>
                {cascade.candidates.length === 0 ? (
                  <p className="text-xs text-slate-400 py-5 text-center">{TEXTS.agenda.cascade.empty}</p>
                ) : cascade.candidates.map((appointment) => {
                  const selected = cascade.selectedIds.includes(appointment.id);
                  return (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => cascade.toggleAppointment(appointment.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${selected ? 'bg-indigo-50 border-indigo-300 text-indigo-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="min-w-0">
                        <p className="font-black text-xs truncate">{appointment.title}</p>
                        <p className="text-[9px] opacity-70">{TEXTS.agenda.cascade.originalTime(appointment.time)}</p>
                      </div>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center text-[9px] ${selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>{selected ? '✓' : ''}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={ERP_THEME.agenda.cascade.footer}>
              <button type="button" onClick={props.onClose} className={ERP_THEME.modal.btnCancel}>{TEXTS.agenda.cascade.keep}</button>
              <button
                data-ui-key={UI_KEYS.agenda.cascadeSubmit}
                type="button"
                disabled={!cascade.canSubmit}
                onClick={() => void props.onExecuteCascade(cascade.selectedIds, cascade.offsetValue, cascade.timeUnit, cascade.actionType)}
                className={ERP_THEME.modal.btnConfirm}
              >
                {TEXTS.agenda.cascade.submit(cascade.selectedIds.length)}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
