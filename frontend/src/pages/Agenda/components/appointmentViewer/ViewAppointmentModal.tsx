import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, UserCheck } from 'lucide-react';
import { CustomerDetailsCard } from '../../../../components/CustomerDetailsCard.tsx';
import { FinancialViewer } from '../../../../components/FinancialViewer.tsx';
import { MediaLightbox } from '../../../../components/MediaLightbox.tsx';
import { UniversalViewerLayout } from '../../../../components/UniversalViewerLayout.tsx';
import { TEXTS } from '../../../../i18n/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';
import type { Appointment, MediaItem } from '../../../../types/appointment.ts';
import { getAgendaSubStatusPresentation } from '../../../../ui/agendaSubStatus.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';
import { useAppointmentViewer } from '../../hooks/useAppointmentViewer.ts';

interface ViewAppointmentModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

export function ViewAppointmentModal(props: ViewAppointmentModalProps) {
  const viewer = useAppointmentViewer(props);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  if (!props.isOpen || !props.appointment) return null;

  const appointment = props.appointment;
  const subStatus = getAgendaSubStatusPresentation(appointment.subStatus);

  return (
    <>
      <AnimatePresence>
        <div data-ui-key={UI_KEYS.agenda.viewModal} className={ERP_THEME.modal.overlay}>
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
            <UniversalViewerLayout
              title={appointment.title}
              thumbnail={null}
              createdAt={appointment.createdAt}
              medias={viewer.medias}
              onOpenLightbox={setActiveMedia}
              onClose={props.onClose}
              timelineComponent={null}
            >
              <div className="space-y-4 font-sans">
                <div className="bg-slate-50/60 border border-slate-100/80 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-500" /><span>{TEXTS.agenda.view.timeLabel}: {appointment.time}</span></div>
                    <div className="flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-slate-400" /><span>{TEXTS.agenda.view.dateLabel}: {viewer.formattedDate}</span></div>
                  </div>
                  <div data-ui-key={UI_KEYS.agenda.viewSubStatus} className="bg-white border border-slate-200/60 p-3 rounded-xl space-y-1.5 text-left">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">{TEXTS.agenda.view.subStatusLabel}</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${subStatus.colorClass}`} />
                      <span className="font-black text-slate-800 text-xs sm:text-sm">{subStatus.label}</span>
                    </div>
                  </div>
                </div>

                <CustomerDetailsCard appointment={appointment} />

                {viewer.description && (
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{TEXTS.agenda.view.notesLabel}</h4>
                    <p className="text-sm text-slate-600 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl whitespace-pre-line leading-relaxed">{viewer.description}</p>
                  </div>
                )}

                <FinancialViewer financials={viewer.financials} />
              </div>
            </UniversalViewerLayout>
          </motion.div>
        </div>
      </AnimatePresence>

      <MediaLightbox isOpen={activeMedia !== null} medias={viewer.medias} activeMedia={activeMedia} onClose={() => setActiveMedia(null)} onSelectMedia={setActiveMedia} />
    </>
  );
}
