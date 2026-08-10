import { useCallback, useEffect, useState } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import { TEXTS } from '../../../i18n/index.ts';
import type { Ingredient } from '../../../types/ingredient.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { ingredientsService } from '../services/ingredients.service.ts';
import type { IngredientMutationPayload, IngredientOrderPosition, IngredientOrderProfile } from '../types/ingredient.types.ts';
import { reorderVisibleIngredients } from '../utils/ingredientCatalog.ts';
import { parseIngredientOrderPositions } from '../utils/ingredientContract.ts';

export function useIngredientsActions() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [orderProfiles, setOrderProfiles] = useState<IngredientOrderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const fetchIngredients = useCallback(async () => {
    try {
      const data = await ingredientsService.list();
      setIngredients(data.sort((a, b) => a.position - b.position));
    } catch (error) {
      CustomLogger.error('[Ingredients] Failed to load catalog', error);
      window.alert(TEXTS.ingredients.errors.load);
    }
  }, []);

  const fetchOrderProfiles = useCallback(async () => {
    try {
      setOrderProfiles(await ingredientsService.listOrderProfiles());
    } catch (error) {
      CustomLogger.error('[Ingredients] Failed to load order profiles', error);
      setOrderProfiles([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    void Promise.allSettled([fetchIngredients(), fetchOrderProfiles()]).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [fetchIngredients, fetchOrderProfiles]);

  const handleCreateIngredient = async (payload: IngredientMutationPayload) => {
    try {
      const created = await ingredientsService.create(payload);
      setIngredients((current) => [...current, created].sort((a, b) => a.position - b.position));
      setIsCreateModalOpen(false);
    } catch (error) {
      CustomLogger.error('[Ingredients] Failed to create ingredient', error);
      window.alert(TEXTS.ingredients.errors.create);
      throw error;
    }
  };

  const handleUpdateIngredient = async (id: string, payload: IngredientMutationPayload) => {
    try {
      const updated = await ingredientsService.update(id, payload);
      setIngredients((current) => current.map((item) => item.id === id ? updated : item));
      setSelectedIngredient(updated);
      setIsEditModalOpen(false);
    } catch (error) {
      CustomLogger.error(`[Ingredients] Failed to update ingredient ${id}`, error);
      window.alert(TEXTS.ingredients.errors.update);
      throw error;
    }
  };

  const handleToggleStatus = async (ingredient: Ingredient) => {
    const nextStatus = ingredient.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await ingredientsService.updateStatus(ingredient.id, nextStatus);
      setIngredients((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) {
      CustomLogger.error(`[Ingredients] Failed to update status for ${ingredient.id}`, error);
      window.alert(TEXTS.ingredients.errors.status);
    }
  };

  const handleDragEnd = async (result: DropResult, visibleIngredients: Ingredient[]) => {
    if (!result.destination) return;

    const reordered = reorderVisibleIngredients(
      ingredients,
      visibleIngredients,
      result.source.index,
      result.destination.index
    );
    if (!reordered) return;

    setIngredients(reordered.ingredients);
    try {
      const persisted = await ingredientsService.reorder(reordered.positions);
      setIngredients(persisted);
    } catch (error) {
      CustomLogger.error('[Ingredients] Failed to persist reorder; reloading catalog', error);
      window.alert(TEXTS.ingredients.errors.reorder);
      await fetchIngredients();
    }
  };

  const openEditModal = (id: string) => {
    const ingredient = ingredients.find((item) => item.id === id);
    if (!ingredient) return;
    setSelectedIngredient(ingredient);
    setIsEditModalOpen(true);
  };

  const openViewModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsViewModalOpen(true);
  };

  const applyProfilePositions = (positions: unknown) => {
    const parsed = parseIngredientOrderPositions(positions);
    const byId = new Map(parsed.map(({ id, position }) => [id, position]));
    setIngredients((current) => [...current]
      .sort((a, b) => (byId.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (byId.get(b.id) ?? Number.MAX_SAFE_INTEGER) || a.position - b.position)
      .map((item, position) => ({ ...item, position })));
  };

  const handleSaveNewOrderProfile = async (name: string) => {
    const positions: IngredientOrderPosition[] = [...ingredients]
      .sort((a, b) => a.position - b.position)
      .map(({ id }, position) => ({ id, position }));
    await ingredientsService.createOrderProfile(name, positions);
    await fetchOrderProfiles();
  };

  const handleRenameOrderProfile = async (id: string, name: string) => {
    await ingredientsService.renameOrderProfile(id, name);
    await fetchOrderProfiles();
  };

  const handleDeleteOrderProfile = async (id: string) => {
    await ingredientsService.deleteOrderProfile(id);
    await fetchOrderProfiles();
  };

  return {
    ingredients,
    orderProfiles,
    loading,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    selectedIngredient,
    setSelectedIngredient,
    handleCreateIngredient,
    handleUpdateIngredient,
    handleToggleStatus,
    handleDragEnd,
    openEditModal,
    openViewModal,
    applyProfilePositions,
    handleSaveNewOrderProfile,
    handleRenameOrderProfile,
    handleDeleteOrderProfile
  };
}
