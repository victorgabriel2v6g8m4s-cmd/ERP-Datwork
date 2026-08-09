import { useState } from 'react';
import { api } from '../../../api/client.ts';
import { type Ingredient } from '../../../types/ingredient.ts';
import { useGridGestures } from '../../../hooks/useGridGestures.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

export function useIngredientsActions() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [orderProfiles, setOrderProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // 📡 1. BUSCA DE DADOS INICIAIS DO SQLITE
    const fetchIngredients = async () => {
        CustomLogger.info('[Insumos] Sincronizando catálogo ativo de matérias-primas...');
        try {
            const response = await api.get<Ingredient[]>('/ingredients');
            setIngredients(response.data.sort((a, b) => a.position - b.position));
        } catch (error) {
            CustomLogger.error('[Insumos] Erro crítico ao carregar dados do banco', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderProfiles = async () => {
        try {
            const response = await api.get('/products/orders');
            setOrderProfiles(response.data);
        } catch (error) {
            CustomLogger.error('[Insumos] Erro ao buscar perfis de ordenação de lote', error);
        }
    };

    // 🎛️ 2. CONEXÃO DIRETA COM O MOTOR UNIVERSAL DE GESTOS DO ERP
    const {
        activeItem: selectedIngredient,
        setActiveItem: setSelectedIngredient,
        editModalOpen: isEditModalOpen,
        setEditModalOpen: setIsEditModalOpen,
        viewModalOpen: isViewModalOpen,
        setViewModalOpen: setIsViewModalOpen,
        confirmModalOpen,
        actions
    } = useGridGestures<Ingredient>({
        endpoint: '/ingredients',
        currentList: ingredients,
        setListState: setIngredients,
        onRefresh: fetchIngredients,
        skipConfirmDelete: true
    });

    // 📡 3. OPERAÇÕES DE CRUD EM CASCATA
    const handleCreateIngredient = async (payload: any) => {
        CustomLogger.info('[Insumos] Criando nova entrada de insumo por payload estruturado.');
        try {
            const response = await api.post<Ingredient>('/ingredients', payload);
            setIngredients((prev) => [...prev, response.data].sort((a, b) => a.position - b.position));
            setIsCreateModalOpen(false);
        } catch (error: any) {
            CustomLogger.error('[Insumos] Falha ao instanciar insumo na tabela', error);
            alert(`⚠️ Erro: ${error.response?.data?.error || 'Falha ao salvar.'}`);
        }
    };

    const handleUpdateIngredient = async (id: string, payload: any) => {
        CustomLogger.info(`[Insumos] Atualizando parâmetros do insumo ID: ${id}`);
        try {
            const response = await api.put<Ingredient>(`/ingredients/${id}`, payload);
            setIngredients((prev) => prev.map((item) => (item.id === id ? response.data : item)));
            setIsEditModalOpen(false);
            setSelectedIngredient(null);
        } catch (error: any) {
            CustomLogger.error(`[Insumos] Erro ao modificar insumo ${id}`, error);
            alert(`⚠️ Erro ao atualizar: ${error.response?.data?.error || 'Falha na rede.'}`);
        }
    };

    // 🪐 4. GERENCIADOR DE GOVERNANÇA DE PERFIS DE ORDENAÇÃO DE LOTE
    const handleSaveNewOrderProfile = async (name: string) => {
        const currentPositions = ingredients.map((i, idx) => ({ id: i.id, position: idx }));
        try {
            await api.post('/products/orders', { name, positions: currentPositions });
            await fetchOrderProfiles();
        } catch (error) { CustomLogger.error('[Insumos] Falha ao salvar perfil', error); }
    };

    const handleRenameOrderProfile = async (id: string, name: string) => {
        try {
            await api.put(`/products/orders/${id}`, { name });
            await fetchOrderProfiles();
        } catch (error) { CustomLogger.error('[Insumos] Erro ao alterar nome do perfil', error); }
    };

    const handleDeleteOrderProfile = async (id: string) => {
        try {
            await api.delete(`/products/orders/${id}`);
            await fetchOrderProfiles();
        } catch (error) { CustomLogger.error('[Insumos] Erro ao expurgar perfil', error); }
    };

    return {
        ingredients, setIngredients, orderProfiles, loading, isCreateModalOpen, setIsCreateModalOpen,
        isEditModalOpen, setIsEditModalOpen, isViewModalOpen, setIsViewModalOpen, selectedIngredient, setSelectedIngredient,
        fetchIngredients, fetchOrderProfiles, handleCreateIngredient, handleUpdateIngredient,
        handleSaveNewOrderProfile, handleRenameOrderProfile, handleDeleteOrderProfile, actions
    };
}
