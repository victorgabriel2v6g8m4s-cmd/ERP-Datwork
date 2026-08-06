import { motion, type MotionValue } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';

interface AppointmentCardSwipeBgProps {
    opacityRight: MotionValue<number>;
    opacityLeft: MotionValue<number>;
}

export function AppointmentCardSwipeBg({ opacityRight, opacityLeft }: AppointmentCardSwipeBgProps) {
    return (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-between px-6 overflow-hidden pointer-events-none">
            <motion.div style={{ opacity: opacityRight }} className="flex items-center gap-2 text-white font-semibold">
                <Check className="w-5 h-5" /> Realizado
            </motion.div>
            <motion.div style={{ opacity: opacityLeft }} className="flex items-center gap-2 text-white font-semibold">
                <Trash2 className="w-5 h-5" /> Desmarcar
            </motion.div>
        </div>
    );
}
