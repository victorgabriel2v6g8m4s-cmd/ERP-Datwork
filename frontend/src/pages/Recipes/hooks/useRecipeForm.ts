import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { TEXTS } from '../../../i18n/index.ts';
import type { Recipe } from '../../../types/recipe.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { recipesService } from '../services/recipes.service.ts';
import type {
  CreateRecipePayload,
  RecipeFormMode,
  RecipeFormOptions,
  RecipeFormValues,
  RecipeMutationPayload
} from '../types/recipe-form.types.ts';
import { buildRecipeMutationPayload, calculateRecipeCosts, normalizeRecipeUnitsPerBatch } from '../utils/recipeCalculations.ts';
import { addIngredientSelection, createRecipeFormValues } from '../utils/recipeForm.ts';

interface UseRecipeFormOptions {
  isOpen: boolean;
  mode: RecipeFormMode;
  recipe?: Recipe | null;
}

const EMPTY_OPTIONS: RecipeFormOptions = { products: [], ingredients: [] };

export function useRecipeForm({ isOpen, mode, recipe = null }: UseRecipeFormOptions) {
  const [values, setValues] = useState<RecipeFormValues>(() => createRecipeFormValues(recipe));
  const [options, setOptions] = useState<RecipeFormOptions>(EMPTY_OPTIONS);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setValues(createRecipeFormValues(recipe));
    setFormError(null);
    setIsSaving(false);
    setIsLoadingOptions(true);

    CustomLogger.info(`[Recipes][Form] Initializing ${mode} form`, { recipeId: recipe?.id ?? null });

    void recipesService.listFormOptions()
      .then((loadedOptions) => {
        if (!cancelled) setOptions(loadedOptions);
      })
      .catch((error) => {
        if (cancelled) return;
        CustomLogger.error('[Recipes][Form] Failed to load form options', error);
        setFormError(TEXTS.recipes.errors.formOptions);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, mode, recipe]);

  const setField = useCallback(<K extends keyof RecipeFormValues>(field: K, value: RecipeFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const setUnitsPerBatch = useCallback((value: number) => {
    setField('unitsPerBatch', normalizeRecipeUnitsPerBatch(value));
  }, [setField]);

  const addCurrentIngredient = useCallback(() => {
    const ingredient = options.ingredients.find((option) => option.id === values.currentIngredientId);
    if (!ingredient || values.currentQuantity <= APP_CONFIG.recipes.limits.minIngredientQuantity) return;

    setValues((current) => ({
      ...current,
      items: addIngredientSelection(current.items, ingredient, current.currentQuantity),
      currentIngredientId: '',
      currentQuantity: 0
    }));
  }, [options.ingredients, values.currentIngredientId, values.currentQuantity]);

  const removeIngredient = useCallback((ingredientId: string) => {
    setValues((current) => ({
      ...current,
      items: current.items.filter((item) => item.ingredientId !== ingredientId)
    }));
  }, []);

  const costs = useMemo(
    () => calculateRecipeCosts(values.items, values.unitsPerBatch),
    [values.items, values.unitsPerBatch]
  );

  const canSubmit = values.items.length > 0 && (mode === 'edit' || Boolean(values.productId));

  const submit = useCallback(async (
    onCreate: (payload: CreateRecipePayload) => Promise<boolean>,
    onUpdate: (id: string, payload: RecipeMutationPayload) => Promise<boolean>
  ): Promise<boolean> => {
    if (!canSubmit) return false;

    const payload = buildRecipeMutationPayload(values);
    if (!payload) return false;

    setIsSaving(true);
    setFormError(null);

    try {
      if (mode === 'create') {
        const productId = values.productId.trim();
        if (!productId) return false;
        return await onCreate({ productId, ...payload });
      }

      if (!recipe) return false;
      return await onUpdate(recipe.id, payload);
    } finally {
      setIsSaving(false);
    }
  }, [canSubmit, mode, recipe, values]);

  return {
    values,
    options,
    costs,
    isLoadingOptions,
    isSaving,
    formError,
    canSubmit,
    setField,
    setUnitsPerBatch,
    addCurrentIngredient,
    removeIngredient,
    submit
  };
}
