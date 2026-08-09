import { type ReactNode } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { MediaManager } from './MediaManager.tsx';
import { type MediaItem } from '../types/appointment.ts';

interface UniversalViewerLayoutProps {
    title: string;
    sku?: string | null;
    thumbnail?: string | null;
    createdAt: string;
    medias: MediaItem[];
    onOpenLightbox: (media: MediaItem) => void;
    onClose: () => void;
    timelineComponent?: ReactNode; // ✨ Recebe o UniversalVersionTimeline dinamicamente
    children: ReactNode;            // ✨ Recebe os mini-cards matemáticos customizados de cada tela
}

export function UniversalViewerLayout({
    title, sku, thumbnail, createdAt, medias, onOpenLightbox, onClose, timelineComponent, children
}: UniversalViewerLayoutProps) {
    return (
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[85vh] overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative font-sans text-xs sm:text-sm select-none">

            {/* Botão Fechar Geral */}
            <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full cursor-pointer z-10 transition-colors active:scale-95">
                <X className="w-4 h-4" />
            </button>

            {/* COLUNA 1 & 2: DADOS DE LEITURA E GALERIA ADICIONAL */}
            <div className="md:col-span-2 space-y-4 pr-1 text-left">

                {/* 🖼️ HEADER DE CAPA UNIFICADO */}
                <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100/60 select-none">
                    <div className="w-16 h-12 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center shadow-3xs shrink-0 border border-slate-800">
                        {thumbnail ? (
                            <img src={thumbnail} alt={title} className="w-full h-full object-cover pointer-events-none" />
                        ) : (
                            <span className="text-[10px] font-black text-white tracking-widest">BOX</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        {sku && (
                            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase font-mono tabular-nums">
                                {sku}
                            </span>
                        )}
                        <h3 className="text-base font-black text-slate-800 truncate mt-1 leading-tight">{title}</h3>
                    </div>
                </div>

                {/* 🧱 FILHOS ADAPTÁVEIS: Aqui caem os mini-cards financeiros/estoque de cada página */}
                <div className="w-full block">
                    {children}
                </div>

                {/* 📁 GALERIA DE FOTOS E ANEXOS PADRONIZADA */}
                {medias.length > 0 && (
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
                            <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Galeria de Fotos & Documentos Técnicos</span>
                        </span>
                        <div className="[&_label]:hidden w-full block">
                            <MediaManager medias={medias} onChangeMedias={() => { }} onOpenLightbox={onOpenLightbox} />
                        </div>
                    </div>
                )}

                {/* Linha Cronológica de Inserção Base */}
                <div className="text-[10px] text-slate-400 font-bold block pt-1 font-sans select-none">
                    Data de registro do item: {new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* COLUNA 3: COMPONENTE DE AUDITORIA CRONOLÓGICA LATERAL */}
            {timelineComponent && (
                <div className="w-full block">
                    {timelineComponent}
                </div>
            )}

        </div>
    );
}
