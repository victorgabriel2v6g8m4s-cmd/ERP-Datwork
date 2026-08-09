import { motion, AnimatePresence } from 'framer-motion';

import { ERP_THEME } from '../../../theme/presets.ts';
import { StepIdentification } from '../../../components/wizard/StepIdentification.tsx';
import { StepMedia } from '../../../components/wizard/StepMedia.tsx';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';
import { StepIngredientMetrics } from './ingredientWizard/StepIngredientMetrics.tsx';

// 🧠 Hooks e Sub-Módulos Atômicos Isolados
import { useIngredientsWizard } from '../hooks/useIngredientsWizard.ts';
import { IngredientWizardHeader } from './ingredientWizard/IngredientWizardHeader.tsx';
import { IngredientWizardFooter } from './ingredientWizard/IngredientWizardFooter.tsx';

interface CreateIngredientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => Promise<void>;
}

export function CreateIngredientModal(props: CreateIngredientModalProps) {
    const { isOpen } = props;
    const wizard = useIngredientsWizard(props);

    if (!isOpen) return null;

    return (
        <div className={ERP_THEME.modal.overlay + ' select-none'}>
            <motion.div
                initial={{ y: 35, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 35, opacity: 0 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5"
            >
                {/* Bloco Superior do Cabeçalho Hidratado */}
                <IngredientWizardHeader step={wizard.step} progressPercent={wizard.progressPercent} handleReset={wizard.handleReset} />

                {/* Corpo do Conteúdo Dinâmico */}
                <div className="py-2 min-h-[160px]">
                    <AnimatePresence mode="wait">
                        {wizard.step === 1 && (
                            <motion.div key="ing-s1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                                <StepIdentification
                                    sku={wizard.sku} setSku={wizard.setSku}
                                    name={wizard.name} setName={wizard.setName}
                                    brand={wizard.brand} setBrand={wizard.setBrand}
                                    variation={wizard.variation} setVariation={wizard.setVariation}
                                    description={wizard.description} setDescription={wizard.setDescription}
                                    hideOptionalFields={true}
                                />
                            </motion.div>
                        )}

                        {wizard.step === 2 && (
                            <motion.div key="ing-s2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                                <StepIngredientMetrics price={wizard.price} setPrice={wizard.setPrice} quantity={wizard.quantity} setQuantity={wizard.setQuantity} unit={wizard.unit} setUnit={wizard.setUnit} />
                            </motion.div>
                        )}

                        {wizard.step === 3 && (
                            <motion.div key="ing-s3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                                <StepMedia thumbnail={wizard.thumbnail} medias={wizard.medias} setMedias={wizard.setMedias} setActiveMedia={wizard.setActiveMedia} handleThumbnailUpload={wizard.handleThumbnailUpload} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bloco Inferior de Navegação Estrito */}
                <IngredientWizardFooter
                    step={wizard.step} sku={wizard.sku} name={wizard.name}
                    handlePrevStep={wizard.handlePrevStep} handleNextStep={wizard.handleNextStep}
                    handleReset={wizard.handleReset} handleSubmit={wizard.handleSubmit}
                />
            </motion.div>

            <MediaLightbox isOpen={wizard.activeMedia !== null} medias={wizard.medias} activeMedia={wizard.activeMedia} onClose={() => wizard.setActiveMedia(null)} onSelectMedia={(media) => wizard.setActiveMedia(media)} />
        </div>
    );
}
