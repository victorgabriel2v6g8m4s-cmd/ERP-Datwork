import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FlaskConical, CheckCircle, Package, Coins, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { api } from '../../../api/client.ts';
import { type Ingredient } from '../../../types/ingredient.ts';
import { type MediaItem } from '../../../types/appointment.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';

// ♻️ RECICLAGEM COMPLETA
import { StepIdentification } from '../../Products/components/wizard/StepIdentification.tsx';
import { StepIngredientMetrics } from './wizard/StepIngredientMetrics.tsx';
import { StepMedia } from '../../Products/components/wizard/StepMedia.tsx';

interface EditIngredientModalProps {
    isOpen: boolean;
    ingredient: Ingredient | null;
    onClose: () => void;
    onSave: (id: string, payload: any) => Promise<void>;
}

export function EditIngredientModal({ isOpen, ingredient, onClose, onSave }: EditIngredientModalProps) {
    const [openSection, setOpenSection] = useState<'id' | 'metrics' | 'media' | null>('id');

    // Estados locais sincronizados de Insumos
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('Unidades');

    // Estados de mídias e fotos anexadas
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [medias, setMedias] = useState<MediaItem[]>([]);
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

    // Estados inertes exigidos pelo StepIdentification reciclado de produtos
    const [brand, setBrand] = useState('');
    const [variation, setVariation] = useState('');
    const [description, setDescription] = useState('');

    // 🔌 Sincroniza e limpa as chaves para evitar chaves duplicadas no React 19
    useEffect(() => {
        if (ingredient && isOpen) {
            setSku(ingredient.sku);
            setName(ingredient.name);
            setPrice(ingredient.price);
            setQuantity(ingredient.quantity);
            setUnit(ingredient.unit);
            setThumbnail(ingredient.thumbnail || null);

            // ✨ BLINDAGEM: Garante que o JSON de mídias seja lido corretamente e nunca nulo ou vazio
            try {
                const rawMedias = (ingredient as any).medias;
                if (rawMedias) {
                    const parsed = typeof rawMedias === 'string' ? JSON.parse(rawMedias) : rawMedias;
                    // Filtra para garantir que apenas objetos válidos com ID entrem na renderização
                    setMedias(Array.isArray(parsed) ? parsed.filter(m => m && m.id) : []);
                } else {
                    setMedias([]);
                }
            } catch {
                setMedias([]);
            }

            setOpenSection('id');
        }
    }, [ingredient, isOpen]);

    // Motor de Cálculo Financeiro Automático do Lote
    useEffect(() => {
        // Inerte para insumos mas preserva o gatilho sem erros
    }, [price, quantity]);

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0]; // Captura o primeiro arquivo de forma isolada
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/products/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setThumbnail(response.data.url);
        } catch (error) {
            console.error('🔥 Falha ao carregar capa na edição:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ingredient || !sku.trim() || !name.trim()) return;

        // ✨ CORREÇÃO CRUCIAL: Repassa os dados consolidados para o callback pai
        await onSave(ingredient.id, {
            sku: sku.trim().toUpperCase(),
            name: name.trim(),
            price,
            quantity,
            unit,
            thumbnail,
            medias: JSON.stringify(medias)
        });
    };

    if (!isOpen || !ingredient) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm select-none">
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ y: 35, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 35, opacity: 0 }}
                    className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
                >
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 text-orange-500">
                            <FlaskConical className="w-5 h-5" />
                            <h3 className="text-base font-black text-slate-800">Alterar Insumo</h3>
                        </div>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* SANFONA 1: IDENTIFICAÇÃO (CAMPOS EXTRA DE PRODUTOS OCULTADOS) */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                        <button
                            type="button"
                            onClick={() => setOpenSection(openSection === 'id' ? null : 'id')}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 font-bold text-xs uppercase text-slate-700 cursor-pointer"
                        >
                            <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-slate-400" /> Identificação Básica</span>
                            <motion.div animate={{ rotate: openSection === 'id' ? 90 : 0 }} className="text-slate-400">
                                <ChevronRight className="w-4 h-4" />
                            </motion.div>
                        </button>
                        <AnimatePresence>
                            {openSection === 'id' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
                                    {/* ✨ POLIMORFISMO ATIVADO: Injetado hideOptionalFields para limpar a tela de Insumos */}
                                    <StepIdentification
                                        sku={sku} setSku={setSku}
                                        name={name} setName={setName}
                                        brand={brand} setBrand={setBrand}
                                        variation={variation} setVariation={setVariation}
                                        description={description} setDescription={setDescription}
                                        hideOptionalFields={true}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SANFONA 2: MÉTRICAS E PREÇO */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                        <button
                            type="button"
                            onClick={() => setOpenSection(openSection === 'metrics' ? null : 'metrics')}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 font-bold text-xs uppercase text-slate-700 cursor-pointer"
                        >
                            <span className="flex items-center gap-1.5"><Coins className="w-4 h-4 text-slate-400" /> Métricas de Custo</span>
                            <motion.div animate={{ rotate: openSection === 'metrics' ? 90 : 0 }} className="text-slate-400">
                                <ChevronRight className="w-4 h-4" />
                            </motion.div>
                        </button>
                        <AnimatePresence>
                            {openSection === 'metrics' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
                                    <StepIngredientMetrics price={price} setPrice={setPrice} quantity={quantity} setQuantity={setQuantity} unit={unit} setUnit={setUnit} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SANFONA 3: REAPROVEITAMENTO DO GERENCIADOR DE MÍDIAS */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                        <button
                            type="button"
                            onClick={() => setOpenSection(openSection === 'media' ? null : 'media')}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 font-bold text-xs uppercase text-slate-700 cursor-pointer"
                        >
                            <span className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-slate-400" /> Fotos & Mídias Anexas</span>
                            <motion.div animate={{ rotate: openSection === 'media' ? 90 : 0 }} className="text-slate-400">
                                <ChevronRight className="w-4 h-4" />
                            </motion.div>
                        </button>
                        <AnimatePresence>
                            {openSection === 'media' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white border-t border-slate-100 overflow-hidden">
                                    <StepMedia thumbnail={thumbnail} medias={medias} setMedias={setMedias} setActiveMedia={setActiveMedia} handleThumbnailUpload={handleThumbnailUpload} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-3 border-t border-slate-100 pt-4 font-bold">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-xl cursor-pointer">Desistir</button>
                        <button type="submit" disabled={!sku.trim() || !name.trim()} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-1 shadow-md shadow-indigo-100 cursor-pointer disabled:opacity-40">
                            <CheckCircle className="w-3.5 h-3.5" /> <span>Salvar Alterações</span>
                        </button>
                    </div>
                </motion.form>
            </div>

            {/* ✨ ISOLADO DO ANIMATEPRESENCE: O Lightbox em tela cheia opera livre de avisos de chaves */}
            <MediaLightbox
                key="edit-ingredient-media-lightbox"
                isOpen={activeMedia !== null}
                medias={medias}
                activeMedia={activeMedia}
                onClose={() => setActiveMedia(null)}
                onSelectMedia={(media) => setActiveMedia(media)}
            />
        </>
    );
}