import type { Recipe } from '../../../types/recipe.ts';

export function reorderVisibleRecipes(
  allRecipes: Recipe[],
  visibleRecipes: Recipe[],
  sourceIndex: number,
  destinationIndex: number
): Recipe[] | null {
  if (
    sourceIndex < 0 ||
    destinationIndex < 0 ||
    sourceIndex >= visibleRecipes.length ||
    destinationIndex >= visibleRecipes.length ||
    sourceIndex === destinationIndex
  ) {
    return null;
  }

  const reorderedVisible = [...visibleRecipes];
  const [moved] = reorderedVisible.splice(sourceIndex, 1);
  if (!moved) return null;
  reorderedVisible.splice(destinationIndex, 0, moved);

  const orderedAll = [...allRecipes].sort((a, b) => a.position - b.position);
  const visibleIds = new Set(reorderedVisible.map((recipe) => recipe.id));
  const queue = [...reorderedVisible];

  return orderedAll
    .map((recipe) => visibleIds.has(recipe.id) ? queue.shift() ?? recipe : recipe)
    .map((recipe, position) => ({ ...recipe, position }));
}
