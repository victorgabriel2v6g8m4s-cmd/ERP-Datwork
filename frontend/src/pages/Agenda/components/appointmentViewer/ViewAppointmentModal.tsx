import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, UserCheck } from 'lucide-react';
import { type Appointment, type MediaItem } from '../../../../types/appointment.ts';
import { MediaLightbox } from '../../../../components/MediaLightbox.tsx';
import { CustomerDetailsCard } from '../../../../components/CustomerDetailsCard.tsx';
import { FinancialViewer } from '../../../../components/FinancialViewer.tsx';
import { SUB_STATUS_CATALOG } from '../../utils/SubStatusCatalog.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';

// ✨ Importação das Engrenagens Universais do Design System
import { UniversalViewerLayout } from '../../../../components/UniversalViewerLayout.tsx';
import { useAppointmentViewer } from '../../hooks/useAppointmentViewer.ts';

interface ViewAppointmentModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

export function ViewAppointmentModal(props: ViewAppointmentModalProps) {
  const { isOpen, appointment, onClose } = props;
  const viewer = useAppointmentViewer(props);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  if (!isOpen || !appointment) return null;

  const catalogItem = SUB_STATUS_CATALOG[appointment.subStatus as keyof typeof SUB_STATUS_CATALOG];

  return (
    <>
      <AnimatePresence>
        <div className={ERP_THEME.modal.overlay}>
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>

            {/* 🪐 INSTANCIAÇÃO DO TEMPLATE MESTRE CORPORATIVO */}
            <UniversalViewerLayout
              title={appointment.title}
              thumbnail={(appointment as any).thumbnail || null} // Preparado caso a agenda ganhe capa
              createdAt={appointment.createdAt}
              medias={viewer.medias}
              onOpenLightbox={(media) => setActiveMedia(media)}
              onClose={onClose}
              // Como a Agenda não usa o UniversalVersionTimeline lateral por padrão (usa modais de histórico separados),
              // deixamos o espaço lateral livre ou preparado para futuras auditorias
              timelineComponent={null}
            >
              {/* 🧱 FILHOS ESPECÍFICOS DA AGENDA: Injetados de forma limpa como children */}
              <div className="space-y-4 font-sans">

                {/* Cartão de Timing e Sub-Status Operacional */}
                <div className="bg-slate-50/60 border border-slate-100/80 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>Horário: {appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      <span>Data: {viewer.formattedDate}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/60 p-3 rounded-xl space-y-1.5 text-left">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Sub-status Operacional</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${catalogItem?.colorClass || 'bg-slate-400'}`} />
                      <span className="font-black text-slate-800 text-xs sm:text-sm">
                        {catalogItem?.label || appointment.subStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dados Cadastrais Sanitizados do Cliente */}
                <CustomerDetailsCard appointment={appointment} />

                {/* Campo Dinâmico de Observações */}
                {viewer.description && (
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Observações da Tarefa</h4>
                    <p className="text-sm text-slate-600 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl whitespace-pre-line leading-relaxed">
                      {viewer.description}
                    </p>
                  </div>
                )}

                {/* Fluxo de Transações Financeiras Detalhado */}
                <FinancialViewer financials={viewer.financials} />
              </div>
            </UniversalViewerLayout>

          </motion.div>
        </div>
      </AnimatePresence>

      {/* Lightbox central universal de mídias */}
      <MediaLightbox
        isOpen={activeMedia !== null}
        medias={viewer.medias}
        activeMedia={activeMedia}
        onClose={() => setActiveMedia(null)}
        onSelectMedia={(media) => setActiveMedia(media)}
      />
    </>
  );
}
