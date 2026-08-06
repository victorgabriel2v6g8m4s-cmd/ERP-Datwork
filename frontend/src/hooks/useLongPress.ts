import { useState, useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick: () => void;
  delay?: number;
}

export function useLongPress({ onLongPress, onClick, delay = 1000 }: UseLongPressOptions) {
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMovedRef = useRef(false);

  const start = useCallback(() => {
    isMovedRef.current = false;
    setIsLongPressActive(false);
    
    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsLongPressActive(true);
    }, delay);
  }, [onLongPress, delay]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (!isLongPressActive && !isMovedRef.current) {
      onClick();
    }
    
    setIsLongPressActive(false);
  }, [isLongPressActive, onClick]);

  const handleMove = useCallback(() => {
    isMovedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: () => timerRef.current && clearTimeout(timerRef.current),
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchMove: handleMove,
  };
}
