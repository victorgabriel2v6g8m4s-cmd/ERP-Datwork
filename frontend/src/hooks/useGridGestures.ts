import { useState } from 'react';
import { api } from '../api/client.ts';
import { CustomLogger } from '../utils/CustomLogger.ts';

interface GridGesturesOptions<T> {
    endpoint: string;
    currentList: T[];
    setListState: (list: T[]) => void;
    onRefresh: () => Promise<void> | void;
    skipConfirmDelete?: boolean;
}

export function useGridGestures<T extends { id: string; status: string; position?: number; subStatus?: string }>({
    endpoint,
    currentList,
    setListState,
    onRefresh,
    skipConfirmDelete = false
}: GridGesturesOptions<T>) {
    const [activeItem, setActiveItem] = useState<T | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    const handleDragEnd = async (result: any, visibleList: T[] = currentList) => {
        const { destination, source } = result;
        if (!destination || destination.index === source.index) return;

        const sourceList = Array.from(visibleList);
        const [removed] = sourceList.splice(source.index, 1);
        if (!removed) {
            CustomLogger.warn(`[Grid Gestures] Reorder ignored because source index ${source.index} is invalid for ${endpoint}`);
            return;
        }

        sourceList.splice(destination.index, 0, removed);

        const orderedCurrentList = [...currentList].sort(
            (a, b) => (a.position ?? 0) - (b.position ?? 0)
        );
        const visibleIds = new Set(sourceList.map((item) => item.id));
        const reorderedVisibleQueue = [...sourceList];

        const mergedList = orderedCurrentList.map((item) => {
            if (!visibleIds.has(item.id)) return item;
            return reorderedVisibleQueue.shift() ?? item;
        });

        const updatedList = mergedList.map((item, position) => ({ ...item, position }));

        CustomLogger.info(
            `[Grid Gestures] Reordering ${sourceList.length} visible records in ${endpoint}. ` +
            `Source: ${source.index}; destination: ${destination.index}; total records: ${currentList.length}`
        );

        setListState(updatedList);

        try {
            const positionsPayload = updatedList.map((item) => ({ id: item.id, position: item.position }));
            await api.patch(`${endpoint}/reorder`, { positions: positionsPayload });
            CustomLogger.info(`[Grid Gestures] Batch reorder persisted successfully for ${endpoint}`);
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Failed to persist batch reorder for ${endpoint}. Restoring server state`, error);
            await onRefresh();
        }
    };

    const cycleStatus = async (itemOrId: T | string, sequence: string[] = ['PENDING', 'COMPLETED'], deleteStatus = 'CANCELED') => {
        const target = typeof itemOrId === 'string' ? currentList.find(i => i.id === itemOrId) : itemOrId;
        if (!target) return;

        let nextStatus = sequence[0] ?? 'PENDING';
        const currentIndex = sequence.indexOf(target.status);

        if (currentIndex >= 0) {
            nextStatus = sequence[(currentIndex + 1) % sequence.length] ?? sequence[0] ?? 'PENDING';
        } else if (target.status === deleteStatus || target.status === 'INACTIVE') {
            nextStatus = sequence[0] ?? 'PENDING';
        } else {
            return;
        }

        CustomLogger.info(`[Grid Gestures] Updating status for record ${target.id} to ${nextStatus}`);
        setListState(currentList.map(i => i.id === target.id ? { ...i, status: nextStatus } : i));

        try {
            await api.patch(`${endpoint}/${target.id}/status`, { status: nextStatus });
            await onRefresh();
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Failed to update status for record ${target.id}`, error);
            await onRefresh();
        }
    };

    const triggerSoftDelete = async (item: T, deleteStatusTarget = 'CANCELED', activeStatusTarget = 'PENDING') => {
        if (item.status === 'PENDING' || item.status === 'SCHEDULED' || item.status === 'ACTIVE') {
            if (skipConfirmDelete) {
                setListState(currentList.map(i => i.id === item.id ? { ...i, status: deleteStatusTarget } : i));
                try {
                    await api.patch(`${endpoint}/${item.id}/status`, { status: deleteStatusTarget });
                    await onRefresh();
                } catch (error) {
                    CustomLogger.error(`[Grid Gestures] Failed to apply soft-delete status to record ${item.id}`, error);
                    await onRefresh();
                }
                return;
            }

            setActiveItem(item);
            setConfirmModalOpen(true);
            return;
        }

        CustomLogger.info(`[Grid Gestures] Reactivating record ${item.id} with status ${activeStatusTarget}`);
        setListState(currentList.map(i => i.id === item.id ? { ...i, status: activeStatusTarget } : i));

        try {
            await api.patch(`${endpoint}/${item.id}/status`, { status: activeStatusTarget });
            await onRefresh();
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Failed to reactivate record ${item.id}`, error);
            await onRefresh();
        }
    };

    const executeConfirmDelete = async (deleteStatusTarget = 'CANCELED') => {
        if (!activeItem) return;
        const { id } = activeItem;

        CustomLogger.info(`[Grid Gestures] Confirming logical deletion for record ${id}`);
        setListState(currentList.map(i => i.id === id ? { ...i, status: deleteStatusTarget } : i));
        setConfirmModalOpen(false);

        try {
            await api.patch(`${endpoint}/${id}/status`, { status: deleteStatusTarget });
            await onRefresh();
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Failed to apply logical deletion to record ${id}`, error);
            await onRefresh();
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
        CustomLogger.info(`[Grid Gestures] Updating sub-status for record ${id} to ${nextSub}`);
        setListState(currentList.map(item => item.id === id ? { ...item, subStatus: nextSub } : item));

        try {
            await api.patch(`${endpoint}/${id}/sub-status`, { subStatus: nextSub });
            await onRefresh();
        } catch (error) {
            CustomLogger.error(`[Grid Gestures] Failed to update sub-status for record ${id}. Restoring server state`, error);
            await onRefresh();
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
