import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FlaskConical, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../../../api/client.ts';
import { type MediaItem } from '../../../types/appointment.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';

// ♻️ REUTILIZAÇÃO EXTREMA (CLEAN CODE)
import { StepIdentification } from '../../Products/components/wizard/StepIdentification.tsx'; // Reciclado de Produtos
import { StepIngredientMetrics } from './wizard/StepIngredientMetrics.tsx'; // Local de Insumos
import { StepMedia } from '../../Products/components/wizard/StepMedia.tsx'; // Reciclado de Produtos para a nova Etapa 3

interface CreateIngredientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => Promise<void>;
}

export function CreateIngredientModal({ isOpen, onClose, onSave }: CreateIngredientModalProps) {
    // 🧭 Controle do Fluxo: Insumos agora possuem 3 etapas completas
    const [step, setStep] = useState(1);

    // 📝 ESTADOS DA ETAPA 1: Identificação (SKU e Nome)
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    // Estados de produtos repassados vazios para reaproveitar o formulário
    const [brand, setBrand] = useState('');
    const [variation, setVariation] = useState('');
    const [description, setDescription] = useState('');

    // 🪙 ESTADOS DA ETAPA 2: Métricas de Insumos
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('Unidades');

    // 📁 ESTADOS DA ETAPA 3: Capa & Galeria de Anexos
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [medias, setMedias] = useState<MediaItem[]>([]);
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

    // 📈 Barra de Progresso Verde Dinâmica adaptada para 3 etapas (0%, 50% e 100%)
    const progressPercent = ((step - 1) / 2) * 100;

    const handleNextStep = () => {
        if (step === 1 && (!sku.trim() || !name.trim())) return; // Trava obrigatória de identificação
        setStep((prev) => Math.min(prev + 1, 3));
    };

    const handlePrevStep = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

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
            console.error('🔥 Falha ao carregar imagem de capa do insumo:', error);
        }
    };

    const handleSubmit = async () => {
        if (!sku.trim() || !name.trim()) return;

        await onSave({
            sku: sku.trim().toUpperCase(),
            name: name.trim(),
            price,
            quantity,
            unit,
            thumbnail,
            medias: JSON.stringify(medias) // Agora persistindo a galeria completa no SQLite!
        });

        handleReset();
    };

    const handleReset = () => {
        setStep(1);
        setSku(''); setName(''); setPrice(0); setQuantity(1); setUnit('Unidades'); setThumbnail(null); setMedias([]);
        onClose();
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
                {/* Cabeçalho */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-orange-600">
                        <FlaskConical className="w-5 h-5" />
                        <h3 className="text-base font-black text-slate-800">Assistente de Insumos</h3>
                    </div>
                    <button type="button" onClick={handleReset} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 📈 INDICADOR VISUAL: Linha Verde Dinâmica Escalada para 3 fases */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <span>Etapa {step} de 3</span>
                        <span className="text-emerald-600 font-bold">
                            {step === 1 && 'Identificação Básica'}
                            {step === 2 && 'Métricas de Custo'}
                            {step === 3 && 'Galeria & Capa'}
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

                {/* Corpo do Assistente Condensado */}
                <div className="py-2 min-h-[160px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="ing-s1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                                <StepIdentification
                                    sku={sku} setSku={setSku}
                                    name={name} setName={setName}
                                    brand={brand} setBrand={setBrand}
                                    variation={variation} setVariation={setVariation}
                                    description={description} setDescription={setDescription}
                                    hideOptionalFields={true} // ✨ Oculta marca, variação e descrição no cadastro de insumos
                                />
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="ing-s2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                                <StepIngredientMetrics
                                    price={price} setPrice={setPrice}
                                    quantity={quantity} setQuantity={setQuantity}
                                    unit={unit} setUnit={setUnit}
                                />
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="ing-s3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                                {/* ✨ RECICLADO EM GRAU MÁXIMO: Invocando o bloco de mídias de produtos */}
                                <StepMedia
                                    thumbnail={thumbnail}
                                    medias={medias}
                                    setMedias={setMedias}
                                    setActiveMedia={setActiveMedia}
                                    handleThumbnailUpload={handleThumbnailUpload}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Barra de Ações Inferiores de Navegação */}
                <div className="flex gap-2 border-t border-slate-100 pt-4 text-xs font-bold">
                    {step > 1 ? (
                        <button type="button" onClick={handlePrevStep} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1">
                            <ArrowLeft className="w-3.5 h-3.5" /> <span>Voltar</span>
                        </button>
                    ) : (
                        <button type="button" onClick={handleReset} className="px-4 py-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer">
                            Cancelar
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={handleNextStep}
                            disabled={step === 1 && (!sku.trim() || !name.trim())}
                            className={`px-5 py-2.5 font-bold rounded-xl text-white transition-all flex items-center gap-1 cursor-pointer ml-auto ${step === 1 && (!sku.trim() || !name.trim()) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100'
                                }`}
                        >
                            <span>Avançar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors flex items-center gap-1 shadow-md shadow-emerald-100 cursor-pointer ml-auto">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Concluir Cadastro</span>
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Lightbox linear de mídias em tela cheia (Reciclado de forma transparente) */}
            <MediaLightbox isOpen={activeMedia !== null} medias={medias} activeMedia={activeMedia} onClose={() => setActiveMedia(null)} onSelectMedia={(media) => setActiveMedia(media)} />
        </div>
    );
}
