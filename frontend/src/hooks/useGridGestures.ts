import { useCallback, useState } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import {
  reorderVisibleGridItems,
  type GridOrderPosition,
  type PositionedGridItem
} from '../utils/gridOrder.ts';

interface GridGesturesOptions<T extends PositionedGridItem> {
  currentList: T[];
  setListState: (list: T[]) => void;
  persistReorder: (positions: GridOrderPosition[]) => Promise<void>;
  onReorderError: (error: unknown) => Promise<void> | void;
}

export function useGridGestures<T extends PositionedGridItem>({
  currentList,
  setListState,
  persistReorder,
  onReorderError
}: GridGesturesOptions<T>) {
  const [activeItem, setActiveItem] = useState<T | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const persistVisibleReorder = useCallback(async (result: DropResult, visibleList: T[]) => {
    const destination = result.destination;
    if (!destination || destination.index === result.source.index) return;

    const reordered = reorderVisibleGridItems(
      currentList,
      visibleList,
      result.source.index,
      destination.index
    );
    if (!reordered) return;

    setListState(reordered.items);

    try {
      await persistReorder(reordered.positions);
    } catch (error) {
      await onReorderError(error);
    }
  }, [currentList, onReorderError, persistReorder, setListState]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => persistVisibleReorder(result, currentList),
    [currentList, persistVisibleReorder]
  );

  const handleVisibleDragEnd = useCallback(
    async (result: DropResult, visibleList: T[]) => persistVisibleReorder(result, visibleList),
    [persistVisibleReorder]
  );

  const openEditModal = useCallback((itemOrId: T | string) => {
    const target = typeof itemOrId === 'string'
      ? currentList.find((item) => item.id === itemOrId)
      : itemOrId;

    if (!target) return;
    setActiveItem(target);
    setEditModalOpen(true);
  }, [currentList]);

  const openViewModal = useCallback((item: T) => {
    setActiveItem(item);
    setViewModalOpen(true);
  }, []);

  return {
    activeItem,
    setActiveItem,
    editModalOpen,
    setEditModalOpen,
    viewModalOpen,
    setViewModalOpen,
    actions: {
      handleDragEnd,
      handleVisibleDragEnd,
      openEditModal,
      openViewModal
    }
  };
}
