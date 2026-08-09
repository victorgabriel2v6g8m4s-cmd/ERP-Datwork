import { useState } from 'react';
import { api } from '../api/client.ts';
import { CustomLogger } from '../utils/CustomLogger.ts';

interface GridGesturesOptions<T> {
    endpoint: string;                      // Rota base do Node (Ex: '/appointments', '/products')
    currentList: T[];                      // Array de dados ativo da tela
    setListState: (list: T[]) => void;     // Modificador de estado do React do componente pai
    onRefresh: () => Promise<void> | void; // Callback síncrono para recarregar a tela pós-gravação
    skipConfirmDelete?: boolean;
}

export function useGridGestures<T extends { id: string; status: string; position?: number; subStatus?: string }>({
    endpoint,
    currentList,
    setListState,
    onRefresh,
    skipConfirmDelete = false
}: GridGesturesOptions<T>) {

    // ✨ Nome genérico e unificado para qualquer registro do ERP (Inquilinato)
    const [activeItem, setActiveItem] = useState<T | null>(null);

    // Gatilhos Universais de Modais compartilhados pelas grades
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    // ==========================================
    // 🧰 CATÁLOGO DE AÇÕES PRONTAS E SELADAS (AGNÓSTICAS)
    // ==========================================

    // 🔃 AÇÃO A: Reordenação Mecânica Linear por Arraste (Otimizada para Lote /reorder)
    const handleDragEnd = async (result: any) => {
        const { destination, source } = result;
        if (!destination || destination.index === source.index) return;

        CustomLogger.info(`[Grid Gestures] Reordenando lista no endpoint ${endpoint}. Origem: ${source.index} -> Destino: ${destination.index}`);

        const items = Array.from(currentList);
        const [removed] = items.splice(source.index, 1);
        items.splice(destination.index, 0, removed);

        // Mapeia os novos índices lógicos
        const updatedList = currentList.map((item) => {
            const newIndex = items.findIndex((i) => i.id === item.id);
            if (newIndex !== -1) return { ...item, position: newIndex };
            return item;
        }).sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));

        // Feedback visual instantâneo na UI
        setListState(updatedList);

        try {
            // ✨ OTIMIZAÇÃO HISTÓRICA: Em vez de bombardear o SQLite com N patches individuais,
            // enviamos o array consolidado em uma única requisição HTTP atômica para o endpoint /reorder
            const positionsPayload = updatedList.map(item => ({ id: item.id, position: item.position }));

            await api.patch(`${endpoint}/reorder`, { positions: positionsPayload });
            CustomLogger.info(`[Grid Gestures] Ordenação em lote gravada com sucesso absoluto no backend.`);
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Falha ao persistir reordenação em lote no endpoint ${endpoint}. Revertendo...`, error);
            onRefresh(); // Reverte o estado local buscando a verdade do banco
        }
    };

    // 🧠 AÇÃO B: Máquina de Ciclo de Status Dinâmica (Swipe Right)
    const cycleStatus = async (itemOrId: T | string, sequence: string[] = ['PENDING', 'COMPLETED'], deleteStatus = 'CANCELED') => {
        const target = typeof itemOrId === 'string' ? currentList.find(i => i.id === itemOrId) : itemOrId;
        if (!target) return;

        let nextStatus = 'PENDING';

        if (target.status === 'PENDING' || target.status === 'SCHEDULED' || target.status === 'ACTIVE') {
            nextStatus = 'COMPLETED';
        } else if (target.status === 'COMPLETED') {
            nextStatus = 'PENDING';
        } else if (target.status === deleteStatus || target.status === 'INACTIVE') {
            nextStatus = 'PENDING';
        } else {
            return;
        }

        CustomLogger.info(`[Grid Gestures] Avançando status do item ${target.id} para: ${nextStatus}`);
        setListState(currentList.map(i => i.id === target.id ? { ...i, status: nextStatus } : i));

        try {
            await api.patch(`${endpoint}/${target.id}/status`, { status: nextStatus });
            onRefresh();
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Erro ao mutar status do item ${target.id}`, error);
            onRefresh();
        }
    };

    // 🚨 AÇÃO C: Disparador de Popup de Confirmação para Soft-Delete / Cancelamento (Swipe Left)
    const triggerSoftDelete = async (item: T, deleteStatusTarget = 'CANCELED', activeStatusTarget = 'PENDING') => {
        if (item.status === 'PENDING' || item.status === 'SCHEDULED' || item.status === 'ACTIVE') {

            // Se skipConfirmDelete for true, deleta direto
            if (skipConfirmDelete) {
                setListState(currentList.map(i => i.id === item.id ? { ...i, status: deleteStatusTarget } : i));
                try {
                    await api.patch(`${endpoint}/${item.id}/status`, { status: deleteStatusTarget });
                    onRefresh();
                } catch (error) { onRefresh(); }
                return;
            }

            setActiveItem(item);
            setConfirmModalOpen(true);
        } else {
            // 🔄 FLUXO REVERSO DE REATIVAÇÃO INTEGRADO:
            // ✨ CORREÇÃO: Passa a usar a variável dinâmica activeStatusTarget ('ACTIVE' ou 'PENDING')
            CustomLogger.info(`[Grid Gestures] Reativando registro de forma direta com o status: "${activeStatusTarget}"`);
            setListState(currentList.map(i => i.id === item.id ? { ...i, status: activeStatusTarget } : i));

            try {
                await api.patch(`${endpoint}/${item.id}/status`, { status: activeStatusTarget });
                onRefresh();
            } catch (error) {
                CustomLogger.error(`[Grid Gestures] Erro ao reativar registro no banco`, error);
                onRefresh();
            }
        }
    };

    // 📝 AÇÃO D: Executador do Soft-Delete Seguro no Banco (Gatilho da confirmação do modal)
    const executeConfirmDelete = async (deleteStatusTarget = 'CANCELED') => {
        if (!activeItem) return;
        const { id } = activeItem;

        CustomLogger.info(`[Grid Gestures] Confirmando Soft-Delete lógico para o registro ID: ${id}`);
        setListState(currentList.map(i => i.id === id ? { ...i, status: deleteStatusTarget } : i));
        setConfirmModalOpen(false);

        try {
            // ✨ SEGURANÇA PATRIMONIAL: Mudança para patch de status de exclusão lógica (INACTIVE/CANCELED)
            // Casando 100% com o Soft-Delete unificado e gerador de snapshots do backend
            await api.patch(`${endpoint}/${id}/status`, { status: deleteStatusTarget });
            onRefresh();
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Falha ao processar Soft-Delete lógico do item ${id}`, error);
            onRefresh();
        } finally {
            setActiveItem(null);
        }
    };

    // 📂 AÇÃO E: Abertura imediata do modal de Edição Avançada
    const openEditModal = (itemOrId: T | string) => {
        const target = typeof itemOrId === 'string' ? currentList.find(i => i.id === itemOrId) : itemOrId;
        if (target) {
            setActiveItem(target);
            setEditModalOpen(true);
        }
    };

    // 👁️ AÇÃO F: Abertura imediata do modal de Visualização Detalhada
    const openViewModal = (item: T) => {
        setActiveItem(item);
        setViewModalOpen(true);
    };

    // 🔮 AÇÃO G: Alteração instantânea de Sub-status com amortecedor de rede
    const updateSubStatus = async (id: string, nextSub: string) => {
        CustomLogger.info(`[Grid Gestures] Atualizando sub-status do item ${id} para: ${nextSub}`);
        setListState(currentList.map(item => item.id === id ? { ...item, subStatus: nextSub } : item));

        try {
            await api.patch(`${endpoint}/${id}/sub-status`, { subStatus: nextSub });
            onRefresh();
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Falha ao sincronizar sub-status do item ${id}. Revertendo...`, error);
            onRefresh();
        }
    };

    return {
        activeItem, setActiveItem,
        confirmModalOpen, setConfirmModalOpen,
        editModalOpen, setEditModalOpen,
        viewModalOpen, setViewModalOpen,

        actions: {
            handleDragEnd,
            cycleStatus,
            triggerSoftDelete: (item: T, delStatus?: string, actStatus?: string) => triggerSoftDelete(item, delStatus, actStatus),
            executeConfirmDelete,
            openEditModal,
            openViewModal,
            updateSubStatus
        }
    };
}
