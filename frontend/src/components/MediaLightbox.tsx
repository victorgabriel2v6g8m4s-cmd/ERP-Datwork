import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { type MediaItem } from '../types/appointment.ts';

interface MediaLightboxProps {
  isOpen: boolean;
  medias: MediaItem[];
  activeMedia: MediaItem | null;
  onClose: () => void;
  onSelectMedia: (media: MediaItem) => void;
}

export function MediaLightbox({ isOpen, medias, activeMedia, onClose, onSelectMedia }: MediaLightboxProps) {
  if (!isOpen || !activeMedia) return null;

  // Encontra o índice atual para gerenciar as setas e navegação
  const currentIndex = medias.findIndex((m) => m.id === activeMedia.id);

  const handleNext = () => {
    if (currentIndex < medias.length - 1) {
      onSelectMedia(medias[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectMedia(medias[currentIndex - 1]);
    }
  };

  // 📱 Detecta o gesto de deslizar para os lados (Swipe) na tela cheia
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -60) {
      handleNext(); // Deslizou para a esquerda -> Próxima
    } else if (info.offset.x > 60) {
      handlePrev(); // Deslizou para a direita -> Anterior
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md select-none touch-none font-sans"
      >
        {/* Botão Fechar */}
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-50">
          <X className="w-5 h-5" />
        </button>

        {/* ⬅️ Seta Esquerda (Oculta se for a primeira mídia) */}
        {currentIndex > 0 && (
          <button type="button" onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-4 p-3 bg-white/5 hover:bg-white/15 text-white rounded-full transition-all cursor-pointer z-40 hidden sm:block">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* ➡️ Seta Direita (Oculta se for a última mídia) */}
        {currentIndex < medias.length - 1 && (
          <button type="button" onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-4 p-3 bg-white/5 hover:bg-white/15 text-white rounded-full transition-all cursor-pointer z-40 hidden sm:block">
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* 📱 Área de Conteúdo Arrastável (Suporta o Swipe) */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.4}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          className="max-w-4xl max-h-[75vh] w-full flex items-center justify-center rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {activeMedia.type === 'image' && (
            <motion.img key={activeMedia.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} src={activeMedia.url} alt={activeMedia.name} className="object-contain max-w-full max-h-[75vh] rounded-xl pointer-events-none" />
          )}

          {activeMedia.type === 'video' && (
            <video key={activeMedia.id} src={activeMedia.url} controls autoPlay className="w-full max-h-[75vh] rounded-xl bg-black focus:outline-none" />
          )}

          {activeMedia.type === 'document' && (
            <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-sm shadow-xl">
              <FileText className="w-12 h-12 text-slate-400" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm truncate max-w-xs">{activeMedia.name}</h4>
                <p className="text-xs text-slate-400 mt-1">Documento geral.</p>
              </div>
              <a href={activeMedia.url} target="_blank" rel="noreferrer" className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 transition-colors text-center">Abrir Documento</a>
            </div>
          )}
        </motion.div>

        {/* Legenda e Paginação */}
        <div className="absolute bottom-4 text-center space-y-1 z-40">
          <p className="text-white/80 text-xs font-medium truncate max-w-md px-4">{activeMedia.name}</p>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-wider">{currentIndex + 1} de {medias.length}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
