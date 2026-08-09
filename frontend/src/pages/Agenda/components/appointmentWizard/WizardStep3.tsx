import { motion } from 'framer-motion';
import { MediaManager } from '../../../../components/MediaManager.tsx';
import { TEXTS } from '../../../../i18n/index.ts';
import type { MediaItem } from '../../../../types/appointment.ts';

interface WizardStep3Props {
  medias: MediaItem[];
  setMedias: (medias: MediaItem[]) => void;
  setActiveLightboxMedia: (media: MediaItem | null) => void;
}

export function WizardStep3({ medias, setMedias, setActiveLightboxMedia }: WizardStep3Props) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <p className="text-xs text-slate-400 font-medium">{TEXTS.agenda.wizard.mediaHint}</p>
      <MediaManager medias={medias} onChangeMedias={setMedias} onOpenLightbox={setActiveLightboxMedia} />
    </motion.div>
  );
}
