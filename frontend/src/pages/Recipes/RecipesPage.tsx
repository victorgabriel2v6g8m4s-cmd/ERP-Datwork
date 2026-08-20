import { useEffect } from 'react';
import { ChefHat, PackagePlus } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import {
  GlobalFooterNav,
  GlobalTopTabs,
  AsyncCollectionState,
  UniversalHeaderDashboard,
  UniversalSearchBar
} from '../../components/index.ts';
import { TEXTS } from '../../i18n/index.ts';
import { ERP_THEME } from '../../theme/presets.ts';
import { UI_KEYS } from '../../ui/keys.ts';
import { formatCurrencyBRL } from '../../utils/format.ts';
import { RecipeCardItem } from './components/RecipeCardItem.tsx';
import { RecipeEditorModal } from './components/RecipeEditorModal.tsx';
import { RecipeStatusDialog } from './components/RecipeStatusDialog.tsx';
import { ViewRecipeModal } from './components/ViewRecipeModal.tsx';
import { useRecipesActions } from './hooks/useRecipesActions.ts';
import { useRecipesFilters } from './hooks/useRecipesFilters.ts';

export function RecipesPage() {
  const actions = useRecipesActions();
  const filters = useRecipesFilters(actions.recipes);
  const { fetchRecipes } = actions;

  useEffect(() => {
    void fetchRecipes();
  }, [fetchRecipes]);

  return (
    <div className={ERP_THEME.recipes.page.shell} data-ui-key={UI_KEYS.recipes.page}>
      <div data-ui-key={UI_KEYS.recipes.headerTitle}>
        <UniversalHeaderDashboard
          title={TEXTS.recipes.page.title}
          subtitle={TEXTS.recipes.page.subtitle}
          icon={ChefHat}
          iconColorClass="text-emerald-600"
          backPath="/home"
          kpiCards={[
            {
              label: TEXTS.recipes.page.activeKpi,
              value: `${filters.activeRecipeCount} ${TEXTS.recipes.page.unitSuffix}`,
              icon: ChefHat,
              valueColorClass: 'text-slate-800'
            },
            {
              label: TEXTS.recipes.page.averageBatchCostKpi,
              value: formatCurrencyBRL(filters.averageBatchCost),
              icon: ChefHat,
              valueColorClass: 'text-emerald-600'
            }
          ]}
        />
      </div>

      <GlobalTopTabs />

      <main className={ERP_THEME.recipes.page.main}>
        <div data-ui-key={UI_KEYS.recipes.search}>
          <UniversalSearchBar
            type="recipes"
            filters={filters.activeFilters}
            onFilterChange={filters.setActiveFilters}
          />
        </div>

        <AsyncCollectionState
          isLoading={actions.loading}
          errorMessage={actions.loadError}
          isEmpty={filters.filteredRecipes.length === 0}
          onRetry={() => void fetchRecipes()}
          emptyTitle={TEXTS.recipes.page.emptyState}
          emptyDescription={TEXTS.recipes.page.subtitle}
        >
          <DragDropContext
            onDragEnd={(result) => actions.handleDragEnd(
              result,
              filters.filteredRecipes,
              () => filters.setActiveFilters((current) => ({ ...current, sortBy: 'custom' }))
            )}
          >
            <Droppable droppableId="recipes-cards-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 block w-full"
                  data-ui-key={UI_KEYS.recipes.list}
                >
                  {filters.filteredRecipes.map((recipe, index) => (
                    <RecipeCardItem
                      key={recipe.id}
                      recipe={recipe}
                      index={index}
                      onSwipeLeft={actions.setStatusRecipe}
                      onSwipeRight={actions.openEdit}
                      onCardClick={actions.openView}
                    />
                  ))}
                  {provided.placeholder}

                </div>
              )}
            </Droppable>
          </DragDropContext>
        </AsyncCollectionState>
      </main>

      <button
        type="button"
        onClick={() => actions.setIsCreateModalOpen(true)}
        className={ERP_THEME.recipes.page.createFab}
        title={TEXTS.recipes.page.createActionTitle}
        aria-label={TEXTS.recipes.page.createActionTitle}
        data-ui-key={UI_KEYS.recipes.createAction}
      >
        <PackagePlus className="w-5 h-5" />
      </button>

      <RecipeEditorModal
        isOpen={actions.isCreateModalOpen}
        mode="create"
        onClose={() => actions.setIsCreateModalOpen(false)}
        onCreate={actions.createRecipe}
        onUpdate={actions.updateRecipe}
      />

      <RecipeEditorModal
        isOpen={actions.isEditModalOpen}
        mode="edit"
        recipe={actions.selectedRecipe}
        onClose={actions.closeSelection}
        onCreate={actions.createRecipe}
        onUpdate={actions.updateRecipe}
      />

      <ViewRecipeModal
        isOpen={actions.isViewModalOpen}
        recipe={actions.selectedRecipe}
        onClose={actions.closeSelection}
      />

      <RecipeStatusDialog
        recipe={actions.statusRecipe}
        onCancel={() => actions.setStatusRecipe(null)}
        onConfirm={actions.confirmStatusChange}
      />

      <GlobalFooterNav />
    </div>
  );
}
