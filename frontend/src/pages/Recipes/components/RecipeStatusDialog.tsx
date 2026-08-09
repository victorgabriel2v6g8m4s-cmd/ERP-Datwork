import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import type { Recipe } from '../../../types/recipe.ts';
import { UI_KEYS } from '../../../ui/keys.ts';

interface RecipeStatusDialogProps {
  recipe: Recipe | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RecipeStatusDialog({ recipe, onCancel, onConfirm }: RecipeStatusDialogProps) {
  return (
    <AnimatePresence>
      {recipe && (
        <div className={ERP_THEME.recipes.modal.overlay} data-ui-key={UI_KEYS.recipes.statusDialog}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={ERP_THEME.recipes.statusDialog.container}
          >
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-black text-slate-800 text-sm" data-ui-key={UI_KEYS.recipes.statusDialogTitle}>
                {recipe.status === 'ACTIVE'
                  ? TEXTS.recipes.statusDialog.deactivateTitle
                  : TEXTS.recipes.statusDialog.reactivateTitle}
              </h3>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed" data-ui-key={UI_KEYS.recipes.statusDialogDescription}>
              {TEXTS.recipes.statusDialog.description(recipe.product.name)}
            </p>
            <div className="flex gap-2 font-bold pt-2">
              <button
                type="button"
                onClick={onCancel}
                className={ERP_THEME.recipes.statusDialog.cancelButton}
                data-ui-key={UI_KEYS.recipes.statusDialogCancel}
              >
                {TEXTS.common.actions.back}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={ERP_THEME.recipes.statusDialog.confirmButton}
                data-ui-key={UI_KEYS.recipes.statusDialogConfirm}
              >
                {TEXTS.common.actions.confirm}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
