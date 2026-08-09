import { useCallback, useState } from 'react';
import { useMotionValue, useTransform, type PanInfo } from 'framer-motion';

interface UseSwipeGestureProps<T> {
    itemId: string;
    onSwipeLeft: (item: T) => void;
    onSwipeRight: (id: string) => void;
    itemRef: T;
    leftColor?: string;
    rightColor?: string;
    actionThresholdPx?: number;
}

export function useSwipeGesture<T>({
    itemId,
    onSwipeLeft,
    onSwipeRight,
    itemRef,
    leftColor = '#ef4444',
    rightColor = '#6366f1',
    actionThresholdPx = 100
}: UseSwipeGestureProps<T>) {
    const [isPressing, setIsPressing] = useState(false);
    const x = useMotionValue(0);

    const bgSwipe = useTransform(x, [-120, 0, 120], [
        `linear-gradient(to right, ${leftColor}, ${leftColor})`,
        'linear-gradient(to right, #ffffff, #ffffff)',
        `linear-gradient(to right, ${rightColor}, ${rightColor})`
    ]);

    const opacityLeft = useTransform(x, [-100, -30], [1, 0]);
    const opacityRight = useTransform(x, [30, 100], [0, 1]);

    const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsPressing(false);
        if (info.offset.x < -actionThresholdPx) {
            onSwipeLeft(itemRef);
        } else if (info.offset.x > actionThresholdPx) {
            onSwipeRight(itemId);
        }
        x.set(0);
    }, [actionThresholdPx, itemId, itemRef, onSwipeLeft, onSwipeRight, x]);

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
