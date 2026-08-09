import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { MediaLightbox } from '../../../../components/MediaLightbox.tsx';
import { TEXTS } from '../../../../i18n/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';
import type { MediaItem } from '../../../../types/appointment.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';
import { useAppointmentWizard } from '../../hooks/useAppointmentWizard.ts';
import type { AppointmentMutationPayload } from '../../types/agenda.types.ts';
import { WizardFooterNav } from './WizardFooterNav.tsx';
import { WizardStep1 } from './WizardStep1.tsx';
import { WizardStep2 } from './WizardStep2.tsx';
import { WizardStep3 } from './WizardStep3.tsx';
import { WizardStep4 } from './WizardStep4.tsx';

interface AppointmentModalProps {
  onSave: (payload: AppointmentMutationPayload) => Promise<void>;
}

export function AppointmentModal({ onSave }: AppointmentModalProps) {
  const wizard = useAppointmentWizard({ onSave });
  const [activeLightboxMedia, setActiveLightboxMedia] = useState<MediaItem | null>(null);

  return (
    <>
      <button
        data-ui-key={UI_KEYS.agenda.createAction}
        type="button"
        onClick={() => wizard.setIsOpen(true)}
        className={ERP_THEME.agenda.wizard.createButton}
        title={TEXTS.agenda.wizard.title}
      >
        <Plus className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {wizard.isOpen && (
          <div data-ui-key={UI_KEYS.agenda.createModal} className={ERP_THEME.modal.overlay}>
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className={ERP_THEME.agenda.wizard.container}
            >
              <div className={ERP_THEME.agenda.wizard.header}>
                <div className="flex items-center gap-2">
                  <div data-ui-key={UI_KEYS.agenda.wizardStep} className={ERP_THEME.agenda.wizard.stepBadge}>{wizard.step}/4</div>
                  <div>
                    <h3 data-ui-key={UI_KEYS.agenda.wizardTitle} className="text-base font-black text-slate-800">{TEXTS.agenda.wizard.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {TEXTS.agenda.wizard.stepLabels[wizard.step - 1]}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={wizard.handleResetModal} className="text-slate-400 hover:text-slate-600 cursor-pointer" aria-label={TEXTS.common.actions.close}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 mb-6">
                {wizard.step === 1 && <WizardStep1 title={wizard.title} setTitle={wizard.setTitle} date={wizard.date} setDate={wizard.setDate} time={wizard.time} setTime={wizard.setTime} description={wizard.description} setDescription={wizard.setDescription} />}
                {wizard.step === 2 && <WizardStep2 wizard={wizard} />}
                {wizard.step === 3 && <WizardStep3 medias={wizard.medias} setMedias={wizard.setMedias} setActiveLightboxMedia={setActiveLightboxMedia} />}
                {wizard.step === 4 && <WizardStep4 financials={wizard.financials} setFinancials={wizard.setFinancials} />}
              </div>

              <WizardFooterNav
                step={wizard.step}
                setStep={wizard.setStep}
                title={wizard.title}
                time={wizard.time}
                date={wizard.date}
                firstName={wizard.firstName}
                phone={wizard.phone}
                cep={wizard.cep}
                mediasLength={wizard.medias.length}
                handleResetModal={wizard.handleResetModal}
                handleFinalSubmit={wizard.handleFinalSubmit}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MediaLightbox
        isOpen={activeLightboxMedia !== null}
        medias={wizard.medias}
        activeMedia={activeLightboxMedia}
        onClose={() => setActiveLightboxMedia(null)}
        onSelectMedia={setActiveLightboxMedia}
      />
    </>
  );
}
