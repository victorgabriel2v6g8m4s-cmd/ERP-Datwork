import { motion, type MotionValue } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';
import { TEXTS } from '../../../../i18n/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';

interface AppointmentCardSwipeBgProps {
  opacityRight: MotionValue<number>;
  opacityLeft: MotionValue<number>;
}

export function AppointmentCardSwipeBg({ opacityRight, opacityLeft }: AppointmentCardSwipeBgProps) {
  return (
    <div className={ERP_THEME.agenda.card.swipeBackground}>
      <motion.div style={{ opacity: opacityRight }} className={ERP_THEME.agenda.card.swipeAction}>
        <Check className="w-5 h-5" /> {TEXTS.agenda.swipe.completed}
      </motion.div>
      <motion.div style={{ opacity: opacityLeft }} className={ERP_THEME.agenda.card.swipeAction}>
        <Trash2 className="w-5 h-5" /> {TEXTS.agenda.swipe.cancel}
      </motion.div>
    </div>
  );
}
