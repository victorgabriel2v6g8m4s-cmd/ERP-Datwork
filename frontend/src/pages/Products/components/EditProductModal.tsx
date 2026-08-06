import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tags, CheckCircle, Package, Coins, BarChart3, Image as ImageIcon } from 'lucide-react';
import { api } from '../../../api/client.ts';
import { type Product } from '../../../types/product.ts';
import { type MediaItem } from '../../../types/appointment.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';

// ♻️ REUTILIZAÇÃO: Importação dos mesmos blocos atômicos do assistente
import { StepIdentification } from './wizard/StepIdentification.tsx';
import { StepCosts } from './wizard/StepCosts.tsx';
import { StepPricing } from './wizard/StepPricing.tsx';
import { StepMedia } from './wizard/StepMedia.tsx';

interface EditProductModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onSave: (id: string, payload: any) => Promise<void>;
}

export function EditProductModal({ isOpen, product, onClose, onSave }: EditProductModalProps) {
    // 🗂️ Controle de abertura das seções da Sanfona
    const [openSection, setOpenSection] = useState<'id' | 'costs' | 'pricing' | 'media' | null>('id');

    // 📝 ESTADOS GLOBAIS DO FORMULÁRIO (Alimentados reativamente pelo produto selecionado)
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [variation, setVariation] = useState('');
    const [description, setDescription] = useState('');

    const [batchCost, setBatchCost] = useState(0);
    const [unitsPerBatch, setUnitsPerBatch] = useState(1);
    const [productionCostInput, setProductionCostInput] = useState(0);
    const [calculatedProductionCost, setCalculatedProductionCost] = useState(0);
    const [calculatedTotalUnitCost, setCalculatedTotalUnitCost] = useState(0);
    const [abcCategory, setAbcCategory] = useState('C');

    const [salePrice, setSalePrice] = useState(0);
    const [stockQuantity, setStockQuantity] = useState(0);

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [medias, setMedias] = useState<MediaItem[]>([]);
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

    // 🔌 Sincroniza e preenche os estados reativamente assim que o usuário faz o Swipe Direito
    useEffect(() => {
        if (product) {
            setSku(product.sku);
            setName(product.name);
            setBrand(product.brand || '');
            setVariation(product.variation || '');
            setDescription(product.description || '');
            setBatchCost(product.batchCost);
            setUnitsPerBatch(product.unitsPerBatch);
            setProductionCostInput(product.productionCost);
            setSalePrice(product.finalPrice);
            setThumbnail(product.thumbnail || null);
            setMedias(product.medias ? JSON.parse(product.medias) : []);
            setOpenSection('id'); // Reseta para a primeira sanfona ao abrir
        }
    }, [product, isOpen]);

    // 🧮 Motor de Cálculo Financeiro Automático do Lote
    useEffect(() => {
        const baseUnitCost = batchCost / (unitsPerBatch || 1);
        setCalculatedProductionCost(baseUnitCost);

        const totalUnit = baseUnitCost + productionCostInput;
        setCalculatedTotalUnitCost(totalUnit);
    }, [batchCost, unitsPerBatch, productionCostInput]);

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/products/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setThumbnail(response.data.url);
        } catch (error) {
            console.error('🔥 Falha ao carregar imagem de capa na edição:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !sku.trim() || !name.trim()) return;

        await onSave(product.id, {
            sku: sku.trim().toUpperCase(),
            name: name.trim(),
            brand: brand.trim() || 'Sem Marca',
            variation: variation.trim() || null,
            description: description.trim() || null,
            batchCost,
            unitsPerBatch,
            productionCost: productionCostInput,
            totalUnitCost: calculatedTotalUnitCost,
            abcCategory,
            salePrice,
            stockQuantity,
            thumbnail,
            medias: JSON.stringify(medias)
        });

        onClose();
    };

    if (!isOpen || !product) return null;

    const toggleSection = (section: 'id' | 'costs' | 'pricing' | 'media') => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm select-none">
            <motion.form
                onSubmit={handleSubmit}
                initial={{ y: 35, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 35, opacity: 0 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
            >
                {/* 🔮 Cabeçalho do Painel */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Tags className="w-5 h-5" />
                        <h3 className="text-base font-black text-slate-800">Alterar Informações</h3>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 🗂️ SEÇÃO SANFONA 1: IDENTIFICAÇÃO (REUTILIZADA) */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                    <button
                        type="button" onClick={() => toggleSection('id')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-slate-400" /> Identificação Básica</span>
                        <motion.span animate={{ rotate: openSection === 'id' ? 90 : 0 }} className="text-slate-400 font-mono text-xs block">▶</motion.span>
                    </button>
                    <AnimatePresence>
                        {openSection === 'id' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
                                <StepIdentification sku={sku} setSku={setSku} name={name} setName={setName} brand={brand} setBrand={setBrand} variation={variation} setVariation={setVariation} description={description} setDescription={setDescription} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 🗂️ SEÇÃO SANFONA 2: CUSTOS E LOTE (REUTILIZADA) */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                    <button
                        type="button" onClick={() => toggleSection('costs')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        <span className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-slate-400" /> Precificação de Lote</span>
                        <motion.span animate={{ rotate: openSection === 'costs' ? 90 : 0 }} className="text-slate-400 font-mono text-xs block">▶</motion.span>
                    </button>
                    <AnimatePresence>
                        {openSection === 'costs' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
                                <StepCosts batchCost={batchCost} setBatchCost={setBatchCost} unitsPerBatch={unitsPerBatch} setUnitsPerBatch={setUnitsPerBatch} productionCostInput={productionCostInput} setProductionCostInput={setProductionCostInput} calculatedProductionCost={calculatedProductionCost} calculatedTotalUnitCost={calculatedTotalUnitCost} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 🗂️ SEÇÃO SANFONA 3: METAS E CURVA ABC (REUTILIZADA) */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                    <button
                        type="button" onClick={() => toggleSection('pricing')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-slate-400" /> Canais de Margem & Giro</span>
                        <motion.span animate={{ rotate: openSection === 'pricing' ? 90 : 0 }} className="text-slate-400 font-mono text-xs block">▶</motion.span>
                    </button>
                    <AnimatePresence>
                        {openSection === 'pricing' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
                                <StepPricing salePrice={salePrice} setSalePrice={setSalePrice} stockQuantity={stockQuantity} setStockQuantity={setStockQuantity} abcCategory={abcCategory} setAbcCategory={setAbcCategory} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 🗂️ SEÇÃO SANFONA 4: GALERIA E CAPA DE MÍDIAS (REUTILIZADA) */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                    <button
                        type="button" onClick={() => toggleSection('media')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        <span className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-slate-400" /> Fotos & Anexos Técnicos</span>
                        <motion.span animate={{ rotate: openSection === 'media' ? 90 : 0 }} className="text-slate-400 font-mono text-xs block">▶</motion.span>
                    </button>
                    <AnimatePresence>
                        {openSection === 'media' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
                                <StepMedia thumbnail={thumbnail} medias={medias} setMedias={setMedias} setActiveMedia={setActiveMedia} handleThumbnailUpload={handleThumbnailUpload} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 🛠️ Rodapé de Ações Finais */}
                <div className="flex gap-3 border-t border-slate-100 pt-4 text-xs font-bold">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                        Desistir
                    </button>
                    <button type="submit" disabled={!sku.trim() || !name.trim()} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center justify-center gap-1 shadow-md shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Salvar Alterações</span>
                    </button>
                </div>
            </motion.form>

            {/* 🖼️ Lightbox de tela cheia linear para mídias do produto (COMPONENTE REUTILIZADO) */}
            <MediaLightbox isOpen={activeMedia !== null} medias={medias} activeMedia={activeMedia} onClose={() => setActiveMedia(null)} onSelectMedia={(media) => setActiveMedia(media)} />
        </div>
    );
}