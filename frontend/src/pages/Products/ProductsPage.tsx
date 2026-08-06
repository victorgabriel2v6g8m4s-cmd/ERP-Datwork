import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, SlidersHorizontal, Package } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

// API Cliente, Tipos e Componentes Universais Reciclados
import { api } from '../../api/client.ts';
import { type Product } from '../../types/product.ts';
import { CreateProductModal } from './components/CreateProductModal.tsx';
import { EditProductModal } from './components/EditProductModal.tsx';
import { ViewProductModal } from './components/ViewProductModal.tsx';
import { UniversalSearchBar, type UniversalFilters, UniversalGridTable, UniversalHeaderDashboard, GlobalTopTabs, GlobalFooterNav, UniversalRowItem } from '../../components/index.ts'

export function ProductsPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [orderProfiles, setOrderProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // 📝 Tipagem e inicialização do Filtro Universal adaptado para Produtos
    const [activeFilters, setActiveFilters] = useState<UniversalFilters>({
        search: '',
        sortBy: 'custom',
        abcCategory: 'all',
        unitFilter: 'all', // Inerte para produtos
    });

    useEffect(() => {
        fetchProducts();
        fetchOrderProfiles();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get<Product[]>('/products');
            setProducts(response.data.sort((a, b) => a.position - b.position));
        } catch (error) { console.error('🔥 Erro:', error); }
        finally { setLoading(false); }
    };

    const fetchOrderProfiles = async () => {
        try {
            const response = await api.get('/products/orders');
            setOrderProfiles(response.data);
        } catch (error) { console.error('🔥 Erro perfis:', error); }
    };

    // 🧠 MOTOR REATIVO UNIVERSAL
    const filteredProducts = useMemo(() => {
        let result = products.filter((item) => {
            const searchLower = activeFilters.search.toLowerCase();

            // Filtro por termo de busca (SKU, Nome ou Marca)
            if (activeFilters.search &&
                !item.sku.toLowerCase().includes(searchLower) &&
                !item.name.toLowerCase().includes(searchLower) &&
                !(item.brand && item.brand.toLowerCase().includes(searchLower))) {
                return false;
            }

            // Filtro por Curva ABC
            if (activeFilters.abcCategory !== 'all' && item.abcCategory !== activeFilters.abcCategory) {
                return false;
            }

            return true;
        });

        // Ordenação Estável
        return result.sort((a, b) => {
            if (activeFilters.sortBy === 'az') return a.name.localeCompare(b.name);
            if (activeFilters.sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (activeFilters.sortBy === 'value') return b.totalUnitCost - a.totalUnitCost; // Ordena por custo total unitário
            return a.position - b.position; // Ordem customizada por arrasto tátil
        });
    }, [products, activeFilters]);

    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;

        if (activeFilters.sortBy !== 'custom') {
            setActiveFilters((prev) => ({ ...prev, sortBy: 'custom' }));
        }

        const items = Array.from(filteredProducts);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedProducts = products.map((prod) => {
            const foundIdx = items.findIndex((i) => i.id === prod.id);
            return foundIdx !== -1 ? { ...prod, position: foundIdx } : prod;
        }).sort((a, b) => a.position - b.position);

        setProducts(updatedProducts);

        try {
            const positions = updatedProducts.map((item) => ({ id: item.id, position: item.position }));
            await api.patch('/products/reorder', { positions });
        } catch (error) { console.error('🔥 Erro:', error); fetchProducts(); }
    };

    const handleSaveNewOrderProfile = async (name: string) => {
        const currentPositions = products.map((p, index) => ({ id: p.id, position: index }));
        try {
            await api.post('/products/orders', { name, positions: currentPositions });
            fetchOrderProfiles();
        } catch (error) { console.error('🔥 Erro:', error); }
    };

    const handleRenameOrderProfile = async (id: string, name: string) => {
        try {
            await api.put(`/products/orders/${id}`, { name });
            fetchOrderProfiles();
        } catch (error) { console.error('🔥 Erro:', error); }
    };

    const handleDeleteOrderProfile = async (id: string) => {
        try {
            await api.delete(`/products/orders/${id}`);
            fetchOrderProfiles();
            if (activeFilters.sortBy === `profile-${id}`) {
                setActiveFilters(prev => ({ ...prev, sortBy: 'custom' }));
            }
        } catch (error) { console.error('🔥 Erro:', error); }
    };

    const handleApplyProfilePositions = (positionsMap: any[]) => {
        const reordered = [...products].sort((a, b) => {
            const posA = positionsMap.find(p => p.id === a.id)?.position ?? 999;
            const posB = positionsMap.find(p => p.id === b.id)?.position ?? 999;
            return posA - posB;
        }).map((prod, index) => ({ ...prod, position: index }));
        setProducts(reordered);
    };

    const handleCreateProduct = async (payload: any) => {
        try {
            const response = await api.post<Product>('/products', payload);
            setProducts((prev) => [...prev, response.data].sort((a, b) => a.position - b.position));
            setIsCreateModalOpen(false);
        } catch (error: any) { alert(`⚠️ Erro: ${error.response?.data?.error || 'Falha ao salvar produto.'}`); }
    };

    const handleUpdateProduct = async (id: string, payload: any) => {
        try {
            const response = await api.put<Product>(`/products/${id}`, payload);
            setProducts((prev) => prev.map((item) => (item.id === id ? response.data : item)));
            setIsEditModalOpen(false);
            setSelectedProduct(null);
        } catch (error: any) { alert(`⚠️ Erro ao atualizar: ${error.response?.data?.error || 'Falha na rede.'}`); }
    };

    const handleSwipeLeft = async (product: Product) => {
        const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setProducts((prev) => prev.map((item) => (item.id === product.id ? { ...item, status: nextStatus } : item)));
        try { await api.patch(`/products/${product.id}/status`, { status: nextStatus }); }
        catch { fetchProducts(); }
    };

    const handleSwipeRight = (id: string) => {
        const target = products.find(p => p.id === id);
        if (target) {
            setSelectedProduct(target);
            setIsEditModalOpen(true);
        }
    };

    const handleThumbClick = (product: Product) => {
        setSelectedProduct(product);
        setIsViewModalOpen(true);
    };

    const productsHeaderColumns = [
        { header: 'Thumb', gridRatio: '56px', textAlign: 'center' as const },
        { header: 'SKU', gridRatio: '75px', textAlign: 'left' as const },
        { header: 'Nome / Marca', gridRatio: '1fr', textAlign: 'left' as const },
        { header: 'Custo Lote', gridRatio: '95px', textAlign: 'right' as const },
        { header: 'Un. Lote', gridRatio: '65px', textAlign: 'center' as const },
        { header: 'Custo Prod.', gridRatio: '95px', textAlign: 'right' as const },
        { header: 'Custo Total', gridRatio: '95px', textAlign: 'right' as const },
        { header: 'Curva', gridRatio: '64px', textAlign: 'center' as const },
        { header: 'Status', gridRatio: '64px', textAlign: 'center' as const }
    ];


    return (
        <div className="w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none">

            {/* 🔮 Header Corporativo Superior com Vetores SVG */}
            <UniversalHeaderDashboard
                title="Gestão de Produtos"
                subtitle="Catálogo Comercial & Insumos"
                icon={Package}
                backPath="/home"
                kpiCards={[
                    {
                        label: 'Itens Ativos',
                        value: `${filteredProducts.length} un.`, // ✨ KPI reativo baseado nos filtros da tela
                        icon: Package,
                        valueColorClass: 'text-indigo-600'
                    }
                ]}
                actionButtons={[
                    {
                        icon: SlidersHorizontal,
                        onClick: () => { }, // Gatilho opcional para filtros avançados no futuro
                        title: 'Configurações de exibição da grade'
                    }
                ]}
            />

            <GlobalTopTabs />

            {/* ⚙️ Área Central de Filtros e Dados Operacionais */}
            <main className="w-full px-6 mx-auto mt-6 space-y-4">

                {/* ✨ RECICLADO EM DEFINITIVO: Passa a flag 'products' de forma transparente */}
                <UniversalSearchBar
                    type="products"
                    filters={activeFilters}
                    onFilterChange={(filters) => setActiveFilters(filters)}
                    orderProfiles={orderProfiles}
                    onSaveNewProfile={handleSaveNewOrderProfile}
                    onRenameProfile={handleRenameOrderProfile}
                    onDeleteProfile={handleDeleteOrderProfile}
                    onSelectProfilePositions={handleApplyProfilePositions}
                />

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    /* 📊 GRID ESTRUTURADO DE PRODUTOS COM CONTEXTO DE ARRASTE TÁTIL (CLEAN CODE) */
                    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-3xs overflow-hidden">
                        <div className="overflow-x-auto w-full">
                            <div className="w-full min-w-[768px]">

                                {/* 🔃 Injeta os Motores do Drag and Drop de forma contínua baseada em Divs */}
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="products-table-body">
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="w-full block">

                                                {/* ✨ TAG UNIFICADA: Controla o esqueleto da tabela full-width e injeta as linhas de gestos */}
                                                <UniversalGridTable
                                                    columns={productsHeaderColumns}
                                                    data={filteredProducts}
                                                    isDraggableList={true}
                                                    renderDraggableRow={(product, index) => (
                                                        <UniversalRowItem
                                                            key={product.id}
                                                            type="products"
                                                            item={product}
                                                            index={index}
                                                            onSwipeLeft={handleSwipeLeft}    // Gesto Esquerda: Abre modal de Excluir/Desativar
                                                            onSwipeRight={handleSwipeRight}  // Gesto Direita: Abre modal de Edição Sanfona
                                                            onThumbClick={handleThumbClick}  // Clique na Capa: Abre modal de Visualização
                                                        />
                                                    )}
                                                />

                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>

                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ➕ Botão Redondo Reduzido para Dispositivos Móveis (FAB) */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-20 right-6 z-40 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-indigo-500/20"
                title="Cadastrar Novo Produto"
            >
                <PackagePlus className="w-5 h-5" />
            </button>

            {/* 📦 1. Modal de Criação Baseado em Assistente Fatiado */}
            <CreateProductModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateProduct}
            />

            {/* 🛠️ 2. Modal de Edição Avançada Baseado em Menu Sanfona */}
            <EditProductModal
                isOpen={isEditModalOpen}
                product={selectedProduct}
                onClose={() => { setIsEditModalOpen(false); setSelectedProduct(null); }}
                onSave={handleUpdateProduct}
            />

            {/* 🔍 3. Modal de Leitura Resumo e Histórico Cronológico de Versões */}
            <ViewProductModal
                isOpen={isViewModalOpen}
                product={selectedProduct}
                onClose={() => { setIsViewModalOpen(false); setSelectedProduct(null); }}
            />

            {/* Barra de Navegação de Rodapé Dividida Igualmente */}
            <GlobalFooterNav />
        </div>
    );
}
