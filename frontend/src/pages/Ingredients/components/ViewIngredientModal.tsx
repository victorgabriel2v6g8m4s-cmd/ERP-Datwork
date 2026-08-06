import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, FlaskConical, Archive, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { api } from '../../../api/client.ts';
import { type Ingredient } from '../../../types/ingredient.ts';
import { type MediaItem } from '../../../types/appointment.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';
import { MediaManager } from '../../../components/MediaManager.tsx'; // ✨ Reutilizado
import { MediaLightbox } from '../../../components/MediaLightbox.tsx'; // ✨ Reutilizado

interface ViewIngredientModalProps {
    isOpen: boolean;
    ingredient: Ingredient | null;
    onClose: () => void;
}

export function ViewIngredientModal({ isOpen, ingredient, onClose }: ViewIngredientModalProps) {
    const [versions, setVersions] = useState<any[]>([]);
    const [activeData, setActiveData] = useState<Ingredient | null>(null);
    const [loading, setLoading] = useState(false);

    // ✨ Novos: Estados de mídias e fotos ativas para o Lightbox em tela cheia
    const [medias, setMedias] = useState<MediaItem[]>([]);
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

    useEffect(() => {
        if (isOpen && ingredient) {
            setActiveData(ingredient);

            // ✨ BLINDAGEM SUPREMA: Filtra e higieniza as mídias iniciais do insumo
            try {
                const rawMedias = (ingredient as any).medias;
                if (rawMedias) {
                    const parsed = typeof rawMedias === 'string' ? JSON.parse(rawMedias) : rawMedias;
                    const cleaned = Array.isArray(parsed)
                        ? parsed
                            .filter(m => m !== null && m !== undefined)
                            .map((m, idx) => ({
                                ...m,
                                id: m.id && m.id.trim() !== "" ? m.id : `media-init-${idx}` // Força ID único se estiver vazio
                            }))
                        : [];
                    setMedias(cleaned);
                } else {
                    setMedias([]);
                }
            } catch {
                setMedias([]);
            }

            fetchVersions(ingredient.id);
        }
    }, [isOpen, ingredient]);

    const fetchVersions = async (id: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/products/${id}/versions`);
            setVersions(response.data);
        } catch { setVersions([]); }
        finally { setLoading(false); }
    };

    const handleSelectVersion = (snapshotJson: string) => {
        try {
            const historical = JSON.parse(snapshotJson);
            setActiveData(historical);

            // ✨ BLINDAGEM DO SNAPSHOT: Garante IDs únicos na linha do tempo para reverter versões sem crash
            if (historical.medias) {
                const parsed = typeof historical.medias === 'string' ? JSON.parse(historical.medias) : historical.medias;
                const cleaned = Array.isArray(parsed)
                    ? parsed
                        .filter(m => m !== null && m !== undefined)
                        .map((m, idx) => ({
                            ...m,
                            id: m.id && m.id.trim() !== "" ? m.id : `media-hist-${idx}` // Força ID único na árvore do React 19
                        }))
                    : [];
                setMedias(cleaned);
            } else {
                setMedias([]);
            }
        } catch (error) {
            console.error('🔥 Falha ao parsear mídias históricas:', error);
            setMedias([]);
        }
    };

    if (!isOpen || !activeData) return null;

    return (
        // ✨ CAMADA CENTRAL: O AnimatePresence agora gerencia unicamente a animação de entrada/saída do Modal, sem colisão de chaves
        <>
            <AnimatePresence>
                {isOpen && activeData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans text-xs sm:text-sm select-none">
                        <motion.div
                            key="view-ingredient-modal-card" // ✨ Adicionado chave única no filho direto do AnimatePresence
                            initial={{ y: 25, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 25, opacity: 0 }}
                            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[85vh] overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative"
                        >
                            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer z-10">
                                <X className="w-4 h-4" />
                            </button>

                            {/* COLUNA 1 & 2: DADOS DE LEITURA E GALERIA ADICIONAL DE ANEXOS */}
                            <div className="md:col-span-2 space-y-4 pr-1">
                                <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="w-16 h-12 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center shadow-3xs shrink-0">
                                        {activeData.thumbnail ? <img src={activeData.thumbnail} alt={activeData.name} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-white">MAT</span>}
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase font-mono tabular-nums">{activeData.sku}</span>
                                        <h3 className="text-base font-black text-slate-800 truncate mt-1 leading-tight">{activeData.name}</h3>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1"><DollarSign className="w-3 h-3 text-orange-500" /> Preço de Custo Base</span>
                                        <span className="text-sm font-black text-slate-800 tabular-nums">{formatCurrencyBRL(activeData.price || 0)}</span>
                                    </div>
                                    <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1"><Archive className="w-3 h-3 text-indigo-500" /> Fração / Volume Contido</span>
                                        <span className="text-sm font-black text-slate-800 tabular-nums">{activeData.quantity || 0} {activeData.unit}</span>
                                    </div>
                                </div>

                                {/* Galeria de Fotos em Modo Leitura */}
                                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Galeria de Fotos & Documentos Técnicos</span>
                                    <MediaManager medias={medias} onChangeMedias={() => { }} onOpenLightbox={(media) => setActiveMedia(media)} />
                                </div>

                                <div className="text-[10px] text-slate-400 font-bold block pt-1">
                                    Data de inserção da matéria-prima: {new Date(activeData.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </div>
                            </div>

                            {/* COLUNA 3: HISTÓRICO DE VERSÕES CRONOLÓGICAS BLINDADO */}
                            <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Histórico por Data
                                </h4>
                                {loading ? (
                                    <div className="text-center py-6 text-slate-400 animate-pulse">Carregando logs...</div>
                                ) : (
                                    <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1 divide-y divide-slate-50">
                                        {versions.map((v, index) => {
                                            const isCurrentSelected = activeData.updatedAt === JSON.parse(v.snapshotData).updatedAt;
                                            return (
                                                <button
                                                    key={`version-log-${index}`}
                                                    type="button"
                                                    onClick={() => handleSelectVersion(v.snapshotData)}
                                                    className={`w-full text-left p-2 rounded-xl border font-sans text-xs flex items-center justify-between cursor-pointer transition-all ${isCurrentSelected
                                                        ? 'bg-orange-500 border-orange-500 text-white font-bold shadow-3xs'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className="text-[10px] font-black tracking-wide uppercase opacity-75">Log V{versions.length - index}</div>
                                                        <div className="font-semibold tabular-nums mt-0.5">
                                                            {new Date(v.versionDate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ✨ SOLUÇÃO DEFINITIVA: O Lightbox agora flutua fora do AnimatePresence, limpando o erro do console */}
            <MediaLightbox
                key="view-ingredient-media-lightbox"
                isOpen={activeMedia !== null}
                medias={medias}
                activeMedia={activeMedia}
                onClose={() => setActiveMedia(null)}
                onSelectMedia={(media) => setActiveMedia(media)}
            />
        </>
    );
}