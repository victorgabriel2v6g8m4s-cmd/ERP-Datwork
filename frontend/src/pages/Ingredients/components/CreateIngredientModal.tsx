import { AnimatePresence, motion } from 'framer-motion';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';
import { StepIdentification } from '../../../components/wizard/StepIdentification.tsx';
import { StepMedia } from '../../../components/wizard/StepMedia.tsx';
import type { IngredientMutationPayload } from '../types/ingredient.types.ts';
import { useIngredientsWizard } from '../hooks/useIngredientsWizard.ts';
import { IngredientWizardFooter } from './ingredientWizard/IngredientWizardFooter.tsx';
import { IngredientWizardHeader } from './ingredientWizard/IngredientWizardHeader.tsx';
import { StepIngredientMetrics } from './ingredientWizard/StepIngredientMetrics.tsx';

interface CreateIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: IngredientMutationPayload) => Promise<void>;
}

export function CreateIngredientModal(props: CreateIngredientModalProps) {
  const wizard = useIngredientsWizard(props);
  const { isOpen } = props;

  if (!isOpen) return null;

  return (
    <div className={`${ERP_THEME.modal.overlay} select-none`} data-ui-key={UI_KEYS.ingredients.createModal}>
      <motion.div
        initial={{ y: 35, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 35, opacity: 0 }}
        className={ERP_THEME.ingredients.modal.wizard}
      >
        <IngredientWizardHeader step={wizard.step} progressPercent={wizard.progressPercent} handleReset={wizard.handleReset} />

        <div className="py-2 min-h-[160px]">
          <AnimatePresence mode="wait">
            {wizard.step === 1 && (
              <motion.div key="ing-s1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepIdentification
                  sku={wizard.form.values.sku}
                  setSku={(value) => wizard.form.setField('sku', value)}
                  name={wizard.form.values.name}
                  setName={(value) => wizard.form.setField('name', value)}
                  hideOptionalFields
                />
              </motion.div>
            )}

            {wizard.step === 2 && (
              <motion.div key="ing-s2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepIngredientMetrics
                  price={wizard.form.values.price}
                  setPrice={(value) => wizard.form.setField('price', value)}
                  quantity={wizard.form.values.quantity}
                  setQuantity={(value) => wizard.form.setField('quantity', value)}
                  unit={wizard.form.values.unit}
                  setUnit={(value) => wizard.form.setField('unit', value)}
                />
              </motion.div>
            )}

            {wizard.step === 3 && (
              <motion.div key="ing-s3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepMedia
                  thumbnail={wizard.form.values.thumbnail}
                  medias={wizard.form.values.medias}
                  setMedias={(value) => wizard.form.setField('medias', value)}
                  setActiveMedia={wizard.form.setActiveMedia}
                  handleThumbnailUpload={wizard.form.handleThumbnailUpload}
                  uploadEndpoint={APP_CONFIG.api.endpoints.uploads.ingredients}
                  isThumbnailUploading={wizard.form.isThumbnailUploading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <IngredientWizardFooter
          step={wizard.step}
          identificationReady={wizard.identificationReady}
          isSubmitting={wizard.isSubmitting}
          handlePrevStep={wizard.handlePrevStep}
          handleNextStep={wizard.handleNextStep}
          handleReset={wizard.handleReset}
          handleSubmit={wizard.handleSubmit}
        />
      </motion.div>

      <MediaLightbox
        isOpen={wizard.form.activeMedia !== null}
        medias={wizard.form.values.medias}
        activeMedia={wizard.form.activeMedia}
        onClose={() => wizard.form.setActiveMedia(null)}
        onSelectMedia={wizard.form.setActiveMedia}
      />
    </div>
  );
}
