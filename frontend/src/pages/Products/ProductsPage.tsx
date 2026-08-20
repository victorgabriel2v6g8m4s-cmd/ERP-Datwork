import { useEffect } from 'react';
import { PackagePlus, SlidersHorizontal, Package } from 'lucide-react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import type { Product } from '../../types/product.ts';

import {
    UniversalSearchBar,
    UniversalGridTable,
    UniversalHeaderDashboard,
    GlobalTopTabs,
    GlobalFooterNav,
    UniversalRowItem,
    AsyncCollectionState
} from '../../components/index.ts';
import { ROUTE_PATHS } from '../../config/routes.config.ts';
import { SYSTEM_TEXTS } from '../../i18n/system.ts';
import { SYSTEM_THEME } from '../../theme/system.ts';

import { CreateProductModal } from './components/CreateProductModal.tsx';
import { EditProductModal } from './components/EditProductModal.tsx';
import { ViewProductModal } from './components/ViewProductModal.tsx';
import { useProductsActions } from './hooks/useProductsActions.ts';
import { useProductsFilters } from './hooks/useProductsFilters.ts';
import { PRODUCTS_TABLE_COLUMNS } from './constants/products.constants.ts';
import type { ProductOrderPosition } from './services/products.service.ts';

export function ProductsPage() {
    const actionsState = useProductsActions();
    const filters = useProductsFilters(actionsState.products, actionsState.orderProfiles);
    const { fetchOrderProfiles, fetchProducts } = actionsState;

    useEffect(() => {
        void fetchProducts();
        void fetchOrderProfiles();
    }, [fetchOrderProfiles, fetchProducts]);

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination || result.destination.index === result.source.index) return;

        if (filters.activeFilters.sortBy !== 'custom') {
            filters.setActiveFilters((current) => ({ ...current, sortBy: 'custom' }));
        }

        await actionsState.actions.handleVisibleDragEnd(result, filters.filteredProducts);
    };

    const handleDeleteOrderProfile = async (id: string) => {
        await actionsState.handleDeleteOrderProfile(id);

        if (filters.activeFilters.sortBy === `profile-${id}`) {
            filters.setActiveFilters((current) => ({ ...current, sortBy: 'custom' }));
        }
    };

    return (
        <div className={SYSTEM_THEME.catalog.shell}>
            <UniversalHeaderDashboard
                title={SYSTEM_TEXTS.products.title}
                subtitle={SYSTEM_TEXTS.products.subtitle}
                icon={Package}
                backPath={ROUTE_PATHS.home}
                kpiCards={[
                    {
                        label: SYSTEM_TEXTS.products.activeItems,
                        value: `${filters.activeProductsCount} ${SYSTEM_TEXTS.products.unitSuffix}`,
                        icon: Package,
                        valueColorClass: 'text-indigo-600'
                    }
                ]}
                actionButtons={[
                    {
                        icon: SlidersHorizontal,
                        onClick: () => { },
                        title: SYSTEM_TEXTS.products.gridSettings
                    }
                ]}
            />

            <GlobalTopTabs />

            <main className={SYSTEM_THEME.catalog.main}>
                <UniversalSearchBar
                    type="products"
                    filters={filters.activeFilters}
                    onFilterChange={filters.setActiveFilters}
                    orderProfiles={actionsState.orderProfiles}
                    onSaveNewProfile={actionsState.handleSaveNewOrderProfile}
                    onRenameProfile={actionsState.handleRenameOrderProfile}
                    onDeleteProfile={handleDeleteOrderProfile}
                    placeholder={SYSTEM_TEXTS.products.searchPlaceholder}
                    onSelectProfilePositions={(positions: ProductOrderPosition[]) =>
                        actionsState.setProducts(filters.applyProfilePositions(positions))
                    }
                />

                <AsyncCollectionState
                    isLoading={actionsState.loading}
                    errorMessage={actionsState.loadError}
                    isEmpty={filters.filteredProducts.length === 0}
                    onRetry={() => void fetchProducts()}
                    emptyTitle={SYSTEM_TEXTS.products.emptyTitle}
                    emptyDescription={SYSTEM_TEXTS.products.emptyDescription}
                >
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="products-table-body">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="w-full block">
                                    <UniversalGridTable
                                        columns={PRODUCTS_TABLE_COLUMNS}
                                        data={filters.filteredProducts}
                                        isDraggableList={true}
                                        renderDraggableRow={(product: Product, index: number) => (
                                            <UniversalRowItem
                                                key={product.id}
                                                type="products"
                                                item={product}
                                                index={index}
                                                onSwipeLeft={(item: Product) =>
                                                    void actionsState.actions.toggleStatus(item)
                                                }
                                                onSwipeRight={(id) => actionsState.actions.openEditModal(id)}
                                                onThumbClick={(item: Product) => actionsState.actions.openViewModal(item)}
                                            />
                                        )}
                                    />
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </AsyncCollectionState>
            </main>

            <button
                type="button"
                onClick={() => actionsState.setIsCreateModalOpen(true)}
                className={SYSTEM_THEME.catalog.createFab}
                title={SYSTEM_TEXTS.products.createAction}
                aria-label={SYSTEM_TEXTS.products.createAction}
            >
                <PackagePlus className="w-5 h-5" />
            </button>

            <CreateProductModal
                isOpen={actionsState.isCreateModalOpen}
                onClose={() => actionsState.setIsCreateModalOpen(false)}
                onSave={actionsState.handleCreateProduct}
            />

            <EditProductModal
                isOpen={actionsState.isEditModalOpen}
                product={actionsState.selectedProduct}
                onClose={() => {
                    actionsState.setIsEditModalOpen(false);
                    actionsState.setSelectedProduct(null);
                }}
                onSave={actionsState.handleUpdateProduct}
            />

            <ViewProductModal
                isOpen={actionsState.isViewModalOpen}
                product={actionsState.selectedProduct}
                onClose={() => {
                    actionsState.setIsViewModalOpen(false);
                    actionsState.setSelectedProduct(null);
                }}
            />

            <GlobalFooterNav />
        </div>
    );
}
