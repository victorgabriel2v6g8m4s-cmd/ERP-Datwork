import { api } from '../../../api/client.ts';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Ingredient, IngredientStatus, IngredientVersion } from '../../../types/ingredient.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import type { IngredientMutationPayload, IngredientOrderPosition, IngredientOrderProfile } from '../types/ingredient.types.ts';
import {
  parseIngredientList,
  parseIngredientOrderProfiles,
  parseIngredientResponse,
  parseIngredientVersions
} from '../utils/ingredientContract.ts';

function requireIngredient(value: unknown, operation: string): Ingredient {
  const ingredient = parseIngredientResponse(value);
  if (ingredient) return ingredient;
  CustomLogger.error(`[Ingredients] Invalid response contract during ${operation}`);
  throw new Error('InvalidIngredientResponseContract');
}

function requireIngredientList(value: unknown, operation: string): Ingredient[] {
  const ingredients = parseIngredientList(value);
  if (ingredients) return ingredients;
  CustomLogger.error(`[Ingredients] Invalid list contract during ${operation}`);
  throw new Error('InvalidIngredientListResponseContract');
}

export const ingredientsService = {
  async list(): Promise<Ingredient[]> {
    const response = await api.get<unknown>(APP_CONFIG.api.endpoints.ingredients.catalog);
    return requireIngredientList(response.data, 'list');
  },

  async create(payload: IngredientMutationPayload): Promise<Ingredient> {
    const response = await api.post<unknown>(APP_CONFIG.api.endpoints.ingredients.catalog, payload);
    return requireIngredient(response.data, 'create');
  },

  async update(id: string, payload: IngredientMutationPayload): Promise<Ingredient> {
    const response = await api.put<unknown>(APP_CONFIG.api.endpoints.ingredients.item(id), payload);
    return requireIngredient(response.data, 'update');
  },

  async updateStatus(id: string, status: IngredientStatus): Promise<Ingredient> {
    const response = await api.patch<unknown>(APP_CONFIG.api.endpoints.ingredients.status(id), { status });
    return requireIngredient(response.data, 'update status');
  },

  async reorder(positions: IngredientOrderPosition[]): Promise<Ingredient[]> {
    const response = await api.patch<unknown>(APP_CONFIG.api.endpoints.ingredients.reorder, { positions });
    return requireIngredientList(response.data, 'reorder');
  },

  async listVersions(ingredientId: string): Promise<IngredientVersion[]> {
    const response = await api.get<unknown>(APP_CONFIG.api.endpoints.ingredients.versions(ingredientId));
    const versions = parseIngredientVersions(response.data);
    if (versions) return versions;
    throw new Error('InvalidIngredientVersionResponseContract');
  },

  async listOrderProfiles(): Promise<IngredientOrderProfile[]> {
    const response = await api.get<unknown>(APP_CONFIG.api.endpoints.ingredients.orderProfiles);
    const profiles = parseIngredientOrderProfiles(response.data);
    if (profiles) return profiles;
    throw new Error('InvalidIngredientOrderProfileContract');
  },

  async createOrderProfile(name: string, positions: IngredientOrderPosition[]): Promise<void> {
    await api.post(APP_CONFIG.api.endpoints.ingredients.orderProfiles, { name, positions });
  },

  async renameOrderProfile(id: string, name: string): Promise<void> {
    await api.put(APP_CONFIG.api.endpoints.ingredients.orderProfile(id), { name });
  },

  async deleteOrderProfile(id: string): Promise<void> {
    await api.delete(APP_CONFIG.api.endpoints.ingredients.orderProfile(id));
  }
};
