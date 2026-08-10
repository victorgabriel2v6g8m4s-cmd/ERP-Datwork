import { Image as ImageIcon } from 'lucide-react';
import { TEXTS } from '../../i18n/index.ts';
import type { MediaItem } from '../../types/media.ts';
import { UI_KEYS } from '../../ui/keys.ts';
import { MediaManager } from '../MediaManager.tsx';

interface StepMediaProps {
  thumbnail: string | null;
  medias: MediaItem[];
  setMedias: (updated: MediaItem[]) => void;
  setActiveMedia: (media: MediaItem) => void;
  handleThumbnailUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploadEndpoint?: string;
  isThumbnailUploading?: boolean;
}

export function StepMedia({
  thumbnail,
  medias,
  setMedias,
  setActiveMedia,
  handleThumbnailUpload,
  uploadEndpoint,
  isThumbnailUploading = false
}: StepMediaProps) {
  return (
    <div className="space-y-4 font-sans text-xs sm:text-sm" data-ui-key={UI_KEYS.ingredients.formMedia}>
      <div className="space-y-1.5">
        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> {TEXTS.ingredients.form.cover}
        </span>
        <div className="flex gap-3 items-center">
          <div className="w-16 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0 shadow-xs select-none">
            {thumbnail ? (
              <img src={thumbnail} alt={TEXTS.ingredients.form.coverAlt} className="w-full h-full object-cover pointer-events-none" />
            ) : (
              <span className="text-[9px] font-black text-white tracking-widest">MAT</span>
            )}
          </div>
          <label className="px-3 py-1.5 border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl font-bold text-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer bg-slate-50/50 active:scale-98 select-none">
            <span>{isThumbnailUploading ? TEXTS.common.status.uploading : thumbnail ? TEXTS.common.actions.replaceCover : TEXTS.common.actions.chooseImage}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={isThumbnailUploading} />
          </label>
        </div>
      </div>

      <div className="space-y-1.5 border-t border-slate-100 pt-3">
        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
          {TEXTS.ingredients.form.gallery}
        </span>
        <MediaManager
          medias={medias}
          onChangeMedias={setMedias}
          onOpenLightbox={setActiveMedia}
          uploadEndpoint={uploadEndpoint}
        />
      </div>
    </div>
  );
}
