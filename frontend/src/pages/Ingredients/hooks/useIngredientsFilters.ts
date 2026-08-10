import { useMemo, useState } from 'react';
import type { UniversalFilters } from '../../../components/index.ts';
import type { Ingredient } from '../../../types/ingredient.ts';
import type { IngredientOrderProfile } from '../types/ingredient.types.ts';
import { applyIngredientOrderPositions, calculateIngredientMetrics, filterIngredients } from '../utils/ingredientCatalog.ts';
import { parseIngredientOrderPositions } from '../utils/ingredientContract.ts';

const INITIAL_FILTERS: UniversalFilters = {
  search: '',
  sortBy: 'custom',
  abcCategory: 'all',
  unitFilter: 'all'
};

export function useIngredientsFilters(ingredients: Ingredient[], orderProfiles: IngredientOrderProfile[]) {
  const [activeFilters, setActiveFilters] = useState<UniversalFilters>(INITIAL_FILTERS);

  const metrics = useMemo(() => calculateIngredientMetrics(ingredients), [ingredients]);
  const filteredIngredients = useMemo(
    () => filterIngredients(ingredients, activeFilters, orderProfiles),
    [activeFilters, ingredients, orderProfiles]
  );

  const handleApplyProfilePositions = (positions: unknown) =>
    applyIngredientOrderPositions(ingredients, parseIngredientOrderPositions(positions))
      .map((ingredient, position) => ({ ...ingredient, position }));

  return {
    activeFilters,
    setActiveFilters,
    filteredIngredients,
    handleApplyProfilePositions,
    ...metrics
  };
}
