import { useState, useCallback } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';

interface UseSwipeGestureProps {
    itemId: string;
    itemActiveStatus: string;
    onSwipeLeft: (item: any) => void;
    onSwipeRight: (id: string) => void;
    itemRef: any; // Instância crua do registro para repassar no callback
    leftColor?: string;
    rightColor?: string;
}

export function useSwipeGesture({
    itemId,
    itemActiveStatus,
    onSwipeLeft,
    onSwipeRight,
    itemRef,
    leftColor = '#ef4444',  // Padrão: Vermelho (Excluir/Desativar)
    rightColor = '#6366f1'  // Padrão: Roxo (Editar)
}: UseSwipeGestureProps) {
    const [isPressing, setIsPressing] = useState(false);
    const x = useMotionValue(0);

    // 📐 INTERPOLAÇÃO DINÂMICA DE BACKGROUND DO GESTO
    const bgSwipe = useTransform(x, [-120, 0, 120], [
        `linear-gradient(to right, ${leftColor}, ${leftColor})`,
        'linear-gradient(to right, #ffffff, #ffffff)',
        `linear-gradient(to right, ${rightColor}, ${rightColor})`
    ]);

    const opacityLeft = useTransform(x, [-100, -30], [1, 0]);
    const opacityRight = useTransform(x, [30, 100], [0, 1]);

    // Executador de fim de curso do arrasto
    const handleDragEnd = useCallback((_: any, info: any) => {
        setIsPressing(false);
        if (info.offset.x < -100) {
            onSwipeLeft(itemRef);
        } else if (info.offset.x > 100) {
            onSwipeRight(itemId);
        }
        x.set(0);
    }, [itemId, itemRef, onSwipeLeft, onSwipeRight, x]);

    return {
        x,
        isPressing,
        setIsPressing,
        bgSwipe,
        opacityLeft,
        opacityRight,
        handleDragEnd
    };
}
