import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import { type MediaItem } from '../../../types/appointment.ts';

interface MediaLightboxProps {
    media: MediaItem | null;
    onClose: () => void;
}

export function MediaLightbox({ media, onClose }: MediaLightboxProps) {
    return (
        <AnimatePresence>
            {media && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md"
                >
                    <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>

                    <motion.div
                        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-4xl max-h-[80vh] w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {media.type === 'image' && (
                            <img src={media.url} alt={media.name} className="object-contain max-w-full max-h-[80vh] rounded-xl" />
                        )}

                        {media.type === 'video' && (
                            <video src={media.url} controls autoPlay className="w-full max-h-[80vh] rounded-xl bg-black focus:outline-none" />
                        )}

                        {media.type === 'document' && (
                            <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-sm font-sans">
                                <FileText className="w-12 h-12 text-slate-400" />
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm truncate max-w-xs">{media.name}</h4>
                                    <p className="text-xs text-slate-400 mt-1">Este arquivo é um documento e deve ser aberto externamente.</p>
                                </div>
                                <a href={media.url} target="_blank" rel="noreferrer" className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 text-center">
                                    Abrir em Nova Aba
                                </a>
                            </div>
                        )}
                    </motion.div>
                    <span className="text-white/60 text-xs mt-3 font-medium truncate max-w-md font-sans">{media.name}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
