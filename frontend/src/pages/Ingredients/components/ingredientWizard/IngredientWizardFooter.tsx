import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { TEXTS } from '../../../../i18n/index.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';

interface IngredientWizardFooterProps {
  step: number;
  identificationReady: boolean;
  isSubmitting: boolean;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  handleReset: () => void;
  handleSubmit: () => Promise<void>;
}

export function IngredientWizardFooter({
  step,
  identificationReady,
  isSubmitting,
  handlePrevStep,
  handleNextStep,
  handleReset,
  handleSubmit
}: IngredientWizardFooterProps) {
  return (
    <div className="flex gap-2 border-t border-slate-100 pt-4 text-xs font-bold font-sans">
      {step > 1 ? (
        <button type="button" onClick={handlePrevStep} disabled={isSubmitting} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50">
          <ArrowLeft className="w-3.5 h-3.5" /> <span>{TEXTS.common.actions.back}</span>
        </button>
      ) : (
        <button type="button" onClick={handleReset} disabled={isSubmitting} className="px-4 py-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
          {TEXTS.common.actions.cancel}
        </button>
      )}

      {step < 3 ? (
        <button
          type="button"
          onClick={handleNextStep}
          disabled={isSubmitting || (step === 1 && !identificationReady)}
          className={`px-5 py-2.5 font-bold rounded-xl transition-all flex items-center gap-1 ml-auto ${step === 1 && !identificationReady ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 cursor-pointer'}`}
        >
          <span>{TEXTS.ingredients.wizard.next}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors flex items-center gap-1 shadow-md shadow-emerald-100 cursor-pointer ml-auto disabled:opacity-50"
          data-ui-key={UI_KEYS.ingredients.formSubmit}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{isSubmitting ? TEXTS.common.status.saving : TEXTS.ingredients.wizard.finish}</span>
        </button>
      )}
    </div>
  );
}
