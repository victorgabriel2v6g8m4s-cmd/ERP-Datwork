import { useEffect } from 'react';
import { FlaskConical, PackagePlus, ClipboardList } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

// Componentes Universais Reutilizados do ERP (Barrel)
import { UniversalSearchBar, UniversalGridTable, UniversalHeaderDashboard, GlobalTopTabs, GlobalFooterNav, UniversalRowItem } from '../../components/index.ts';
import { formatCurrencyBRL } from '../../utils/format.ts';

// Modais Atômicos do Escope de Insumos
import { CreateIngredientModal } from './components/CreateIngredientModal.tsx';
import { EditIngredientModal } from './components/EditIngredientModal.tsx';
import { ViewIngredientModal } from './components/ViewIngredientModal.tsx';

// Ganchos de Operação Isolados (Hooks)
import { useIngredientsActions } from './hooks/useIngredientsActions.ts';
import { useIngredientsFilters } from './hooks/useIngredientsFilters.ts';

const INGREDIENTS_TABLE_COLUMNS = [
    { header: 'Thumb', gridRatio: '56px', textAlign: 'center' as const },
    { header: 'SKU', gridRatio: '90px', textAlign: 'left' as const },
    { header: 'Nome / Subtítulo', gridRatio: '1fr', textAlign: 'left' as const },
    { header: 'Preço Custo', gridRatio: '100px', textAlign: 'right' as const },
    { header: 'Qtd. Estoque', gridRatio: '90px', textAlign: 'center' as const },
    { header: 'Unidade Medida', gridRatio: '110px', textAlign: 'center' as const },
    { header: 'Status', gridRatio: '64px', textAlign: 'center' as const }
];

export function IngredientsPage() {
    const actionsState = useIngredientsActions();
    const filters = useIngredientsFilters(actionsState.ingredients, actionsState.orderProfiles);

    // 🚀 DISPARADOR DE CARGA INICIAL: Força o batimento das rotas ao montar a tela
    useEffect(() => {
        actionsState.fetchIngredients();
        actionsState.fetchOrderProfiles();
    }, []);

    return (
        <div className="w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none">

            {/* Header Corporativo Superior */}
            <UniversalHeaderDashboard
                title="Cadastro de Insumos"
                subtitle="Almoxarifado & Matérias-Primas de Fábrica"
                icon={FlaskConical}
                backPath="/home"
                kpiCards={[
                    { label: 'Matérias-Primas', value: `${filters.totalIngredientsCount} itens`, icon: ClipboardList, valueColorClass: 'text-slate-800' },
                    { label: 'Média de Custo', value: formatCurrencyBRL(filters.averagePrice), icon: FlaskConical, valueColorClass: 'text-amber-600' }
                ]}
            />

            <GlobalTopTabs />

            {/* Área Central Operacional */}
            <main className="w-full px-6 mx-auto mt-6 space-y-4">
                <UniversalSearchBar
                    type="ingredients" filters={filters.activeFilters} onFilterChange={(f) => filters.setActiveFilters(f)} orderProfiles={actionsState.orderProfiles}
                    onSaveNewProfile={actionsState.handleSaveNewOrderProfile} onRenameProfile={actionsState.handleRenameOrderProfile} onDeleteProfile={actionsState.handleDeleteOrderProfile}
                    onSelectProfilePositions={(pos) => actionsState.setIngredients(filters.handleApplyProfilePositions(pos))}
                />

                {actionsState.loading ? (
                    <div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <DragDropContext onDragEnd={actionsState.actions.handleDragEnd}>
                        <Droppable droppableId="ingredients-table-body">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="w-full block">

                                    <UniversalGridTable
                                        columns={INGREDIENTS_TABLE_COLUMNS}
                                        data={filters.filteredIngredients}
                                        isDraggableList={true}
                                        renderDraggableRow={(ingredient, index) => (
                                            <UniversalRowItem
                                                key={ingredient.id} type="ingredients" item={ingredient} index={index}
                                                onSwipeLeft={(item) => actionsState.actions.triggerSoftDelete(item as any, 'INACTIVE', 'ACTIVE')} // Swipe Left: Aciona Soft-Delete Seguro
                                                onSwipeRight={(id) => actionsState.actions.openEditModal(id)}                  // Swipe Right: Edição Direta
                                                onThumbClick={(item) => actionsState.actions.openViewModal(item as any)}       // Clique Thumb: Abre Resumo Mestre
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

            {/* ➕ Botão de Ação Flutuante Redondo (FAB) */}
            <button onClick={() => actionsState.setIsCreateModalOpen(true)} className="fixed bottom-20 right-6 z-40 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-indigo-500/20">
                <PackagePlus className="w-5 h-5" />
            </button>

            {/* Modais Atômicos Acoplados ao Barramento Genérico */}
            <CreateIngredientModal isOpen={actionsState.isCreateModalOpen} onClose={() => actionsState.setIsCreateModalOpen(false)} onSave={actionsState.handleCreateIngredient} />
            <EditIngredientModal isOpen={actionsState.isEditModalOpen} ingredient={actionsState.selectedIngredient} onClose={() => { actionsState.setIsEditModalOpen(false); actionsState.setSelectedIngredient(null); }} onSave={actionsState.handleUpdateIngredient} />
            <ViewIngredientModal isOpen={actionsState.isViewModalOpen} ingredient={actionsState.selectedIngredient} onClose={() => { actionsState.setIsViewModalOpen(false); actionsState.setSelectedIngredient(null); }} />


            <GlobalFooterNav />
        </div>
    );
}
