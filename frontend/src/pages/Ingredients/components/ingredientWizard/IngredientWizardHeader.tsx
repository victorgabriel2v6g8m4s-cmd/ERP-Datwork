import { FlaskConical, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { TEXTS } from '../../../../i18n/index.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';

interface IngredientWizardHeaderProps {
  step: number;
  progressPercent: number;
  handleReset: () => void;
}

export function IngredientWizardHeader({ step, progressPercent, handleReset }: IngredientWizardHeaderProps) {
  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-orange-600">
          <FlaskConical className="w-5 h-5" />
          <h3 className="text-base font-black text-slate-800" data-ui-key={UI_KEYS.ingredients.wizardTitle}>{TEXTS.ingredients.wizard.title}</h3>
        </div>
        <button type="button" onClick={handleReset} className="text-slate-400 hover:text-slate-600 cursor-pointer" aria-label={TEXTS.common.actions.close}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-1" data-ui-key={UI_KEYS.ingredients.wizardStep}>
        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
          <span>{TEXTS.ingredients.wizard.step(step, 3)}</span>
          <span className="text-emerald-600 font-bold">{TEXTS.ingredients.wizard.steps[step - 1]}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="h-full bg-emerald-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
