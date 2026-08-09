import { useEffect } from 'react';
import { PackagePlus, SlidersHorizontal, Package } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import {
    UniversalSearchBar,
    UniversalGridTable,
    UniversalHeaderDashboard,
    GlobalTopTabs,
    GlobalFooterNav,
    UniversalRowItem
} from '../../components/index.ts';

import { CreateProductModal } from './components/CreateProductModal.tsx';
import { EditProductModal } from './components/EditProductModal.tsx';
import { ViewProductModal } from './components/ViewProductModal.tsx';
import { useProductsActions } from './hooks/useProductsActions.ts';
import { useProductsFilters } from './hooks/useProductsFilters.ts';
import { PRODUCTS_TABLE_COLUMNS } from './constants/products.constants.ts';

export function ProductsPage() {
    const actionsState = useProductsActions();
    const filters = useProductsFilters(actionsState.products, actionsState.orderProfiles);

    useEffect(() => {
        actionsState.fetchProducts();
        actionsState.fetchOrderProfiles();
    }, []);

    const handleDragEnd = async (result: any) => {
        if (!result.destination || result.destination.index === result.source.index) return;

        if (filters.activeFilters.sortBy !== 'custom') {
            filters.setActiveFilters((current) => ({ ...current, sortBy: 'custom' }));
        }

        await actionsState.actions.handleDragEnd(result, filters.filteredProducts);
    };

    const handleDeleteOrderProfile = async (id: string) => {
        await actionsState.handleDeleteOrderProfile(id);

        if (filters.activeFilters.sortBy === `profile-${id}`) {
            filters.setActiveFilters((current) => ({ ...current, sortBy: 'custom' }));
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none">
            <UniversalHeaderDashboard
                title="Gestão de Produtos"
                subtitle="Catálogo Comercial & Insumos"
                icon={Package}
                backPath="/home"
                kpiCards={[
                    {
                        label: 'Itens Ativos',
                        value: `${filters.activeProductsCount} un.`,
                        icon: Package,
                        valueColorClass: 'text-indigo-600'
                    }
                ]}
                actionButtons={[
                    {
                        icon: SlidersHorizontal,
                        onClick: () => { },
                        title: 'Configurações de exibição da grade'
                    }
                ]}
            />

            <GlobalTopTabs />

            <main className="w-full px-6 mx-auto mt-6 space-y-4">
                <UniversalSearchBar
                    type="products"
                    filters={filters.activeFilters}
                    onFilterChange={filters.setActiveFilters}
                    orderProfiles={actionsState.orderProfiles}
                    onSaveNewProfile={actionsState.handleSaveNewOrderProfile}
                    onRenameProfile={actionsState.handleRenameOrderProfile}
                    onDeleteProfile={handleDeleteOrderProfile}
                    onSelectProfilePositions={(positions) =>
                        actionsState.setProducts(filters.applyProfilePositions(positions))
                    }
                />

                {actionsState.loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="products-table-body">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="w-full block">
                                    <UniversalGridTable
                                        columns={PRODUCTS_TABLE_COLUMNS}
                                        data={filters.filteredProducts}
                                        isDraggableList={true}
                                        renderDraggableRow={(product, index) => (
                                            <UniversalRowItem
                                                key={product.id}
                                                type="products"
                                                item={product}
                                                index={index}
                                                onSwipeLeft={(item) =>
                                                    actionsState.actions.triggerSoftDelete(item, 'INACTIVE', 'ACTIVE')
                                                }
                                                onSwipeRight={(id) => actionsState.actions.openEditModal(id)}
                                                onThumbClick={(item) => actionsState.actions.openViewModal(item)}
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
                onClick={() => actionsState.setIsCreateModalOpen(true)}
                className="fixed bottom-20 right-6 z-40 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-indigo-500/20"
                title="Cadastrar Novo Produto"
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
