import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { type MediaItem } from '../../../../types/appointment.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';
import { useAppointmentWizard } from '../../hooks/useAppointmentWizard.ts';
import { MediaLightbox } from '../MediaLightbox.tsx';

// ✨ Sub-Módulos Atômicos Importados
import { WizardStep1 } from './WizardStep1.tsx';
import { WizardStep2 } from './WizardStep2.tsx';
import { WizardStep3 } from './WizardStep3.tsx';
import { WizardStep4 } from './WizardStep4.tsx';
import { WizardFooterNav } from './WizardFooterNav.tsx';

interface AppointmentModalProps {
  onSave: (payload: any) => Promise<void>;
}

const STEP_LABELS = [
  'Etapa 1: Dados do Agendamento',
  'Etapa 2: Cadastro do Cliente',
  'Etapa 3: Anexar Mídias',
  'Etapa 4: Lançamento Financeiro'
];

export function AppointmentModal({ onSave }: AppointmentModalProps) {
  const wizard = useAppointmentWizard({ onSave });
  const [activeLightboxMedia, setActiveLightboxMedia] = useState<MediaItem | null>(null);

  return (
    <>
      <button
        onClick={() => wizard.setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans"
      >
        <Plus className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {wizard.isOpen && (
          <div className={ERP_THEME.modal.overlay}>
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col max-h-[90vh] overflow-y-auto"
            >
              {/* Header do Wizard */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black font-mono">
                    {wizard.step}/4
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Criar Novo Agendamento</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {STEP_LABELS[wizard.step - 1]}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={wizard.handleResetModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CONTEÚDO DINÂMICO CONTRATADO */}
              <div className="flex-1 space-y-4 mb-6">
                {wizard.step === 1 && <WizardStep1 title={wizard.title} setTitle={wizard.setTitle} date={wizard.date} setDate={wizard.setDate} time={wizard.time} setTime={wizard.setTime} description={wizard.description} setDescription={wizard.setDescription} />}
                {wizard.step === 2 && <WizardStep2 wizard={wizard} />}
                {wizard.step === 3 && <WizardStep3 medias={wizard.medias} setMedias={wizard.setMedias} setActiveLightboxMedia={setActiveLightboxMedia} />}
                {wizard.step === 4 && <WizardStep4 financials={wizard.financials} setFinancials={wizard.setFinancials} />}
              </div>

              {/* ESTEIRA DE NAVEGAÇÃO COMPACTA */}
              <WizardFooterNav
                step={wizard.step} setStep={wizard.setStep}
                title={wizard.title} time={wizard.time} date={wizard.date}
                firstName={wizard.firstName} phone={wizard.phone} cep={wizard.cep}
                mediasLength={wizard.medias.length}
                handleResetModal={wizard.handleResetModal}
                handleFinalSubmit={wizard.handleFinalSubmit}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MediaLightbox media={activeLightboxMedia} onClose={() => setActiveLightboxMedia(null)} />
    </>
  );
}
