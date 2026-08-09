import { AnimatePresence, motion } from 'framer-motion';
import { ChefHat, DollarSign, Layers, Package, X } from 'lucide-react';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import type { Recipe } from '../../../types/recipe.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';
import { calculatePersistedRecipeCosts, calculateRecipeItemCost } from '../utils/recipeCalculations.ts';

interface ViewRecipeModalProps {
  isOpen: boolean;
  recipe: Recipe | null;
  onClose: () => void;
}

export function ViewRecipeModal({ isOpen, recipe, onClose }: ViewRecipeModalProps) {
  if (!isOpen || !recipe) return null;

  const costs = calculatePersistedRecipeCosts(recipe);

  return (
    <AnimatePresence>
      <div className={ERP_THEME.recipes.modal.overlay} data-ui-key={UI_KEYS.recipes.viewModal}>
        <motion.div
          key="view-recipe-modal-card"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 25, opacity: 0 }}
          className={ERP_THEME.recipes.modal.viewer}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full cursor-pointer z-10"
            aria-label={TEXTS.common.actions.close}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-14 h-12 rounded-xl bg-slate-900 border border-slate-150 overflow-hidden flex items-center justify-center shadow-3xs shrink-0 text-white">
              {recipe.product.thumbnail ? (
                <img src={recipe.product.thumbnail} alt={recipe.product.name} className="w-full h-full object-cover" />
              ) : (
                <ChefHat className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase font-mono tracking-tight tabular-nums">
                {recipe.product.sku}
              </span>
              <h3 className="text-base font-black text-slate-800 truncate mt-1 leading-tight">{recipe.product.name}</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{TEXTS.recipes.view.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-0.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-500" /> {TEXTS.recipes.view.yieldLabel}
              </span>
              <span className="text-xs font-black text-slate-800 tabular-nums">{TEXTS.recipes.view.servings(recipe.unitsPerBatch)}</span>
            </div>
            <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-0.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-500" /> {TEXTS.recipes.view.batchCost}
              </span>
              <span className="text-xs font-black text-slate-800 tabular-nums">{formatCurrencyBRL(costs.batchCost)}</span>
            </div>
            <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-0.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Package className="w-3 h-3 text-indigo-500" /> {TEXTS.recipes.view.unitCost}
              </span>
              <span className="text-xs font-black text-indigo-600 tabular-nums">{formatCurrencyBRL(costs.unitCost)}</span>
            </div>
          </div>

          <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-3xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <div className="w-full min-w-[500px]">
                <div className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px] grid grid-cols-[1fr_100px_100px_110px] items-center py-2.5 w-full">
                  <div className="px-4">{TEXTS.recipes.view.ingredientColumn}</div>
                  <div className="px-3 text-center">{TEXTS.recipes.view.quantityColumn}</div>
                  <div className="px-3 text-center">{TEXTS.recipes.view.unitColumn}</div>
                  <div className="px-4 text-right">{TEXTS.recipes.view.fractionalCostColumn}</div>
                </div>

                <div className="divide-y divide-slate-100 font-medium text-slate-700 block w-full bg-white">
                  {recipe.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_100px_100px_110px] items-center py-2.5 w-full text-xs hover:bg-slate-50/50"
                    >
                      <div className="px-4 font-black text-slate-800 truncate">{item.ingredient.name}</div>
                      <div className="px-3 text-center font-bold text-slate-600 tabular-nums">{item.quantityNeeded}</div>
                      <div className="px-3 text-center font-semibold text-slate-500 truncate">{item.ingredient.unit}</div>
                      <div className="px-4 text-right font-black text-slate-800 tabular-nums">{formatCurrencyBRL(calculateRecipeItemCost(item))}</div>
                    </div>
                  ))}

                  {recipe.items.length === 0 && (
                    <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase tracking-wider block w-full">
                      {TEXTS.recipes.view.emptyIngredients}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors cursor-pointer text-center">
              {TEXTS.recipes.view.close}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
