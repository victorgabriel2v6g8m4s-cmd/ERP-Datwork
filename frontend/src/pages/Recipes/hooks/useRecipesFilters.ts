import { useMemo, useState } from 'react';
import type { UniversalFilters } from '../../../components/UniversalSearchBar.tsx';
import type { Recipe } from '../../../types/recipe.ts';

const DEFAULT_RECIPE_FILTERS: UniversalFilters = {
  search: '',
  sortBy: 'custom',
  abcCategory: 'all',
  unitFilter: 'all'
};

export function useRecipesFilters(recipes: Recipe[]) {
  const [activeFilters, setActiveFilters] = useState<UniversalFilters>(DEFAULT_RECIPE_FILTERS);

  const result = useMemo(() => {
    const search = activeFilters.search.trim().toLocaleLowerCase('pt-BR');

    const filteredRecipes = recipes
      .filter((recipe) => {
        if (!search) return true;
        return recipe.product.sku.toLocaleLowerCase('pt-BR').includes(search)
          || recipe.product.name.toLocaleLowerCase('pt-BR').includes(search);
      })
      .sort((a, b) => {
        if (activeFilters.sortBy === 'az') return a.product.name.localeCompare(b.product.name, 'pt-BR');
        if (activeFilters.sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (activeFilters.sortBy === 'batch-cost-desc') {
          return (b.product.recipeCostPerUnit * b.unitsPerBatch) - (a.product.recipeCostPerUnit * a.unitsPerBatch);
        }
        if (activeFilters.sortBy === 'unit-cost-desc') {
          return b.product.recipeCostPerUnit - a.product.recipeCostPerUnit;
        }
        if (activeFilters.sortBy === 'units-batch-desc') {
          return b.unitsPerBatch - a.unitsPerBatch;
        }
        return a.position - b.position;
      });

    const activeRecipes = filteredRecipes.filter((recipe) => recipe.status === 'ACTIVE');
    const totalBatchCost = activeRecipes.reduce(
      (sum, recipe) => sum + (recipe.product.recipeCostPerUnit * recipe.unitsPerBatch),
      0
    );

    return {
      filteredRecipes,
      activeRecipeCount: activeRecipes.length,
      averageBatchCost: activeRecipes.length > 0 ? totalBatchCost / activeRecipes.length : 0
    };
  }, [activeFilters, recipes]);

  return {
    activeFilters,
    setActiveFilters,
    ...result
  };
}
