import { Image as ImageIcon } from 'lucide-react';
import { MediaManager } from '../MediaManager.tsx';
import { type MediaItem } from '../../types/appointment.ts';

interface StepMediaProps {
    thumbnail: string | null;
    medias: MediaItem[];
    setMedias: (updated: MediaItem[]) => void;
    setActiveMedia: (media: MediaItem) => void;
    handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function StepMedia({
    thumbnail,
    medias,
    setMedias,
    setActiveMedia,
    handleThumbnailUpload
}: StepMediaProps) {
    return (
        <div className="space-y-4 font-sans text-xs sm:text-sm">
            {/* 🖼️ Upload da Imagem de Capa Principal */}
            <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Imagem de Capa Principal
                </span>
                <div className="flex gap-3 items-center">
                    <div className="w-16 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0 shadow-xs select-none">
                        {thumbnail ? (
                            <img src={thumbnail} alt="Capa do item" className="w-full h-full object-cover pointer-events-none" />
                        ) : (
                            <span className="text-[9px] font-black text-white tracking-widest">BOX</span>
                        )}
                    </div>
                    <label className="px-3 py-1.5 border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl font-bold text-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer bg-slate-50/50 active:scale-98 select-none">
                        <span>{thumbnail ? 'Substituir Capa' : 'Escolher Imagem (PNG/JPG)'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                    </label>
                </div>
            </div>

            {/* 📁 Galeria de Mídias e Documentos Técnicos Compartilhada */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                    Galeria de Fotos & Documentos Técnicos
                </span>
                <MediaManager
                    medias={medias}
                    onChangeMedias={setMedias}
                    onOpenLightbox={setActiveMedia}
                />
            </div>
        </div>
    );
}
