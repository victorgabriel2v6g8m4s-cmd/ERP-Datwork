import { useState, useRef, useCallback } from 'react';
import { CustomLogger } from '../utils/CustomLogger.ts';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick: () => void;
  delay?: number;
}

export function useLongPress({ onLongPress, onClick, delay = 800 }: UseLongPressOptions) {
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMovedRef = useRef(false);

  // 🛡️ Evita o disparo duplo em telas touch (bloqueia o clique do mouse emulado)
  const isTouchDeviceRef = useRef(false);

  const start = useCallback((e: any) => {
    // Detecta se a interação veio de um toque real
    if (e.type === 'touchstart') {
      isTouchDeviceRef.current = true;
    }
    // Bloqueia eventos de mouse se a máquina for touch para anular o clique fantasma
    if (e.type === 'mousedown' && isTouchDeviceRef.current) {
      return;
    }

    isMovedRef.current = false;
    setIsLongPressActive(false);

    timerRef.current = setTimeout(() => {
      CustomLogger.info('[Long Press] Toque longo detectado e validado com sucesso.');
      onLongPress();
      setIsLongPressActive(true);
    }, delay);
  }, [onLongPress, delay]);

  const stop = useCallback((e: any) => {
    if (e.type === 'mouseup' && isTouchDeviceRef.current) {
      return; // Anula propagação duplicada
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!isLongPressActive && !isMovedRef.current) {
      CustomLogger.info('[Long Press] Toque curto/Clique simples validado.');
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

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsLongPressActive(false);
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchMove: handleMove,
    // 🛡️ CRÍTICO: Previne que a janelinha nativa do navegador abra ao segurar o dedo
    onContextMenu: (e: any) => e.preventDefault(),
  };
}
