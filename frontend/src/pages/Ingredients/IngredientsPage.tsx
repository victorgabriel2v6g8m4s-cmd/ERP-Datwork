import { ClipboardList, FlaskConical, PackagePlus } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import {
  GlobalFooterNav,
  GlobalTopTabs,
  UniversalGridTable,
  UniversalHeaderDashboard,
  UniversalRowItem,
  UniversalSearchBar
} from '../../components/index.ts';
import { TEXTS } from '../../i18n/index.ts';
import { ERP_THEME } from '../../theme/presets.ts';
import { UI_KEYS } from '../../ui/keys.ts';
import { formatCurrencyBRL } from '../../utils/format.ts';
import { CreateIngredientModal } from './components/CreateIngredientModal.tsx';
import { EditIngredientModal } from './components/EditIngredientModal.tsx';
import { ViewIngredientModal } from './components/ViewIngredientModal.tsx';
import { useIngredientsActions } from './hooks/useIngredientsActions.ts';
import { useIngredientsFilters } from './hooks/useIngredientsFilters.ts';

const INGREDIENTS_TABLE_COLUMNS = [
  { header: TEXTS.ingredients.columns.thumbnail, gridRatio: '56px', textAlign: 'center' as const },
  { header: TEXTS.ingredients.columns.sku, gridRatio: '90px', textAlign: 'left' as const },
  { header: TEXTS.ingredients.columns.name, gridRatio: '1fr', textAlign: 'left' as const },
  { header: TEXTS.ingredients.columns.price, gridRatio: '100px', textAlign: 'right' as const },
  { header: TEXTS.ingredients.columns.quantity, gridRatio: '90px', textAlign: 'center' as const },
  { header: TEXTS.ingredients.columns.unit, gridRatio: '110px', textAlign: 'center' as const },
  { header: TEXTS.ingredients.columns.status, gridRatio: '64px', textAlign: 'center' as const }
];

export function IngredientsPage() {
  const actions = useIngredientsActions();
  const filters = useIngredientsFilters(actions.ingredients, actions.orderProfiles);

  const closeSelectedModal = () => {
    actions.setIsEditModalOpen(false);
    actions.setIsViewModalOpen(false);
    actions.setSelectedIngredient(null);
  };

  return (
    <div className={ERP_THEME.ingredients.page.shell} data-ui-key={UI_KEYS.ingredients.page}>
      <div data-ui-key={UI_KEYS.ingredients.header}>
        <UniversalHeaderDashboard
          title={TEXTS.ingredients.page.title}
          subtitle={TEXTS.ingredients.page.subtitle}
          icon={FlaskConical}
          backPath="/home"
          kpiCards={[
            {
              label: TEXTS.ingredients.page.totalKpi,
              value: `${filters.totalIngredientsCount} ${TEXTS.ingredients.page.itemSuffix}`,
              icon: ClipboardList,
              valueColorClass: 'text-slate-800'
            },
            {
              label: TEXTS.ingredients.page.averageCostKpi,
              value: formatCurrencyBRL(filters.averagePrice),
              icon: FlaskConical,
              valueColorClass: 'text-amber-600'
            }
          ]}
        />
      </div>

      <GlobalTopTabs />

      <main className={ERP_THEME.ingredients.page.main}>
        <div data-ui-key={UI_KEYS.ingredients.search}>
          <UniversalSearchBar
            type="ingredients"
            filters={filters.activeFilters}
            onFilterChange={filters.setActiveFilters}
            orderProfiles={actions.orderProfiles}
            onSaveNewProfile={actions.handleSaveNewOrderProfile}
            onRenameProfile={actions.handleRenameOrderProfile}
            onDeleteProfile={actions.handleDeleteOrderProfile}
            onSelectProfilePositions={actions.applyProfilePositions}
            placeholder={TEXTS.ingredients.search.placeholder}
          />
        </div>

        {actions.loading ? (
          <div className={ERP_THEME.ingredients.page.loading}>
            <div className={ERP_THEME.ingredients.page.spinner} aria-label={TEXTS.ingredients.page.loading} />
          </div>
        ) : filters.filteredIngredients.length === 0 ? (
          <div className={ERP_THEME.ingredients.page.empty}>{TEXTS.ingredients.page.emptyState}</div>
        ) : (
          <DragDropContext onDragEnd={(result) => void actions.handleDragEnd(result, filters.filteredIngredients)}>
            <Droppable droppableId="ingredients-table-body">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-full block"
                  data-ui-key={UI_KEYS.ingredients.table}
                >
                  <UniversalGridTable
                    columns={INGREDIENTS_TABLE_COLUMNS}
                    data={filters.filteredIngredients}
                    isDraggableList
                    renderDraggableRow={(ingredient, index) => (
                      <UniversalRowItem
                        key={ingredient.id}
                        type="ingredients"
                        item={ingredient}
                        index={index}
                        onSwipeLeft={actions.handleToggleStatus}
                        onSwipeRight={actions.openEditModal}
                        onThumbClick={actions.openViewModal}
                      />
                    )}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>

      <button
        type="button"
        onClick={() => actions.setIsCreateModalOpen(true)}
        className={ERP_THEME.ingredients.page.createFab}
        title={TEXTS.ingredients.page.createActionTitle}
        data-ui-key={UI_KEYS.ingredients.createAction}
      >
        <PackagePlus className="w-5 h-5" />
      </button>

      <CreateIngredientModal
        isOpen={actions.isCreateModalOpen}
        onClose={() => actions.setIsCreateModalOpen(false)}
        onSave={actions.handleCreateIngredient}
      />
      <EditIngredientModal
        isOpen={actions.isEditModalOpen}
        ingredient={actions.selectedIngredient}
        onClose={closeSelectedModal}
        onSave={actions.handleUpdateIngredient}
      />
      <ViewIngredientModal
        isOpen={actions.isViewModalOpen}
        ingredient={actions.selectedIngredient}
        onClose={closeSelectedModal}
      />

      <GlobalFooterNav />
    </div>
  );
}
