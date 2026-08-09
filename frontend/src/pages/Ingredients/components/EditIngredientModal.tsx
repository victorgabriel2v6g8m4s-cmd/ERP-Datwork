import { motion } from 'framer-motion';
import { FlaskConical, CheckCircle, Package, Coins, Image as ImageIcon, X } from 'lucide-react';
import { type Ingredient } from '../../../types/ingredient.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';
import { UniversalAccordion } from '../../../components/UniversalAccordion.tsx'; // ✨ Importado Universal!
import { ERP_THEME } from '../../../theme/presets.ts';

import { StepIdentification } from '../../../components/wizard/StepIdentification.tsx';
import { StepMedia } from '../../../components/wizard/StepMedia.tsx';
import { StepIngredientMetrics } from './ingredientWizard/StepIngredientMetrics.tsx';

import { useIngredientsEditor } from '../hooks/useIngredientsEditor.ts';


interface EditIngredientModalProps {
    isOpen: boolean;
    ingredient: Ingredient | null;
    onClose: () => void;
    onSave: (id: string, payload: any) => Promise<void>;
}


export function EditIngredientModal(props: EditIngredientModalProps) {
    const { isOpen, ingredient, onClose } = props;
    const editor = useIngredientsEditor(props);

    if (!isOpen || !ingredient) return null;

    return (
        <>
            <div className={ERP_THEME.modal.overlay + ' select-none'}>
                <motion.form
                    onSubmit={editor.handleSubmit}
                    initial={{ y: 35, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 35, opacity: 0 }}
                    className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
                >
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 text-orange-500">
                            <FlaskConical className="w-5 h-5" />
                            <h3 className="text-base font-black text-slate-800">Alterar Insumo</h3>
                        </div>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    {/* 🧩 SANFONA 1: IDENTIFICAÇÃO BÁSICA */}
                    <UniversalAccordion
                        id="id"
                        title="Identificação Básica"
                        icon={Package}
                        currentOpenSection={editor.openSection}
                        setOpenSection={(id) => editor.setOpenSection(id as any)} // ✨ CORREÇÃO: "as any" amortece o conflito de tipos estritos
                    >
                        <StepIdentification sku={editor.sku} setSku={editor.setSku} name={editor.name} setName={editor.setName} brand={editor.brand} setBrand={editor.setBrand} variation={editor.variation} setVariation={editor.setVariation} description={editor.description} setDescription={editor.setDescription} hideOptionalFields={true} />
                    </UniversalAccordion>

                    {/* 🧩 SANFONA 2: MÉTRICAS E PREÇO */}
                    <UniversalAccordion
                        id="metrics"
                        title="Métricas de Custo"
                        icon={Coins}
                        currentOpenSection={editor.openSection}
                        setOpenSection={(id) => editor.setOpenSection(id as any)} // ✨ CORREÇÃO
                    >
                        <StepIngredientMetrics price={editor.price} setPrice={editor.setPrice} quantity={editor.quantity} setQuantity={editor.setQuantity} unit={editor.unit} setUnit={editor.setUnit} />
                    </UniversalAccordion>

                    {/* 🧩 SANFONA 3: FOTOS & MÍDIAS */}
                    <UniversalAccordion
                        id="media"
                        title="Fotos & Mídias Anexas"
                        icon={ImageIcon}
                        currentOpenSection={editor.openSection}
                        setOpenSection={(id) => editor.setOpenSection(id as any)} // ✨ CORREÇÃO
                    >
                        <StepMedia thumbnail={editor.thumbnail} medias={editor.medias} setMedias={editor.setMedias} setActiveMedia={editor.setActiveMedia} handleThumbnailUpload={editor.handleThumbnailUpload} />
                    </UniversalAccordion>

                    {/* RODAPÉ USANDO OS PRESETS TÁTEIS DO DESIGN SYSTEM */}
                    <div className="flex gap-3 border-t border-slate-100 pt-4 font-sans">
                        <button type="button" onClick={onClose} className={ERP_THEME.modal.btnCancel}>Desistir</button>
                        <button type="submit" disabled={!editor.sku.trim() || !editor.name.trim()} className={ERP_THEME.modal.btnConfirm}>
                            <CheckCircle className="w-3.5 h-3.5" /> <span>Salvar Alterações</span>
                        </button>
                    </div>
                </motion.form>
            </div>

            <MediaLightbox isOpen={editor.activeMedia !== null} medias={editor.medias} activeMedia={editor.activeMedia} onClose={() => editor.setActiveMedia(null)} onSelectMedia={(media) => editor.setActiveMedia(media)} />
        </>
    );
}
