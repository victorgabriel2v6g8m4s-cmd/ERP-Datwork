import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Archive } from 'lucide-react';
import { type Ingredient } from '../../../types/ingredient.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';
import { UniversalViewerLayout } from '../../../components/UniversalViewerLayout.tsx'; // ✨ Template Global
import { UniversalVersionTimeline } from '../../../components/UniversalVersionTimeline.tsx'; // ✨ Fita Global
import { ERP_THEME } from '../../../theme/presets.ts';
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
                <div className={ERP_THEME.modal.overlay}>
                    <motion.div initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 25, opacity: 0 }}>

                        {/* 🪐 CONSUMO DO LAYOUT MESTRE CORPORATIVO */}
                        <UniversalViewerLayout
                            title={viewer.activeData.name}
                            sku={viewer.activeData.sku}
                            thumbnail={viewer.activeData.thumbnail}
                            createdAt={viewer.activeData.createdAt}
                            medias={viewer.medias}
                            onOpenLightbox={(media) => viewer.setActiveMedia(media)}
                            onClose={onClose}
                            timelineComponent={
                                <UniversalVersionTimeline
                                    loading={viewer.loading}
                                    versions={viewer.versions}
                                    activeUpdatedAt={viewer.activeData.updatedAt}
                                    onSelectVersion={viewer.handleSelectVersion}
                                    onRenameVersion={viewer.handleRenameVersion}
                                    onTogglePinVersion={viewer.handleTogglePinVersion}
                                    onDeleteVersion={viewer.handleDeleteVersion}
                                />
                            }
                        >
                            {/* 🧱 CONTEÚDO ESPECÍFICO DE INSUMOS: Passado de forma transparente como children */}
                            <div className="grid grid-cols-2 gap-3 select-none font-sans">
                                <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-1 border-b-2 border-b-orange-400">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1"><DollarSign className="w-3 h-3 text-orange-500" /> Preço de Custo Base</span>
                                    <span className="text-sm font-black text-slate-800 tabular-nums">{formatCurrencyBRL(viewer.activeData.price || 0)}</span>
                                </div>
                                <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-1 border-b-2 border-b-indigo-400">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1"><Archive className="w-3 h-3 text-indigo-500" /> Fração / Volume Contido</span>
                                    <span className="text-sm font-black text-slate-800 tabular-nums">{viewer.activeData.quantity || 0} {viewer.activeData.unit}</span>
                                </div>
                            </div>
                        </UniversalViewerLayout>

                    </motion.div>
                </div>
            </AnimatePresence>

            <MediaLightbox isOpen={viewer.activeMedia !== null} medias={viewer.medias} activeMedia={viewer.activeMedia} onClose={() => viewer.setActiveMedia(null)} onSelectMedia={(media) => viewer.setActiveMedia(media)} />
        </>
    );
}
