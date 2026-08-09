import { motion } from 'framer-motion';
import { Archive, Calculator, CheckCircle, ChefHat, Layers, Plus, Trash2, X } from 'lucide-react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import type { Recipe } from '../../../types/recipe.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';
import { useRecipeForm } from '../hooks/useRecipeForm.ts';
import type { CreateRecipePayload, RecipeFormMode, RecipeMutationPayload } from '../types/recipe-form.types.ts';
import { calculateRecipeIngredientCost } from '../utils/recipeCalculations.ts';

interface RecipeEditorModalProps {
  isOpen: boolean;
  mode: RecipeFormMode;
  recipe?: Recipe | null;
  onClose: () => void;
  onCreate: (payload: CreateRecipePayload) => Promise<boolean>;
  onUpdate: (id: string, payload: RecipeMutationPayload) => Promise<boolean>;
}

export function RecipeEditorModal({
  isOpen,
  mode,
  recipe = null,
  onClose,
  onCreate,
  onUpdate
}: RecipeEditorModalProps) {
  const form = useRecipeForm({ isOpen, mode, recipe });

  if (!isOpen) return null;

  const isCreate = mode === 'create';
  const title = isCreate ? TEXTS.recipes.form.createTitle : TEXTS.recipes.form.editTitle;
  const modalUiKey = isCreate ? UI_KEYS.recipes.createModal : UI_KEYS.recipes.editModal;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const saved = await form.submit(onCreate, onUpdate);
    if (saved) onClose();
  };

  return (
    <div className={ERP_THEME.recipes.modal.overlay} data-ui-key={modalUiKey}>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        className={ERP_THEME.recipes.modal.editor}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <ChefHat className="w-5 h-5" />
            <h3 className="text-base font-black text-slate-800">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer" aria-label={TEXTS.common.actions.close}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {form.formError && (
          <div className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-xs">
            {form.formError}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2" data-ui-key={UI_KEYS.recipes.formProduct}>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {isCreate ? TEXTS.recipes.form.productTarget : TEXTS.recipes.form.linkedProduct}
            </label>
            {isCreate ? (
              <select
                required
                value={form.values.productId}
                disabled={form.isLoadingOptions}
                onChange={(event) => form.setField('productId', event.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-700 h-[38px] focus:outline-none cursor-pointer focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">{TEXTS.recipes.form.chooseProduct}</option>
                {form.options.products.map((product) => (
                  <option key={product.id} value={product.id}>[{product.sku}] {product.name}</option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-700 h-[38px] truncate">
                [{recipe?.product.sku}] {recipe?.product.name}
              </div>
            )}
          </div>

          <div className="col-span-1" data-ui-key={UI_KEYS.recipes.formYield}>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-0.5">
              <Archive className="w-3 h-3 text-indigo-500" /> {TEXTS.recipes.form.unitsPerBatch}
            </label>
            <input
              type="number"
              required
              min={APP_CONFIG.recipes.limits.minUnitsPerBatch}
              value={form.values.unitsPerBatch}
              onChange={(event) => form.setUnitsPerBatch(Number(event.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 h-[38px] text-center focus:outline-none focus:border-indigo-500 tabular-nums"
            />
          </div>
        </div>

        <div className={ERP_THEME.recipes.modal.section}>
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5 text-indigo-500" />
            {isCreate ? TEXTS.recipes.form.addComponent : TEXTS.recipes.form.modifyIngredients}
          </span>
          <div className="grid grid-cols-[1fr_90px_48px] gap-2 items-end">
            <div data-ui-key={UI_KEYS.recipes.formIngredient}>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{TEXTS.recipes.form.ingredient}</label>
              <select
                value={form.values.currentIngredientId}
                disabled={form.isLoadingOptions}
                onChange={(event) => form.setField('currentIngredientId', event.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 h-[36px] focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="">{TEXTS.recipes.form.chooseIngredient}</option>
                {form.options.ingredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name} ({ingredient.unit.substring(0, 2).toLowerCase()})
                  </option>
                ))}
              </select>
            </div>
            <div data-ui-key={UI_KEYS.recipes.formQuantity}>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                {isCreate ? TEXTS.recipes.form.quantityUsed : TEXTS.recipes.form.quantityAdditional}
              </label>
              <input
                type="number"
                min={APP_CONFIG.recipes.limits.minIngredientQuantity}
                step="any"
                value={form.values.currentQuantity || ''}
                onChange={(event) => form.setField('currentQuantity', Number(event.target.value))}
                placeholder="0.0"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 h-[36px] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={form.addCurrentIngredient}
              disabled={!form.values.currentIngredientId || form.values.currentQuantity <= APP_CONFIG.recipes.limits.minIngredientQuantity}
              className="h-[36px] w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center font-bold cursor-pointer transition-colors shadow-3xs"
              aria-label={TEXTS.recipes.form.addComponent}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {isCreate ? TEXTS.recipes.form.draftStructure : TEXTS.recipes.form.savedStructure}
          </span>
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[160px] overflow-y-auto bg-white shadow-3xs">
            {form.values.items.map((item) => (
              <div key={item.ingredientId} className="grid grid-cols-[1fr_80px_95px_40px] items-center py-2 px-3 text-xs font-semibold text-slate-700">
                <div className="truncate font-black text-slate-800">{item.name}</div>
                <div className="text-center font-bold text-slate-500 tabular-nums">{item.quantityNeeded} {item.unit.substring(0, 2).toLowerCase()}</div>
                <div className="text-right font-bold text-slate-600 tabular-nums">{formatCurrencyBRL(calculateRecipeIngredientCost(item))}</div>
                <button
                  type="button"
                  onClick={() => form.removeIngredient(item.ingredientId)}
                  className="text-slate-400 hover:text-red-500 ml-auto p-1 rounded transition-colors cursor-pointer"
                  aria-label={`${TEXTS.common.actions.cancel} ${item.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {form.values.items.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase tracking-wider">
                {TEXTS.recipes.form.emptyDraft}
              </div>
            )}
          </div>
        </div>

        <div className={ERP_THEME.recipes.modal.costSummary}>
          <div>
            <span className="block text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> {TEXTS.recipes.form.batchCost}
            </span>
            <span className="text-xs font-black tabular-nums text-emerald-400">{formatCurrencyBRL(form.costs.batchCost)}</span>
          </div>
          <div className="pl-4">
            <span className="block text-[9px] font-bold uppercase text-slate-400">{TEXTS.recipes.form.unitCost}</span>
            <span className="text-xs font-black tabular-nums text-indigo-400">{formatCurrencyBRL(form.costs.unitCost)}</span>
          </div>
        </div>

        <div className={ERP_THEME.recipes.modal.footer}>
          <button type="button" onClick={onClose} className={ERP_THEME.modal.btnCancel}>{TEXTS.common.actions.cancel}</button>
          <button
            type="submit"
            disabled={!form.canSubmit || form.isSaving}
            className={ERP_THEME.modal.btnSuccess}
            data-ui-key={UI_KEYS.recipes.formSubmit}
          >
            <span className="inline-flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {form.isSaving ? TEXTS.common.status.saving : isCreate ? TEXTS.recipes.form.saveCreate : TEXTS.recipes.form.saveEdit}
            </span>
          </button>
        </div>
      </motion.form>
    </div>
  );
}
