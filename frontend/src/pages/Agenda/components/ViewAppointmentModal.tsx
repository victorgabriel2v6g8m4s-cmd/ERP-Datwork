import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Clock, FileText, Image as ImageIcon, DollarSign, ArrowUpRight, ArrowDownRight, UserCheck, ShieldAlert, PhoneCall, MapPin } from 'lucide-react';
import { type Appointment, type FinancialItem, type MediaItem } from '../../../types/appointment.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';
import { MediaManager } from '../../../components/MediaManager.tsx';
import { CustomerDetailsCard } from '../../../components/CustomerDetailsCard.tsx';
import { FinancialViewer } from '../../../components/FinancialViewer.tsx';
import { SUB_STATUS_CATALOG } from '../utils/SubStatusCatalog.ts';

interface ViewAppointmentModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

export function ViewAppointmentModal({ isOpen, appointment, onClose }: ViewAppointmentModalProps) {
  const [activeMedia, setActiveMídia] = useState<MediaItem | null>(null);

  // Parses estruturados e seguros do banco SQLite
  const description = appointment?.description || '';
  const medias: MediaItem[] = appointment?.medias ? JSON.parse(appointment.medias) : [];
  const financials: FinancialItem[] = appointment?.financials ? JSON.parse(appointment.financials) : [];

  // Formatação de data da auditoria
  const formattedDate = appointment
    ? new Date(appointment.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <AnimatePresence>
      {isOpen && appointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto font-sans">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-6 my-8 max-h-[85vh] overflow-y-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <FileText className="w-5 h-5" />
                <h3 className="text-lg font-black text-slate-800">Resumo do Agendamento</h3>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Painel de Título, Data e Horário */}
            <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Agendamento</span>
                <span className="font-black text-slate-800 text-base">{appointment.title}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600 border-t border-slate-100/70 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Horário: {appointment.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Data: {formattedDate}</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl space-y-2 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Sub-status Operacional</span>
                <div className="flex items-center gap-2">
                  {/* Indicador visual da bolinha */}
                  <span className={`w-2.5 h-2.5 rounded-full inline-block shrink-0 ${SUB_STATUS_CATALOG[appointment.subStatus]?.colorClass || 'bg-slate-400'}`} />
                  {/* Descrição legível em destaque corporativo */}
                  <span className="font-black text-slate-800 text-xs sm:text-sm">
                    {SUB_STATUS_CATALOG[appointment.subStatus]?.label || appointment.subStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* 🧩 DADOS CADASTRAIS REORGANIZADOS (CLEAN CODE) */}
            <CustomerDetailsCard appointment={appointment} />


            {/* Campo Observações da Tarefa */}
            {description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Observações da Tarefa</h4>
                <p className="text-sm text-slate-600 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 whitespace-pre-line leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Mídias Anexadas */}
            {medias.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Mídias e Anexos ({medias.length})</h4>
                <div className="[&_label]:hidden">
                  <MediaManager
                    medias={medias}
                    onChangeMedias={() => { }}
                    onOpenLightbox={(media) => setActiveMídia(media)}
                  />
                </div>
              </div>
            )}


            {/* Fluxo Financeiro Detalhado */}
            <FinancialViewer financials={financials} />

            {/* Footer */}
            <div className="flex border-t border-slate-100 pt-4 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Fechar Painel
              </button>
            </div>
          </motion.div>
          <MediaLightbox
            isOpen={activeMedia !== null}
            medias={medias}
            activeMedia={activeMedia}
            onClose={() => setActiveMídia(null)}
            onSelectMedia={(media) => setActiveMídia(media)}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

