export interface GridOrderPosition {
  id: string;
  position: number;
}

export interface PositionedGridItem {
  id: string;
  position?: number;
}

export interface GridReorderResult<T> {
  items: T[];
  positions: GridOrderPosition[];
}

export function reorderVisibleGridItems<T extends PositionedGridItem>(
  currentList: readonly T[],
  visibleList: readonly T[],
  sourceIndex: number,
  destinationIndex: number
): GridReorderResult<T> | null {
  if (sourceIndex === destinationIndex) return null;

  const reorderedVisibleItems = [...visibleList];
  const [removed] = reorderedVisibleItems.splice(sourceIndex, 1);
  if (!removed) return null;

  reorderedVisibleItems.splice(destinationIndex, 0, removed);

  const orderedCurrentList = [...currentList].sort(
    (first, second) => (first.position ?? 0) - (second.position ?? 0)
  );
  const visibleIds = new Set(reorderedVisibleItems.map((item) => item.id));
  const reorderedQueue = [...reorderedVisibleItems];
  const mergedList = orderedCurrentList.map((item) => {
    if (!visibleIds.has(item.id)) return item;
    return reorderedQueue.shift() ?? item;
  });
  const items = mergedList.map((item, position) => ({ ...item, position }));

  return {
    items,
    positions: items.map(({ id, position }) => ({ id, position }))
  };
}
