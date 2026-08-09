import { Check, ChevronRight } from 'lucide-react';
import { TEXTS } from '../../../../i18n/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';

interface WizardFooterNavProps {
  step: number;
  setStep: (step: number) => void;
  title: string;
  time: string;
  date: string;
  firstName: string;
  phone: string;
  cep: string;
  mediasLength: number;
  handleResetModal: () => void;
  handleFinalSubmit: () => Promise<void>;
}

export function WizardFooterNav(props: WizardFooterNavProps) {
  const customerStepEmpty = !props.firstName && !props.phone && !props.cep;

  return (
    <div className={ERP_THEME.agenda.wizard.footer}>
      <button type="button" onClick={props.handleResetModal} className={ERP_THEME.modal.btnCancel}>{TEXTS.common.actions.cancel}</button>

      {props.step === 1 && (
        <button type="button" disabled={!props.title.trim() || !props.time || !props.date} onClick={() => props.setStep(2)} className={ERP_THEME.agenda.wizard.nextButton}>
          <span>{TEXTS.agenda.wizard.next}</span><ChevronRight className="w-4 h-4" />
        </button>
      )}
      {props.step === 2 && (
        <button type="button" onClick={() => props.setStep(3)} className={ERP_THEME.agenda.wizard.nextButton}>
          <span>{customerStepEmpty ? TEXTS.agenda.wizard.skip : TEXTS.agenda.wizard.advance}</span><ChevronRight className="w-4 h-4" />
        </button>
      )}
      {props.step === 3 && (
        <button type="button" onClick={() => props.setStep(4)} className={ERP_THEME.agenda.wizard.nextButton}>
          <span>{props.mediasLength === 0 ? TEXTS.agenda.wizard.skip : TEXTS.agenda.wizard.advance}</span><ChevronRight className="w-4 h-4" />
        </button>
      )}
      {props.step === 4 && (
        <button type="button" onClick={() => void props.handleFinalSubmit()} className={ERP_THEME.agenda.wizard.finishButton}>
          <Check className="w-4 h-4" /><span>{TEXTS.agenda.wizard.finish}</span>
        </button>
      )}
    </div>
  );
}
