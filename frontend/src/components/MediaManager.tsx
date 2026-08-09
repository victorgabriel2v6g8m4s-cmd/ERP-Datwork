import { Plus, X, FileText } from 'lucide-react';
import { type ChangeEvent } from 'react';
import { type MediaItem } from '../types/appointment.ts';
import { uploadMedia } from '../utils/uploadService.ts';

interface MediaManagerProps {
  medias: MediaItem[];
  onChangeMedias: (updated: MediaItem[]) => void;
  onOpenLightbox: (media: MediaItem) => void;
  uploadEndpoint?: string;
}

export function MediaManager({
  medias,
  onChangeMedias,
  onOpenLightbox,
  uploadEndpoint = '/appointments/upload'
}: MediaManagerProps) {
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    const uploadedMedias: MediaItem[] = [];

    for (const file of files) {
      const media = await uploadMedia(file, uploadEndpoint);
      if (media) uploadedMedias.push(media);
    }

    if (uploadedMedias.length > 0) {
      onChangeMedias([...medias, ...uploadedMedias]);
    }

    input.value = '';
  };

  const handleRemoveMedia = (id: string) => {
    onChangeMedias(medias.filter((media) => media.id !== id));
  };

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {medias.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenLightbox(item)}
            className="relative group border border-slate-100 rounded-xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center shadow-3xs cursor-pointer hover:ring-2 hover:ring-indigo-500/30 transition-all"
          >
            {item.type === 'image' ? (
              <img src={item.url} alt={item.name} className="object-cover w-full h-full" />
            ) : item.type === 'video' ? (
              <video src={`${item.url}#t=0.5`} className="object-cover w-full h-full pointer-events-none bg-black" preload="metadata" />
            ) : (
              <div className="flex flex-col items-center gap-1 p-2 text-center w-full bg-slate-50">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] text-slate-600 font-semibold truncate w-full px-1">{item.name}</span>
              </div>
            )}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleRemoveMedia(item.id);
              }}
              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md z-20"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <label className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl aspect-video flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer bg-slate-50/50">
          <Plus className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase">Anexar Arquivo</span>
          <input type="file" multiple className="hidden" onChange={handleFileUpload} />
        </label>
      </div>
    </div>
  );
}
