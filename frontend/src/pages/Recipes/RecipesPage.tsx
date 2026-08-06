import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, PackagePlus, AlertTriangle } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { AnimatePresence, motion } from 'framer-motion';

// API Cliente, Tipos e Componentes Universais e Atômicos
import { api } from '../../api/client.ts';
import { type Recipe } from '../../types/recipe.ts';
import { formatCurrencyBRL } from '../../utils/format.ts';
import { RecipeCardItem } from './components/RecipeCardItem.tsx';
import { ViewRecipeModal } from './components/ViewRecipeModal.tsx';
import { CreateRecipeModal } from './components/CreateRecipeModal.tsx';
import { EditRecipeModal } from './components/EditRecipeModal.tsx';
import { UniversalSearchBar, type UniversalFilters, UniversalHeaderDashboard, GlobalTopTabs, GlobalFooterNav } from '../../components/index.ts'

export function RecipesPage() {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    // Controladores de estado de abertura de Modais e Seleções Ativas
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [recipeToCancel, setRecipeToCancel] = useState<Recipe | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [activeFilters, setActiveFilters] = useState<UniversalFilters>({
        search: '',
        sortBy: 'custom',
        abcCategory: 'all',
        unitFilter: 'all',
    });

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            const response = await api.get<Recipe[]>('/recipes');
            setRecipes(response.data.sort((a, b) => a.position - b.position));
        } catch (error) { console.error('🔥 Erro ao carregar receitas:', error); }
        finally { setLoading(false); }
    };

    // MOTOR REATIVO UNIVERSAL DE FILTRAGEM (USEMEMO)
    const stats = useMemo(() => {
        let result = recipes.filter((item) => {
            // 🛡️ BLINDAGEM 1: Se a receita não possuir um produto válido associado (null), ignora para evitar erros
            if (!item.product) return false;

            const searchLower = activeFilters.search.toLowerCase();
            if (activeFilters.search &&
                !item.product.sku?.toLowerCase().includes(searchLower) &&
                !item.product.name?.toLowerCase().includes(searchLower)) {
                return false;
            }
            return true;
        });

        result.sort((a, b) => {
            if (activeFilters.sortBy === 'az') return (a.product?.name || '').localeCompare(b.product?.name || '');
            if (activeFilters.sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

            // 🧮 Ordenação segura utilizando o operador opcional ?.
            if (activeFilters.sortBy === 'batch-cost-desc') {
                const costA = (a.product?.recipeCostPerUnit || 0) * (a.product?.unitsPerBatch || 1);
                const costB = (b.product?.recipeCostPerUnit || 0) * (b.product?.unitsPerBatch || 1);
                return costB - costA;
            }
            if (activeFilters.sortBy === 'unit-cost-desc') {
                return (b.product?.recipeCostPerUnit || 0) - (a.product?.recipeCostPerUnit || 0);
            }
            if (activeFilters.sortBy === 'units-batch-desc') {
                return (b.product?.unitsPerBatch || 0) - (a.product?.unitsPerBatch || 0);
            }
            return a.position - b.position;
        });

        // 🧮 CÁLCULO DE PARÂMETROS FINANCEIROS COM TRAVA CONTRA NULOS (NULL-SAFE)
        const total = result.filter(r => r.status === 'ACTIVE').length;

        // 🛡️ BLINDAGEM 2: Adicionado o operador ?. nas propriedades do product para estancar o crash fatal
        const sumCost = result
            .filter(r => r.status === 'ACTIVE')
            .reduce((acc, r) => acc + ((r.product?.recipeCostPerUnit || 0) * (r.product?.unitsPerBatch || 1)), 0);

        const average = total > 0 ? sumCost / total : 0;

        return {
            filteredRecipes: result,
            totalRecipes: total,
            averageBatchCost: average
        };
    }, [recipes, activeFilters]);

    const { filteredRecipes, totalRecipes, averageBatchCost } = stats;

    // 🔃 REORDENAÇÃO MECÂNICA VERTICAL DE CARDS (DRAG AND DROP)
    const handleDragEnd = async (result: any) => {
        const { destination, source } = result;
        if (!destination) return;
        if (destination.index === source.index) return;

        if (activeFilters.sortBy !== 'custom') {
            setActiveFilters((prev) => ({ ...prev, sortBy: 'custom' }));
        }

        const items = Array.from(filteredRecipes);
        const [removed] = items.splice(source.index, 1);
        items.splice(destination.index, 0, removed);

        const updatedRecipes = recipes.map((rec) => {
            const newVisualIdx = items.findIndex((i) => i.id === rec.id);
            if (newVisualIdx !== -1) {
                return { ...rec, position: newVisualIdx };
            }
            return rec;
        }).sort((a, b) => a.position - b.position);

        setRecipes(updatedRecipes);

        try {
            const positions = updatedRecipes.map((item) => ({ id: item.id, position: item.position }));

            // ✨ CORREÇÃO CIRÚRGICA: Aponta para a tabela 'recipes' em lote no backend
            await api.patch('/recipes/reorder', { positions });
        } catch {
            fetchRecipes();
        }
    };

    const handleTriggerSwipeLeft = (recipe: Recipe) => {
        setRecipeToCancel(recipe);
    };

    const handleConfirmCancelRecipe = async () => {
        if (!recipeToCancel) return;
        const nextStatus = recipeToCancel.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        setRecipes((prev) => prev.map((item) => (item.id === recipeToCancel.id ? { ...item, status: nextStatus } : item)));
        setRecipeToCancel(null);

        try {
            // ✨ CORREÇÃO CIRÚRGICA: Alterado de '/products/...' para '/recipes/...' no PATCH de status do SQLite
            await api.patch(`/recipes/${recipeToCancel.id}/status`, { status: nextStatus });
        } catch {
            fetchRecipes();
        }
    };

    const handleCreateRecipe = async (payload: any) => {
        try {
            await api.post('/recipes', payload);
            fetchRecipes();
            setIsCreateModalOpen(false);
        } catch (error: any) { alert(`⚠️ Erro: ${error.response?.data?.error || 'Falha ao salvar.'}`); }
    };

    const handleCardClick = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setIsViewModalOpen(true);
    };

    const handleSampleRightEdit = (id: string) => {
        const target = recipes.find(r => r.id === id);
        if (target) {
            setSelectedRecipe(target);
            setIsEditModalOpen(true); // ✨ Dispara a abertura do menu de sanfonas
        }
    };

    const handleUpdateRecipe = async (id: string, payload: any) => {
        try {
            await api.put(`/recipes/${id}`, payload);
            fetchRecipes(); // Atualiza em lote com os novos custos
            setIsEditModalOpen(false);
            setSelectedRecipe(null);
        } catch (error: any) {
            alert(`⚠️ Erro ao atualizar: ${error.response?.data?.error || 'Falha na rede.'}`);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none">

            {/* 🔮 Header Corporativo Superior Fixado com Resumo de Indicadores */}
            <UniversalHeaderDashboard
                title="Fichas Técnicas"
                subtitle="Engenharia de Insumos & Estruturação de Lotes"
                icon={ChefHat}
                iconColorClass="text-emerald-600" // Cor verde esmeralda característica do eixo
                backPath="/home"
                kpiCards={[
                    {
                        label: 'Fichas Ativas',
                        value: `${totalRecipes} un.`, // ✨ KPI reativo baseado nos filtros ativos da tela
                        icon: ChefHat,
                        valueColorClass: 'text-slate-800'
                    },
                    {
                        label: 'Custo Médio Lote',
                        value: formatCurrencyBRL(averageBatchCost), // ✨ Métrica financeira calculada em tempo real pelo useMemo
                        icon: ChefHat,
                        valueColorClass: 'text-emerald-600'
                    }
                ]}
            />

            {/* 🎛️ Barramento Unificado de Abas de Eixo do ERP (Flutua em Sticky no topo) */}
            <GlobalTopTabs />

            {/* ⚙️ Área Central de Operações do Filtro e Fila DND */}
            <main className="w-full px-6 mx-auto mt-6 space-y-4">

                {/* Barra de Busca e Filtros Polimórficos */}
                <UniversalSearchBar
                    type="recipes"
                    filters={activeFilters}
                    onFilterChange={(f) => setActiveFilters(f)}
                    orderProfiles={[]}
                    onSaveNewProfile={async () => { }}
                    onRenameProfile={async () => { }}
                    onDeleteProfile={async () => { }}
                    onSelectProfilePositions={() => { }}
                />

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    /* 📋 LISTAGEM COM SUPORTE TÁTIL BILATERAL COMPLETO (CLEAN CODE) */
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="recipes-cards-list">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="space-y-3 block w-full"
                                >
                                    {filteredRecipes.map((recipe, index) => (
                                        /* ✨ VINCULAÇÃO ATÔMICA PROTEGIDA CONTRA HOOKS CRASH */
                                        <RecipeCardItem
                                            key={recipe.id}
                                            recipe={recipe}
                                            index={index}
                                            onSwipeLeft={handleTriggerSwipeLeft}  // Arrasto Esquerda: Exclusão Lógica
                                            onSwipeRight={handleSampleRightEdit} // Arrasto Direita: Sanfonas de Edição
                                            onCardClick={handleCardClick}        // Clique: Ficha Técnica de Leitura
                                        />
                                    ))}
                                    {provided.placeholder}

                                    {filteredRecipes.length === 0 && (
                                        <div className="text-center py-12 bg-white border rounded-2xl border-slate-200/80 text-slate-400 font-bold text-xs uppercase tracking-wider block w-full">
                                            Nenhuma receita vinculada com os critérios fornecidos.
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </main>

            {/* ➕ Botão Redondo FAB de Criação de Novas Fichas Técnicas */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-20 right-6 z-40 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-indigo-500/20"
                title="Cadastrar Nova Ficha Técnica"
            >
                <PackagePlus className="w-5 h-5" />
            </button>

            {/* 📦 ESTEIRA DE JANELAS E MODAIS CONDICIONAIS */}
            <CreateRecipeModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={handleCreateRecipe} />
            <ViewRecipeModal isOpen={isViewModalOpen} recipe={selectedRecipe} onClose={() => { setIsViewModalOpen(false); setSelectedRecipe(null); }} />

            {/* ✨ Modal de Edição com Menu de Sanfona Acoplado Reativamente */}
            <EditRecipeModal
                isOpen={isEditModalOpen}
                recipe={selectedRecipe}
                onClose={() => { setIsEditModalOpen(false); setSelectedRecipe(null); }}
                onSave={handleUpdateRecipe}
            />

            {/* 🛡️ POPUP DE CONFIRMAÇÃO FLUTUANTE DE STATUS (RECICLADO DA AGENDA) */}
            <AnimatePresence>
                {recipeToCancel && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 border border-slate-100 shadow-xl"
                        >
                            <div className="flex items-center gap-2 text-rose-600">
                                <AlertTriangle className="w-5 h-5" />
                                <h3 className="font-black text-slate-800 text-sm">
                                    {recipeToCancel.status === 'ACTIVE' ? 'Deseja desativar esta receita?' : 'Deseja reativar esta receita?'}
                                </h3>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Esta ação alterará o status operacional da ficha técnica do produto <span className="font-bold text-slate-700">"{recipeToCancel.product.name}"</span> temporariamente no banco de dados.
                            </p>
                            <div className="flex gap-2 font-bold pt-2">
                                <button type="button" onClick={() => setRecipeToCancel(null)} className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">Voltar</button>
                                <button type="button" onClick={handleConfirmCancelRecipe} className="flex-1 py-2 bg-rose-600 text-white rounded-xl cursor-pointer hover:bg-rose-700 transition-colors shadow-md shadow-rose-100">Confirmar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Menu de Navegação Inferior Descongestionado */}
            <GlobalFooterNav />
        </div>
    );
}