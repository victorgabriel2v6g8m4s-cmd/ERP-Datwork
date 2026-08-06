import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, PackagePlus, ClipboardList } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

// API Cliente, Tipos e Componentes Universais Reciclados
import { api } from '../../api/client.ts';
import { type Ingredient } from '../../types/ingredient.ts';
import { CreateIngredientModal } from './components/CreateIngredientModal.tsx';
import { EditIngredientModal } from './components/EditIngredientModal.tsx';
import { ViewIngredientModal } from './components/ViewIngredientModal.tsx';
import { formatCurrencyBRL } from '../../utils/format.ts';
import { UniversalSearchBar, type UniversalFilters, UniversalGridTable, UniversalHeaderDashboard, GlobalTopTabs, GlobalFooterNav, UniversalRowItem } from '../../components/index.ts'

export function IngredientsPage() {
    const navigate = useNavigate();
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [orderProfiles, setOrderProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 🎛️ Controladores de estado de abertura de Modais e Seleções Ativas
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

    // 📝 Filtros universais adaptados para Insumos
    const [activeFilters, setActiveFilters] = useState<UniversalFilters>({
        search: '',
        sortBy: 'custom',
        abcCategory: 'all', // Inerte para insumos
        unitFilter: 'all',
    });

    useEffect(() => {
        fetchIngredients();
        fetchOrderProfiles();
    }, []);

    const totalIngredientsCount = ingredients.filter(i => i.status === 'ACTIVE').length;
    const averagePrice = totalIngredientsCount > 0
        ? ingredients.filter(i => i.status === 'ACTIVE').reduce((acc, i) => acc + (i.price || 0), 0) / totalIngredientsCount
        : 0;

    const fetchIngredients = async () => {
        try {
            const response = await api.get<Ingredient[]>('/ingredients');
            setIngredients(response.data.sort((a, b) => a.position - b.position));
        } catch (error) {
            console.error('🔥 Erro ao carregar insumos:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderProfiles = async () => {
        try {
            const response = await api.get('/products/orders');
            setOrderProfiles(response.data);
        } catch (error) { console.error('🔥 Erro ao buscar perfis:', error); }
    };

    // 🧠 MOTOR REATIVO UNIVERSAL DE FILTRAGEM (USEMEMO)
    const filteredIngredients = useMemo(() => {
        let result = ingredients.filter((item) => {
            if (activeFilters.unitFilter !== 'all' && item.unit !== activeFilters.unitFilter) {
                return false;
            }

            const searchLower = activeFilters.search.toLowerCase();
            if (activeFilters.search && !item.sku.toLowerCase().includes(searchLower) && !item.name.toLowerCase().includes(searchLower)) {
                return false;
            }

            return true;
        });

        if (activeFilters.sortBy.startsWith('profile-')) {
            const profileId = activeFilters.sortBy.replace('profile-', '');
            const activeProfile = orderProfiles.find(p => p.id === profileId);
            if (activeProfile) {
                const positionsMap: any[] = JSON.parse(activeProfile.positions);
                return result.sort((a, b) => {
                    const posA = positionsMap.find(p => p.id === a.id)?.position ?? 999;
                    const posB = positionsMap.find(p => p.id === b.id)?.position ?? 999;
                    return posA - posB;
                });
            }
        }

        return result.sort((a, b) => {
            if (activeFilters.sortBy === 'az') return a.name.localeCompare(b.name);
            if (activeFilters.sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (activeFilters.sortBy === 'value') return b.price - a.price;
            return a.position - b.position;
        });
    }, [ingredients, activeFilters, orderProfiles]);

    // 🔃 REORDENAÇÃO MECÂNICA VERTICAL SEM LOCKS
    const handleDragEnd = async (result: any) => {
        const { destination, source } = result;
        if (!destination) return;
        if (destination.index === source.index) return;

        if (activeFilters.sortBy !== 'custom') {
            setActiveFilters((prev) => ({ ...prev, sortBy: 'custom' }));
        }

        const reorderedFiltered = Array.from(filteredIngredients);
        const [removed] = reorderedFiltered.splice(source.index, 1);
        reorderedFiltered.splice(destination.index, 0, removed);

        const updatedIngredients = ingredients.map((ing) => {
            const newVisualIdx = reorderedFiltered.findIndex((item) => item.id === ing.id);
            if (newVisualIdx !== -1) {
                return { ...ing, position: newVisualIdx };
            }
            return ing;
        }).sort((a, b) => a.position - b.position);

        setIngredients(updatedIngredients);

        try {
            const positions = updatedIngredients.map((item) => ({ id: item.id, position: item.position }));
            await api.patch('/products/reorder', { positions });
        } catch {
            fetchIngredients();
        }
    };

    // 📡 ESTEIRA ASSÍNCRONA DE PERSISTÊNCIA (POST)
    const handleCreateIngredient = async (payload: any) => {
        try {
            const response = await api.post<Ingredient>('/ingredients', payload);
            setIngredients((prev) => [...prev, response.data].sort((a, b) => a.position - b.position));
            setIsCreateModalOpen(false);
        } catch (error: any) {
            alert(`⚠️ Erro: ${error.response?.data?.error || 'Falha ao salvar.'}`);
        }
    };

    // 📡 ESTEIRA ASSÍNCRONA DE ATUALIZAÇÃO (PUT)
    const handleUpdateIngredient = async (id: string, payload: any) => {
        try {
            const response = await api.put<Ingredient>(`/ingredients/${id}`, payload);

            setIngredients((prev) => prev.map((item) => (item.id === id ? response.data : item)));
            setIsEditModalOpen(false);
            setSelectedIngredient(null);
        } catch (error: any) {
            alert(`⚠️ Erro ao atualizar insumo: ${error.response?.data?.error || 'Falha na rede.'}`);
        }
    };

    const handleSaveNewOrderProfile = async (name: string) => {
        const currentPositions = ingredients.map((i, idx) => ({ id: i.id, position: idx }));
        try {
            await api.post('/products/orders', { name, positions: currentPositions });
            fetchOrderProfiles();
        } catch (error) { console.error(error); }
    };

    const handleRenameOrderProfile = async (id: string, name: string) => {
        try {
            await api.put(`/products/orders/${id}`, { name });
            fetchOrderProfiles();
        } catch (error) { console.error(error); }
    };

    const handleDeleteOrderProfile = async (id: string) => {
        try {
            await api.delete(`/products/orders/${id}`);
            fetchOrderProfiles();
            if (activeFilters.sortBy === `profile-${id}`) {
                setActiveFilters(prev => ({ ...prev, sortBy: 'custom' }));
            }
        } catch (error) { console.error(error); }
    };

    const handleApplyProfilePositions = (positionsMap: any[]) => {
        const reordered = [...ingredients].sort((a, b) => {
            const posA = positionsMap.find(p => p.id === a.id)?.position ?? 999;
            const posB = positionsMap.find(p => p.id === b.id)?.position ?? 999;
            return posA - posB;
        }).map((ing, index) => ({ ...ing, position: index }));
        setIngredients(reordered);
    };

    const handleSwipeLeft = async (ingredient: Ingredient) => {
        const nextStatus = ingredient.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        // Atualização otimista imediata na UI
        setIngredients((prev) =>
            prev.map((item) => (item.id === ingredient.id ? { ...item, status: nextStatus } : item))
        );

        try {
            // ✨ CORREÇÃO DA URL: Aponta com precisão para a tabela de insumos no SQLite via PATCH
            await api.patch(`/ingredients/${ingredient.id}/status`, { status: nextStatus });
        } catch (error) {
            console.error('🔥 Erro ao modificar status do insumo, executando rollback:', error);
            fetchIngredients(); // Executa rollback em caso de falha de conexão
        }
    };

    // 👉 GESTO SWIPE DIREITA CONECTADO: Abre o menu sanfona preenchido
    const handleSwipeRight = (id: string) => {
        const target = ingredients.find(i => i.id === id);
        if (target) {
            setSelectedIngredient(target);
            setIsEditModalOpen(true);
        }
    };

    // 🔍 CLIQUE NA THUMBNAIL CONECTADO: Abre o Lightbox de auditoria reversa de versões
    const handleThumbClick = (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient);
        setIsViewModalOpen(true);
    };

    const ingredientsHeaderColumns = [
        { header: 'Thumb', gridRatio: '56px', textAlign: 'center' as const },
        { header: 'SKU', gridRatio: '90px', textAlign: 'left' as const },
        { header: 'Nome / Subtítulo', gridRatio: '1fr', textAlign: 'left' as const },
        { header: 'Preço Custo', gridRatio: '100px', textAlign: 'right' as const },
        { header: 'Qtd. Estoque', gridRatio: '90px', textAlign: 'center' as const },
        { header: 'Unidade Medida', gridRatio: '110px', textAlign: 'center' as const },
        { header: 'Status', gridRatio: '64px', textAlign: 'center' as const }
    ];



    return (
        <div className="w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none">

            {/* 🔮 Header Corporativo Superior com Vetores SVG */}
            <UniversalHeaderDashboard
                title="Cadastro de Insumos"
                subtitle="Almoxarifado & Matérias-Primas de Fábrica"
                icon={FlaskConical}
                backPath="/home"
                kpiCards={[
                    {
                        label: 'Matérias-Primas',
                        value: `${totalIngredientsCount} itens`,
                        icon: ClipboardList,
                        valueColorClass: 'text-slate-800'
                    },
                    {
                        label: 'Média de Custo',
                        value: formatCurrencyBRL(averagePrice), // ✨ KPI financeiro calculado reativamente
                        icon: FlaskConical,
                        valueColorClass: 'text-amber-600'
                    }
                ]}
            />

            <GlobalTopTabs />

            {/* ⚙️ Área Central de Filtros e Dados Operacionais */}
            <main className="w-full px-6 mx-auto mt-6 space-y-4">
                <UniversalSearchBar
                    type="ingredients"
                    filters={activeFilters}
                    onFilterChange={(filters) => setActiveFilters(filters)}
                    orderProfiles={orderProfiles}
                    onSaveNewProfile={handleSaveNewOrderProfile}
                    onRenameProfile={handleRenameOrderProfile}
                    onDeleteProfile={handleDeleteOrderProfile}
                    onSelectProfilePositions={handleApplyProfilePositions}
                />

                {loading ? (
                    <div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    /* 📊 GRID ESTRUTURADO DE INSUMOS CORRIGIDO E SIMÉTRICO (CLEAN CODE) */
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="ingredients-table-body">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="w-full block">

                                    {/* ✨ TAG UNIFICADA: Mantém o layout alinhado e aciona os gestos nativos */}
                                    <UniversalGridTable
                                        columns={ingredientsHeaderColumns}
                                        data={filteredIngredients}
                                        isDraggableList={true}
                                        renderDraggableRow={(ingredient, index) => (
                                            <UniversalRowItem
                                                key={ingredient.id}
                                                type="ingredients" // Chave polimórfica para insumos
                                                item={ingredient}
                                                index={index}
                                                onSwipeLeft={handleSwipeLeft}   // Gesto Esquerda: Desativar
                                                onSwipeRight={handleSwipeRight}   // Gesto Direita: Abrir Modal de Edição
                                                onThumbClick={handleThumbClick}         // Clique: Abrir Modal de Detalhes
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

            {/* ➕ Botão Redondo Reduzido para Dispositivos Móveis (FAB) */}
            <button onClick={() => setIsCreateModalOpen(true)} className="fixed bottom-20 right-6 z-40 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-indigo-500/20"><PackagePlus className="w-5 h-5" /></button>

            {/* Modais Atômicos Acoplados */}
            <CreateIngredientModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={handleCreateIngredient} />
            <EditIngredientModal isOpen={isEditModalOpen} ingredient={selectedIngredient} onClose={() => { setIsEditModalOpen(false); setSelectedIngredient(null); }} onSave={handleUpdateIngredient} />
            <ViewIngredientModal isOpen={isViewModalOpen} ingredient={selectedIngredient} onClose={() => { setIsViewModalOpen(false); setSelectedIngredient(null); }} />

            <GlobalFooterNav />
        </div>
    );
}
