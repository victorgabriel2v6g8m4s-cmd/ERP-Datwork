import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tags, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';
import { StepIdentification } from './wizard/StepIdentification.tsx';
import { StepCosts } from './wizard/StepCosts.tsx';
import { StepPricing } from './wizard/StepPricing.tsx';
import { StepMedia } from './wizard/StepMedia.tsx';
import { useProductForm } from '../hooks/useProductForm.ts';
import { type ProductMutationPayload } from '../types/product-form.types.ts';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ProductMutationPayload) => Promise<void>;
}

export function CreateProductModal({ isOpen, onClose, onSave }: CreateProductModalProps) {
  const [step, setStep] = useState(1);
  const form = useProductForm({ isOpen, mode: 'create' });

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  const progressPercent = ((step - 1) / 3) * 100;
  const identificationReady = Boolean(form.values.sku.trim() && form.values.name.trim());

  const handleClose = () => {
    form.reset();
    setStep(1);
    onClose();
  };

  const handleNextStep = () => {
    if (step === 1 && !identificationReady) return;
    setStep((current) => Math.min(current + 1, 4));
  };

  const handlePrevStep = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async () => {
    const saved = await form.submit(onSave);
    if (saved) handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm select-none">
      <motion.div
        initial={{ y: 35, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 35, opacity: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Tags className="w-5 h-5" />
            <h3 className="text-base font-black text-slate-800">Assistente de Cadastro</h3>
          </div>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span>Etapa {step} de 4</span>
            <span className="text-emerald-600 font-bold">
              {step === 1 && 'Identificação'}
              {step === 2 && 'Custos'}
              {step === 3 && 'Precificação'}
              {step === 4 && 'Mídias & Conclusão'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        <div className="py-2 min-h-[180px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepIdentification
                  sku={form.values.sku}
                  setSku={(value) => form.setField('sku', value)}
                  name={form.values.name}
                  setName={(value) => form.setField('name', value)}
                  brand={form.values.brand}
                  setBrand={(value) => form.setField('brand', value)}
                  variation={form.values.variation}
                  setVariation={(value) => form.setField('variation', value)}
                  description={form.values.description}
                  setDescription={(value) => form.setField('description', value)}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepCosts
                  recipeCostPerUnit={form.values.recipeCostPerUnit}
                  unitsPerBatch={form.values.unitsPerBatch}
                  indirectCost={form.values.indirectCost}
                  setIndirectCost={(value) => form.setField('indirectCost', value)}
                  batchRecipeCost={form.costPreview.batchRecipeCost}
                  baseUnitCost={form.costPreview.baseUnitCost}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepPricing
                  finalPrice={form.values.finalPrice}
                  setFinalPrice={(value) => form.setField('finalPrice', value)}
                  abcCategory={form.values.abcCategory}
                  setAbcCategory={(value) => form.setField('abcCategory', value)}
                  includeFixedCosts={form.values.includeFixedCosts}
                  setIncludeFixedCosts={(value) => form.setField('includeFixedCosts', value)}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepMedia
                  thumbnail={form.values.thumbnail}
                  medias={form.values.medias}
                  setMedias={(value) => form.setField('medias', value)}
                  setActiveMedia={(media) => form.setActiveMedia(media)}
                  handleThumbnailUpload={form.handleThumbnailUpload}
                  isThumbnailUploading={form.isThumbnailUploading}
                  thumbnailError={form.thumbnailError}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-2 border-t border-slate-100 pt-4 text-xs font-bold">
          {step > 1 ? (
            <button type="button" onClick={handlePrevStep} disabled={form.isSubmitting} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50">
              <ArrowLeft className="w-3.5 h-3.5" /> <span>Voltar</span>
            </button>
          ) : (
            <button type="button" onClick={handleClose} disabled={form.isSubmitting} className="px-4 py-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
              Cancelar
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={form.isSubmitting || (step === 1 && !identificationReady)}
              className={`px-5 py-2.5 font-bold rounded-xl text-white transition-all flex items-center gap-1 ml-auto ${step === 1 && !identificationReady ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 cursor-pointer'}`}
            >
              <span>Avançar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={form.isSubmitting || !form.validation.isValid}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors flex items-center gap-1 shadow-md shadow-emerald-100 cursor-pointer ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{form.isSubmitting ? 'Salvando...' : 'Concluir Cadastro'}</span>
            </button>
          )}
        </div>
      </motion.div>

      <MediaLightbox
        isOpen={form.activeMedia !== null}
        medias={form.values.medias}
        activeMedia={form.activeMedia}
        onClose={() => form.setActiveMedia(null)}
        onSelectMedia={(media) => form.setActiveMedia(media)}
      />
    </div>
  );
}
