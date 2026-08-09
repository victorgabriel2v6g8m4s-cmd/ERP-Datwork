import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tags, CheckCircle, Package, Coins, BarChart3, Image as ImageIcon } from 'lucide-react';
import { type Product } from '../../../types/product.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';
import { StepIdentification } from './wizard/StepIdentification.tsx';
import { StepCosts } from './wizard/StepCosts.tsx';
import { StepPricing } from './wizard/StepPricing.tsx';
import { StepMedia } from './wizard/StepMedia.tsx';
import { useProductForm } from '../hooks/useProductForm.ts';
import { type ProductMutationPayload } from '../types/product-form.types.ts';

interface EditProductModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onSave: (id: string, payload: ProductMutationPayload) => Promise<void>;
}

type ProductEditSection = 'id' | 'costs' | 'pricing' | 'media';

export function EditProductModal({ isOpen, product, onClose, onSave }: EditProductModalProps) {
    const [openSection, setOpenSection] = useState<ProductEditSection | null>('id');
    const form = useProductForm({ isOpen, product, mode: 'edit' });

    useEffect(() => {
        if (isOpen) setOpenSection('id');
    }, [isOpen, product?.id]);

    const toggleSection = (section: ProductEditSection) => {
        setOpenSection((current) => current === section ? null : section);
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!product) return;

        const saved = await form.submit((payload) => onSave(product.id, payload));
        if (saved) handleClose();
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm select-none">
            <motion.form
                onSubmit={handleSubmit}
                initial={{ y: 35, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 35, opacity: 0 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
            >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Tags className="w-5 h-5" />
                        <h3 className="text-base font-black text-slate-800">Alterar Informações</h3>
                    </div>
                    <button type="button" onClick={handleClose} disabled={form.isSubmitting} className="text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                    <button type="button" onClick={() => toggleSection('id')} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer">
                        <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-slate-400" /> Identificação Básica</span>
                        <motion.span animate={{ rotate: openSection === 'id' ? 90 : 0 }} className="text-slate-400 font-mono text-xs block">▶</motion.span>
                    </button>
                    <AnimatePresence>
                        {openSection === 'id' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
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
                    </AnimatePresence>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                    <button type="button" onClick={() => toggleSection('costs')} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer">
                        <span className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-slate-400" /> Custos do Produto</span>
                        <motion.span animate={{ rotate: openSection === 'costs' ? 90 : 0 }} className="text-slate-400 font-mono text-xs block">▶</motion.span>
                    </button>
                    <AnimatePresence>
                        {openSection === 'costs' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
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
                    </AnimatePresence>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                    <button type="button" onClick={() => toggleSection('pricing')} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer">
                        <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-slate-400" /> Precificação & Curva ABC</span>
                        <motion.span animate={{ rotate: openSection === 'pricing' ? 90 : 0 }} className="text-slate-400 font-mono text-xs block">▶</motion.span>
                    </button>
                    <AnimatePresence>
                        {openSection === 'pricing' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
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
                    </AnimatePresence>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                    <button type="button" onClick={() => toggleSection('media')} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer">
                        <span className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-slate-400" /> Fotos & Anexos Técnicos</span>
                        <motion.span animate={{ rotate: openSection === 'media' ? 90 : 0 }} className="text-slate-400 font-mono text-xs block">▶</motion.span>
                    </button>
                    <AnimatePresence>
                        {openSection === 'media' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
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

                <div className="flex gap-3 border-t border-slate-100 pt-4 text-xs font-bold">
                    <button type="button" onClick={handleClose} disabled={form.isSubmitting} className="flex-1 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                        Desistir
                    </button>
                    <button type="submit" disabled={form.isSubmitting || !form.validation.isValid} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1 shadow-md shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{form.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </button>
                </div>
            </motion.form>

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
