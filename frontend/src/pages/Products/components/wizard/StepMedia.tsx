import { Image as ImageIcon } from 'lucide-react';
import { MediaManager } from '../../../../components/MediaManager.tsx';
import { type MediaItem } from '../../../../types/media.ts';
import { PRODUCT_THUMBNAIL_UPLOAD } from '../../constants/product-upload.constants.ts';

interface StepMediaProps {
    thumbnail: string | null;
    medias: MediaItem[];
    setMedias: (updated: MediaItem[]) => void;
    setActiveMedia: (media: MediaItem) => void;
    handleThumbnailUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    isThumbnailUploading: boolean;
    thumbnailError: string | null;
}

export function StepMedia({
    thumbnail,
    medias,
    setMedias,
    setActiveMedia,
    handleThumbnailUpload,
    isThumbnailUploading,
    thumbnailError
}: StepMediaProps) {
    return (
        <div className="space-y-4 font-sans text-xs sm:text-sm">
            <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Imagem de Capa Principal
                </span>
                <div className="flex gap-3 items-center">
                    <div className="w-16 h-12 rounded-xl bg-slate-900 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-3xs">
                        {thumbnail ? (
                            <img src={thumbnail} alt="Capa" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[9px] font-black text-white">BOX</span>
                        )}
                    </div>
                    <label className={`px-3 py-1.5 border border-dashed rounded-xl font-bold text-xs transition-colors bg-slate-50/50 ${isThumbnailUploading ? 'border-slate-200 text-slate-300 cursor-wait' : 'border-slate-300 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 cursor-pointer'}`}>
                        <span>
                            {isThumbnailUploading ? 'Enviando...' : thumbnail ? 'Substituir Capa' : 'Escolher Imagem'}
                        </span>
                        <input
                            type="file"
                            accept={PRODUCT_THUMBNAIL_UPLOAD.acceptAttribute}
                            className="hidden"
                            disabled={isThumbnailUploading}
                            onChange={handleThumbnailUpload}
                        />
                    </label>
                </div>
                {thumbnailError && (
                    <p className="text-[10px] font-semibold text-rose-600">{thumbnailError}</p>
                )}
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Galeria de Fotos & Documentos Técnicos
                </span>
                <MediaManager
                    medias={medias}
                    onChangeMedias={setMedias}
                    onOpenLightbox={setActiveMedia}
                    uploadEndpoint="/products/upload"
                />
            </div>
        </div>
    );
}
