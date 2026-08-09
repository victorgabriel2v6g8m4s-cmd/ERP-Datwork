import { useState } from 'react';
import { api } from '../api/client.ts';
import { CustomLogger } from '../utils/CustomLogger.ts';

interface GridGesturesOptions<T> {
    endpoint: string;
    currentList: T[];
    setListState: (list: T[]) => void;
    onRefresh: () => Promise<void> | void;
    skipConfirmDelete?: boolean;
    refreshAfterSoftDelete?: boolean;
}

export function useGridGestures<T extends { id: string; status: string; position?: number; subStatus?: string }>({
    endpoint,
    currentList,
    setListState,
    onRefresh,
    skipConfirmDelete = false,
    refreshAfterSoftDelete = true
}: GridGesturesOptions<T>) {
    const [activeItem, setActiveItem] = useState<T | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    const persistReorder = async (result: any, visibleList: T[]) => {
        const { destination, source } = result;
        if (!destination || destination.index === source.index) return;

        const reorderedVisibleItems = Array.from(visibleList);
        const [removed] = reorderedVisibleItems.splice(source.index, 1);

        if (!removed) {
            CustomLogger.warn(`[Grid Gestures] Reordenação ignorada: índice de origem inválido (${source.index}) no endpoint ${endpoint}`);
            return;
        }

        reorderedVisibleItems.splice(destination.index, 0, removed);

        const orderedCurrentList = [...currentList].sort(
            (a, b) => (a.position ?? 0) - (b.position ?? 0)
        );
        const visibleIds = new Set(reorderedVisibleItems.map((item) => item.id));
        const reorderedQueue = [...reorderedVisibleItems];

        const mergedList = orderedCurrentList.map((item) => {
            if (!visibleIds.has(item.id)) return item;
            return reorderedQueue.shift() ?? item;
        });

        const updatedList = mergedList.map((item, position) => ({ ...item, position }));

        CustomLogger.info(`[Grid Gestures] Reordenando lista no endpoint ${endpoint}. Origem: ${source.index} -> Destino: ${destination.index}`);
        setListState(updatedList);

        try {
            const positionsPayload = updatedList.map(item => ({ id: item.id, position: item.position }));
            await api.patch(`${endpoint}/reorder`, { positions: positionsPayload });
            CustomLogger.info(`[Grid Gestures] Ordenação em lote gravada com sucesso no endpoint ${endpoint}`);
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Falha ao persistir reordenação em lote no endpoint ${endpoint}. Revertendo estado local`, error);
            onRefresh();
        }
    };

    // Mantém a assinatura compatível com callbacks OnDragEndResponder existentes.
    const handleDragEnd = async (result: any) => persistReorder(result, currentList);

    // Usado quando a ordem exibida é apenas um subconjunto filtrado da lista completa.
    const handleVisibleDragEnd = async (result: any, visibleList: T[]) => persistReorder(result, visibleList);

    const cycleStatus = async (itemOrId: T | string, sequence: string[] = ['PENDING', 'COMPLETED'], deleteStatus = 'CANCELED') => {
        const target = typeof itemOrId === 'string' ? currentList.find(i => i.id === itemOrId) : itemOrId;
        if (!target) return;

        void sequence;

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

    const triggerSoftDelete = async (item: T, deleteStatusTarget = 'CANCELED', activeStatusTarget = 'PENDING') => {
        if (item.status === 'PENDING' || item.status === 'SCHEDULED' || item.status === 'ACTIVE') {
            if (skipConfirmDelete) {
                setListState(currentList.map(i => i.id === item.id ? { ...i, status: deleteStatusTarget } : i));
                try {
                    await api.patch(`${endpoint}/${item.id}/status`, { status: deleteStatusTarget });
                    if (refreshAfterSoftDelete) onRefresh();
                } catch (error) {
                    CustomLogger.error(`[Grid Gestures] Erro ao aplicar exclusão lógica ao item ${item.id}`, error);
                    onRefresh();
                }
                return;
            }

            setActiveItem(item);
            setConfirmModalOpen(true);
        } else {
            CustomLogger.info(`[Grid Gestures] Reativando registro ${item.id} com status ${activeStatusTarget}`);
            setListState(currentList.map(i => i.id === item.id ? { ...i, status: activeStatusTarget } : i));

            try {
                await api.patch(`${endpoint}/${item.id}/status`, { status: activeStatusTarget });
                if (refreshAfterSoftDelete) onRefresh();
            } catch (error) {
                CustomLogger.error(`[Grid Gestures] Erro ao reativar registro ${item.id}`, error);
                onRefresh();
            }
        }
    };

    const executeConfirmDelete = async (deleteStatusTarget = 'CANCELED') => {
        if (!activeItem) return;
        const { id } = activeItem;

        CustomLogger.info(`[Grid Gestures] Confirmando exclusão lógica para o registro ${id}`);
        setListState(currentList.map(i => i.id === id ? { ...i, status: deleteStatusTarget } : i));
        setConfirmModalOpen(false);

        try {
            await api.patch(`${endpoint}/${id}/status`, { status: deleteStatusTarget });
            onRefresh();
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Falha ao processar exclusão lógica do item ${id}`, error);
            onRefresh();
        } finally {
            setActiveItem(null);
        }
    };

    const openEditModal = (itemOrId: T | string) => {
        const target = typeof itemOrId === 'string' ? currentList.find(i => i.id === itemOrId) : itemOrId;
        if (target) {
            setActiveItem(target);
            setEditModalOpen(true);
        }
    };

    const openViewModal = (item: T) => {
        setActiveItem(item);
        setViewModalOpen(true);
    };

    const updateSubStatus = async (id: string, nextSub: string) => {
        CustomLogger.info(`[Grid Gestures] Atualizando sub-status do item ${id} para: ${nextSub}`);
        setListState(currentList.map(item => item.id === id ? { ...item, subStatus: nextSub } : item));

        try {
            await api.patch(`${endpoint}/${id}/sub-status`, { subStatus: nextSub });
            onRefresh();
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Falha ao sincronizar sub-status do item ${id}. Revertendo estado local`, error);
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
            handleVisibleDragEnd,
            cycleStatus,
            triggerSoftDelete: (item: T, delStatus?: string, actStatus?: string) => triggerSoftDelete(item, delStatus, actStatus),
            executeConfirmDelete,
            openEditModal,
            openViewModal,
            updateSubStatus
        }
    };
}
