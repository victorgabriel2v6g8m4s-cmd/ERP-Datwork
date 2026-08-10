import { Archive, DollarSign } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import type { Ingredient } from '../../../types/ingredient.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';
import { UniversalVersionTimeline } from '../../../components/UniversalVersionTimeline.tsx';
import { UniversalViewerLayout } from '../../../components/UniversalViewerLayout.tsx';
import { useIngredientsViewer } from '../hooks/useIngredientsViewer.ts';

interface ViewIngredientModalProps {
  isOpen: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
}

export function ViewIngredientModal(props: ViewIngredientModalProps) {
  const { isOpen, onClose } = props;
  const viewer = useIngredientsViewer(props);

  if (!isOpen || !viewer.activeData) return null;

  return (
    <>
      <AnimatePresence>
        <div className={ERP_THEME.modal.overlay} data-ui-key={UI_KEYS.ingredients.viewModal}>
          <motion.div initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 25, opacity: 0 }}>
            <UniversalViewerLayout
              title={viewer.activeData.name}
              sku={viewer.activeData.sku}
              thumbnail={viewer.activeData.thumbnail}
              createdAt={viewer.activeData.createdAt}
              medias={viewer.medias}
              onOpenLightbox={viewer.setActiveMedia}
              onClose={onClose}
              timelineComponent={
                <div data-ui-key={UI_KEYS.ingredients.history}>
                  <UniversalVersionTimeline
                    loading={viewer.loading}
                    versions={viewer.versions}
                    activeUpdatedAt={viewer.activeData.updatedAt}
                    onSelectVersion={viewer.handleSelectVersion}
                  />
                </div>
              }
            >
              <div className={ERP_THEME.ingredients.view.metrics}>
                <div className={`${ERP_THEME.ingredients.view.metricCard} ${ERP_THEME.ingredients.view.costAccent}`}>
                  <span className={ERP_THEME.ingredients.view.metricLabel}>
                    <DollarSign className="w-3 h-3 text-orange-500" /> {TEXTS.ingredients.view.price}
                  </span>
                  <span className={ERP_THEME.ingredients.view.metricValue}>{formatCurrencyBRL(viewer.activeData.price)}</span>
                </div>
                <div className={`${ERP_THEME.ingredients.view.metricCard} ${ERP_THEME.ingredients.view.quantityAccent}`}>
                  <span className={ERP_THEME.ingredients.view.metricLabel}>
                    <Archive className="w-3 h-3 text-indigo-500" /> {TEXTS.ingredients.view.quantity}
                  </span>
                  <span className={ERP_THEME.ingredients.view.metricValue}>{viewer.activeData.quantity} {viewer.activeData.unit}</span>
                </div>
              </div>
            </UniversalViewerLayout>
          </motion.div>
        </div>
      </AnimatePresence>

      <MediaLightbox
        isOpen={viewer.activeMedia !== null}
        medias={viewer.medias}
        activeMedia={viewer.activeMedia}
        onClose={() => viewer.setActiveMedia(null)}
        onSelectMedia={viewer.setActiveMedia}
      />
    </>
  );
}
