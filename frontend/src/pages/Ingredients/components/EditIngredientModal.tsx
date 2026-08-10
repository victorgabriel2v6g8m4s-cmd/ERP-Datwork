import { CheckCircle, Coins, FlaskConical, Image as ImageIcon, Package, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import type { Ingredient } from '../../../types/ingredient.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';
import { UniversalAccordion } from '../../../components/UniversalAccordion.tsx';
import { StepIdentification } from '../../../components/wizard/StepIdentification.tsx';
import { StepMedia } from '../../../components/wizard/StepMedia.tsx';
import { useIngredientsEditor } from '../hooks/useIngredientsEditor.ts';
import type { IngredientEditorSection, IngredientMutationPayload } from '../types/ingredient.types.ts';
import { StepIngredientMetrics } from './ingredientWizard/StepIngredientMetrics.tsx';

interface EditIngredientModalProps {
  isOpen: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
  onSave: (id: string, payload: IngredientMutationPayload) => Promise<void>;
}

function isEditorSection(value: string | null): value is IngredientEditorSection | null {
  return value === null || value === 'id' || value === 'metrics' || value === 'media';
}

export function EditIngredientModal(props: EditIngredientModalProps) {
  const { isOpen, ingredient, onClose } = props;
  const editor = useIngredientsEditor(props);

  if (!isOpen || !ingredient) return null;

  const setOpenSection = (section: string | null) => {
    if (isEditorSection(section)) editor.setOpenSection(section);
  };

  return (
    <>
      <div className={`${ERP_THEME.modal.overlay} select-none`} data-ui-key={UI_KEYS.ingredients.editModal}>
        <motion.form
          onSubmit={editor.handleSubmit}
          initial={{ y: 35, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 35, opacity: 0 }}
          className={ERP_THEME.ingredients.modal.editor}
        >
          <div className={ERP_THEME.ingredients.modal.header}>
            <div className="flex items-center gap-2 text-orange-500">
              <FlaskConical className="w-5 h-5" />
              <h3 className={ERP_THEME.ingredients.modal.title}>{TEXTS.ingredients.edit.title}</h3>
            </div>
            <button type="button" onClick={onClose} className={ERP_THEME.ingredients.modal.close} aria-label={TEXTS.common.actions.close}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <UniversalAccordion id="id" title={TEXTS.ingredients.form.identification} icon={Package} currentOpenSection={editor.openSection} setOpenSection={setOpenSection}>
            <StepIdentification
              sku={editor.form.values.sku}
              setSku={(value) => editor.form.setField('sku', value)}
              name={editor.form.values.name}
              setName={(value) => editor.form.setField('name', value)}
              hideOptionalFields
            />
          </UniversalAccordion>

          <UniversalAccordion id="metrics" title={TEXTS.ingredients.form.metrics} icon={Coins} currentOpenSection={editor.openSection} setOpenSection={setOpenSection}>
            <StepIngredientMetrics
              price={editor.form.values.price}
              setPrice={(value) => editor.form.setField('price', value)}
              quantity={editor.form.values.quantity}
              setQuantity={(value) => editor.form.setField('quantity', value)}
              unit={editor.form.values.unit}
              setUnit={(value) => editor.form.setField('unit', value)}
            />
          </UniversalAccordion>

          <UniversalAccordion id="media" title={TEXTS.ingredients.form.media} icon={ImageIcon} currentOpenSection={editor.openSection} setOpenSection={setOpenSection}>
            <StepMedia
              thumbnail={editor.form.values.thumbnail}
              medias={editor.form.values.medias}
              setMedias={(value) => editor.form.setField('medias', value)}
              setActiveMedia={editor.form.setActiveMedia}
              handleThumbnailUpload={editor.form.handleThumbnailUpload}
              uploadEndpoint={APP_CONFIG.api.endpoints.uploads.ingredients}
              isThumbnailUploading={editor.form.isThumbnailUploading}
            />
          </UniversalAccordion>

          <div className={ERP_THEME.ingredients.modal.footer}>
            <button type="button" onClick={onClose} className={ERP_THEME.modal.btnCancel}>{TEXTS.common.actions.cancel}</button>
            <button
              type="submit"
              disabled={!editor.form.values.sku.trim() || !editor.form.values.name.trim() || editor.isSubmitting}
              className={ERP_THEME.modal.btnConfirm}
              data-ui-key={UI_KEYS.ingredients.formSubmit}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{editor.isSubmitting ? TEXTS.common.status.saving : TEXTS.ingredients.edit.save}</span>
            </button>
          </div>
        </motion.form>
      </div>

      <MediaLightbox
        isOpen={editor.form.activeMedia !== null}
        medias={editor.form.values.medias}
        activeMedia={editor.form.activeMedia}
        onClose={() => editor.form.setActiveMedia(null)}
        onSelectMedia={editor.form.setActiveMedia}
      />
    </>
  );
}
