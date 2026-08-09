import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { type MediaItem } from '../types/appointment.ts';
import { CustomLogger } from '../utils/CustomLogger.ts';

interface MediaLightboxProps {
  isOpen: boolean;
  medias: MediaItem[];
  activeMedia: MediaItem | null;
  onClose: () => void;
  onSelectMedia: (media: MediaItem) => void;
}

export function MediaLightbox({ isOpen, medias, activeMedia, onClose, onSelectMedia }: MediaLightboxProps) {
  // Cláusula de barreira rígida para evitar processamento se estiver inativo
  if (!isOpen || !activeMedia) return null;

  // Encontra o índice atual para gerenciar as setas e navegação linear
  const currentIndex = medias.findIndex((m) => m.id === activeMedia.id);
  const totalMedias = medias.length;

  const handleNext = () => {
    if (currentIndex < totalMedias - 1) {
      CustomLogger.info(`[Lightbox] Avançando para a mídia de índice: ${currentIndex + 1}`);
      onSelectMedia(medias[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      CustomLogger.info(`[Lightbox] Retrocedendo para a mídia de índice: ${currentIndex - 1}`);
      onSelectMedia(medias[currentIndex - 1]);
    }
  };

  // 📱 Detecta o gesto de deslizar para os lados (Swipe) na tela cheia de forma responsiva
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -60) {
      handleNext(); // Swipe para a esquerda -> Próxima imagem
    } else if (info.offset.x > 60) {
      handlePrev(); // Swipe para a direita -> Imagem anterior
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
        {/* Botão Fechar no Topo Direito */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-50 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ⬅️ Seta Esquerda (Oculta nativamente no primeiro item) */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 p-3 bg-white/5 hover:bg-white/15 text-white rounded-full transition-all cursor-pointer z-40 hidden sm:block active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* ➡️ Seta Direita (Oculta nativamente no último item) */}
        {currentIndex < totalMedias - 1 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 p-3 bg-white/5 hover:bg-white/15 text-white rounded-full transition-all cursor-pointer z-40 hidden sm:block active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* 📱 Área de Conteúdo Arrastável com Framer Motion (Suporta o Swipe Nativo) */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.4}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          className="max-w-4xl max-h-[75vh] w-full flex items-center justify-center rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {activeMedia.type === 'image' && (
            <motion.img
              key={activeMedia.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              src={activeMedia.url}
              alt={activeMedia.name}
              className="object-contain max-w-full max-h-[75vh] rounded-xl pointer-events-none"
            />
          )}

          {activeMedia.type === 'video' && (
            <video
              key={activeMedia.id}
              src={activeMedia.url}
              controls
              autoPlay
              className="w-full max-h-[75vh] rounded-xl bg-black focus:outline-none"
            />
          )}

          {activeMedia.type === 'document' && (
            <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-sm shadow-xl animate-scaleIn">
              <FileText className="w-12 h-12 text-slate-400" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm truncate max-w-xs font-sans">{activeMedia.name}</h4>
                <p className="text-xs text-slate-400 mt-1 font-sans">Documento ou Anexo operacional geral.</p>
              </div>
              <a
                href={activeMedia.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 transition-colors text-center font-sans block"
              >
                Abrir Documento
              </a>
            </div>
          )}
        </motion.div>

        {/* Legenda e Marcador Numérico Inferior */}
        <div className="absolute bottom-4 text-center space-y-1 z-40 w-full pointer-events-none">
          <p className="text-white/80 text-xs font-medium truncate max-w-md px-4 mx-auto">{activeMedia.name}</p>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-wider font-mono tabular-nums">{currentIndex + 1} de {totalMedias}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
