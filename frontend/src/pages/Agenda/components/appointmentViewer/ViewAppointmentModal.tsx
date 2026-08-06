import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import { type Appointment, type MediaItem } from '../../../../types/appointment.ts';
import { MediaLightbox } from '../MediaLightbox.tsx';
import { MediaManager } from '../../../../components/MediaManager.tsx';
import { CustomerDetailsCard } from '../../../../components/CustomerDetailsCard.tsx';
import { FinancialViewer } from '../../../../components/FinancialViewer.tsx';
import { ERP_THEME } from '../../../../theme/presets.ts';

// 🧠 Sub-Módulos e Hooks Importados
import { useAppointmentViewer } from '../../hooks/useAppointmentViewer.ts';
import { ViewerHeaderCard } from './ViewerHeaderCard.tsx';

interface ViewAppointmentModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

export function ViewAppointmentModal(props: ViewAppointmentModalProps) {
  const { isOpen, appointment, onClose } = props;
  const viewer = useAppointmentViewer(props);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  return (
    <>
      <AnimatePresence>
        {isOpen && appointment && (
          <div className={ERP_THEME.modal.overlay + ' overflow-y-auto'}>
            <motion.div
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-6 my-8 max-h-[85vh] overflow-y-auto space-y-6"
            >
              {/* Header do Resumo */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <FileText className="w-5 h-5" />
                  <h3 className="text-lg font-black text-slate-800">Resumo do Agendamento</h3>
                </div>
                <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 🧩 BLOCO 1: PAINEL DE INFORMAÇÕES TIMING */}
              <ViewerHeaderCard appointment={appointment} formattedDate={viewer.formattedDate} />

              {/* 🧩 BLOCO 2: DADOS CADASTRAIS */}
              <CustomerDetailsCard appointment={appointment} />

              {/* Campo Observações da Tarefa */}
              {viewer.description && (
                <div className="space-y-1.5 font-sans">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Observações da Tarefa</h4>
                  <p className="text-sm text-slate-600 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl whitespace-pre-line leading-relaxed">
                    {viewer.description}
                  </p>
                </div>
              )}

              {/* 🧩 BLOCO 3: MÍDIAS E ANEXOS */}
              {viewer.medias.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Mídias e Anexos ({viewer.medias.length})</h4>
                  <div className="[&_label]:hidden">
                    <MediaManager medias={viewer.medias} onChangeMedias={() => { }} onOpenLightbox={(media) => setActiveMedia(media)} />
                  </div>
                </div>
              )}

              {/* 🧩 BLOCO 4: FLUXO FINANCEIRO DETALHADO */}
              <FinancialViewer financials={viewer.financials} />

              {/* Footer */}
              <div className="flex border-t border-slate-100 pt-4 justify-end">
                <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                  Fechar Painel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✨ REAPROVEITAMENTO UNIVERSAL: Consome o mesmo Lightbox reutilizado por todo o ERP */}
      <MediaLightbox media={activeMedia} onClose={() => setActiveMedia(null)} />
    </>
  );
}
