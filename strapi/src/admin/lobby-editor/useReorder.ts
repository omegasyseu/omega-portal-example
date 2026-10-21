import { useState, type DragEvent, type KeyboardEvent } from 'react';

/**
 * Reordering a list by dragging its rows, or with the up and down arrow keys on a row's
 * handle. `ids` names each row, in order.
 */
export const useReorder = (ids: readonly string[], onMove: (from: number, to: number) => void) => {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropOn, setDropOn] = useState<number | null>(null);

  const endDrag = () => {
    setDragFrom(null);
    setDropOn(null);
  };
  const dragHandlers = (index: number) => ({
    draggable: true,
    onDragStart: (event: DragEvent) => {
      event.dataTransfer.effectAllowed = 'move';
      // Firefox only starts a drag that carries data.
      event.dataTransfer.setData('text/plain', ids[index]);
      setDragFrom(index);
    },
    onDragOver: (event: DragEvent) => {
      if (dragFrom === null) {
        return;
      }
      event.preventDefault();
      setDropOn(index);
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      if (dragFrom !== null) {
        onMove(dragFrom, index);
      }
      endDrag();
    },
    onDragEnd: endDrag,
  });
  const moveWithKeys = (index: number) => (event: KeyboardEvent) => {
    const step = { ArrowUp: -1, ArrowDown: 1 }[event.key];
    if (step !== undefined) {
      event.preventDefault();
      onMove(index, index + step);
    }
  };

  return {
    /** The drag events of the row at this position. */
    dragHandlers,
    /** Moves the row at this position up or down with the arrow keys, on its handle. */
    moveWithKeys,
    /** Whether a row being dragged would drop on this one. */
    isDropTarget: (index: number) => dropOn === index && dragFrom !== index,
  };
};

/** A list's reordering, which each of its rows takes (DraggableRow). */
export type Reorder = ReturnType<typeof useReorder>;
