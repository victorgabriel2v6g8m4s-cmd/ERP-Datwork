import type { UniversalFilters } from '../../../components/index.ts';
import type { Ingredient } from '../../../types/ingredient.ts';
import type { IngredientMetrics, IngredientOrderPosition, IngredientOrderProfile, IngredientReorderResult } from '../types/ingredient.types.ts';
import { parseIngredientOrderPositions } from './ingredientContract.ts';

export function calculateIngredientMetrics(ingredients: Ingredient[]): IngredientMetrics {
  const active = ingredients.filter((ingredient) => ingredient.status === 'ACTIVE');
  const totalIngredientsCount = active.length;
  const averagePrice = totalIngredientsCount > 0
    ? active.reduce((sum, ingredient) => sum + ingredient.price, 0) / totalIngredientsCount
    : 0;

  return { totalIngredientsCount, averagePrice };
}

export function filterIngredients(
  ingredients: Ingredient[],
  filters: UniversalFilters,
  orderProfiles: IngredientOrderProfile[]
): Ingredient[] {
  const search = filters.search.trim().toLocaleLowerCase('pt-BR');
  let result = ingredients.filter((ingredient) => {
    if (filters.unitFilter !== 'all' && ingredient.unit !== filters.unitFilter) return false;
    if (!search) return true;
    return ingredient.sku.toLocaleLowerCase('pt-BR').includes(search) || ingredient.name.toLocaleLowerCase('pt-BR').includes(search);
  });

  if (filters.sortBy.startsWith('profile-')) {
    const profileId = filters.sortBy.slice('profile-'.length);
    const profile = orderProfiles.find((candidate) => candidate.id === profileId);
    if (profile) return applyIngredientOrderPositions(result, parseIngredientOrderPositions(profile.positions));
  }

  result = [...result];
  if (filters.sortBy === 'az') return result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  if (filters.sortBy === 'date') return result.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  if (filters.sortBy === 'value') return result.sort((a, b) => b.price - a.price);
  return result.sort((a, b) => a.position - b.position);
}

export function applyIngredientOrderPositions(
  ingredients: Ingredient[],
  positions: IngredientOrderPosition[]
): Ingredient[] {
  const positionById = new Map(positions.map(({ id, position }) => [id, position]));
  return [...ingredients].sort((a, b) => {
    const posA = positionById.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const posB = positionById.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return posA - posB || a.position - b.position;
  });
}

export function reorderVisibleIngredients(
  allIngredients: Ingredient[],
  visibleIngredients: Ingredient[],
  sourceIndex: number,
  destinationIndex: number
): IngredientReorderResult | null {
  if (
    sourceIndex < 0 || destinationIndex < 0 ||
    sourceIndex >= visibleIngredients.length || destinationIndex >= visibleIngredients.length ||
    sourceIndex === destinationIndex
  ) {
    return null;
  }

  const reorderedVisible = [...visibleIngredients];
  const [moved] = reorderedVisible.splice(sourceIndex, 1);
  if (!moved) return null;
  reorderedVisible.splice(destinationIndex, 0, moved);

  const visibleIds = new Set(reorderedVisible.map((item) => item.id));
  const queue = [...reorderedVisible];
  const orderedAll = [...allIngredients].sort((a, b) => a.position - b.position);
  const merged = orderedAll.map((item) => visibleIds.has(item.id) ? (queue.shift() ?? item) : item);
  const ingredients = merged.map((item, position) => ({ ...item, position }));
  const positions = ingredients.map(({ id, position }) => ({ id, position }));

  return { ingredients, positions };
}
