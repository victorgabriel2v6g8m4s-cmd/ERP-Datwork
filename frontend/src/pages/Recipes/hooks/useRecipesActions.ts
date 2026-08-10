import { useCallback, useState } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { Recipe } from '../../../types/recipe.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { recipesService } from '../services/recipes.service.ts';
import type { CreateRecipePayload, RecipeMutationPayload } from '../types/recipe-form.types.ts';
import { reorderVisibleRecipes } from '../utils/recipeOrder.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error) || !isRecord(error.response) || !isRecord(error.response.data)) return fallback;
  return typeof error.response.data.error === 'string' ? error.response.data.error : fallback;
}

export function useRecipesActions() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [statusRecipe, setStatusRecipe] = useState<Recipe | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchRecipes = useCallback(async () => {
    CustomLogger.info('[Recipes] Loading recipe catalog');

    try {
      const data = await recipesService.list();
      setRecipes([...data].sort((a, b) => a.position - b.position));
      CustomLogger.info(`[Recipes] Recipe catalog loaded with ${data.length} records`);
    } catch (error) {
      CustomLogger.error('[Recipes] Failed to load recipe catalog', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecipe = useCallback(async (payload: CreateRecipePayload) => {
    CustomLogger.info('[Recipes] Creating recipe', { productId: payload.productId });

    try {
      const created = await recipesService.create(payload);
      setRecipes((current) => [...current, created].sort((a, b) => a.position - b.position));
      setIsCreateModalOpen(false);
      return true;
    } catch (error) {
      CustomLogger.error('[Recipes] Failed to create recipe', error);
      window.alert(TEXTS.recipes.errors.create(getApiErrorMessage(error, TEXTS.recipes.errors.createFallback)));
      return false;
    }
  }, []);

  const updateRecipe = useCallback(async (id: string, payload: RecipeMutationPayload) => {
    CustomLogger.info(`[Recipes] Updating recipe ${id}`);

    try {
      const updated = await recipesService.update(id, payload);
      setRecipes((current) => current.map((recipe) => recipe.id === id ? updated : recipe));
      setIsEditModalOpen(false);
      setSelectedRecipe(null);
      return true;
    } catch (error) {
      CustomLogger.error(`[Recipes] Failed to update recipe ${id}`, error);
      window.alert(TEXTS.recipes.errors.update(getApiErrorMessage(error, TEXTS.recipes.errors.updateFallback)));
      return false;
    }
  }, []);

  const confirmStatusChange = useCallback(async () => {
    if (!statusRecipe) return;

    const target = statusRecipe;
    const nextStatus: Recipe['status'] = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatusRecipe(null);
    setRecipes((current) => current.map((recipe) => recipe.id === target.id ? { ...recipe, status: nextStatus } : recipe));

    CustomLogger.info(`[Recipes] Updating recipe ${target.id} status to ${nextStatus}`);

    try {
      const updated = await recipesService.updateStatus(target.id, nextStatus);
      setRecipes((current) => current.map((recipe) => recipe.id === updated.id ? updated : recipe));
    } catch (error) {
      CustomLogger.error(`[Recipes] Failed to update recipe ${target.id} status`, error);
      setRecipes((current) => current.map((recipe) => recipe.id === target.id ? target : recipe));
      window.alert(TEXTS.recipes.errors.status);
    }
  }, [statusRecipe]);

  const handleDragEnd = useCallback(async (
    result: DropResult,
    visibleRecipes: Recipe[],
    switchToCustomSort: () => void
  ) => {
    const destination = result.destination;
    if (!destination || destination.index === result.source.index) return;

    const updatedRecipes = reorderVisibleRecipes(
      recipes,
      visibleRecipes,
      result.source.index,
      destination.index
    );

    if (!updatedRecipes) return;
    switchToCustomSort();
    setRecipes(updatedRecipes);

    try {
      const persisted = await recipesService.reorder(
        updatedRecipes.map((recipe) => ({ id: recipe.id, position: recipe.position }))
      );
      setRecipes(persisted);
      CustomLogger.info(`[Recipes] Reordered recipe ${result.source.index} -> ${destination.index}`);
    } catch (error) {
      CustomLogger.error('[Recipes] Failed to persist recipe order. Restoring server order', error);
      window.alert(TEXTS.recipes.errors.reorder);
      await fetchRecipes();
    }
  }, [fetchRecipes, recipes]);

  const openView = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsViewModalOpen(true);
  }, []);

  const openEdit = useCallback((recipeOrId: Recipe | string) => {
    const recipe = typeof recipeOrId === 'string'
      ? recipes.find((item) => item.id === recipeOrId) ?? null
      : recipeOrId;

    if (!recipe) return;
    setSelectedRecipe(recipe);
    setIsEditModalOpen(true);
  }, [recipes]);

  const closeSelection = useCallback(() => {
    setSelectedRecipe(null);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
  }, []);

  return {
    recipes,
    loading,
    selectedRecipe,
    statusRecipe,
    isCreateModalOpen,
    isEditModalOpen,
    isViewModalOpen,
    setIsCreateModalOpen,
    setStatusRecipe,
    fetchRecipes,
    createRecipe,
    updateRecipe,
    confirmStatusChange,
    handleDragEnd,
    openView,
    openEdit,
    closeSelection
  };
}
