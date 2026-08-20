import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, type LucideIcon } from 'lucide-react';

interface CarouselItem {
    name: string;
    path: string;
    description: string;
    icon: LucideIcon;
    bgGradient: string;
}

interface HomeCarouselProps {
    items: CarouselItem[];
    onNavigate: (path: string) => void;
    sectionLabel: string;
    previousLabel: string;
    nextLabel: string;
}

// 📐 CONFIGURAÇÃO CINEMÁTICA ULTRA SUTIL: Deslocamento horizontal reduzido e suave
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 80 : -60, // Distância menor evita trancos visuais
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -60 : 80,
        opacity: 0
    })
};

export function HomeCarousel({ items, onNavigate, sectionLabel, previousLabel, nextLabel }: HomeCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = Avançar (Direita), -1 = Voltar (Esquerda)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
    }, []);

    const startTimer = useCallback(() => {
        stopTimer();
        if (items.length === 0) return;
        timerRef.current = setInterval(() => {
            setDirection(1); // O avanço automático sempre move para a direita
            setCurrentSlide((prev) => (prev + 1) % items.length);
        }, 4500); // Mantém a pausa confortável de 4.5 segundos
    }, [items.length, stopTimer]);

    useEffect(() => {
        startTimer();
        return stopTimer;
    }, [currentSlide, startTimer, stopTimer]);

    const handleNextSlide = (e: React.MouseEvent) => {
        e.stopPropagation(); // Evita disparar o clique de navegação do card ao tocar na seta
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % items.length);
    };

    const handlePrevSlide = (e: React.MouseEvent) => {
        e.stopPropagation(); // Evita disparar o clique de navegação do card ao tocar na seta
        setDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
    };

    if (!items || items.length === 0) return null;

    // 🧩 CAPTURA DO SLIDE ATIVO ATUAL (Substitui o loop .map que quebrava o timer)
    const activeSlide = items[currentSlide];
    const SlideIcon = activeSlide.icon;

    return (
        <div
            className="space-y-2 select-none w-full text-left"
            onMouseEnter={stopTimer}
            onMouseLeave={startTimer}
        >
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 border-indigo-900 fill-indigo-200" aria-hidden="true" /> {sectionLabel}
            </span>

            {/* Contêiner Base Relativo */}
            <div className="relative w-full h-[105px] rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-950 flex items-center">

                {/* AnimatePresence configurado em modo popLayout estável */}
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.button
                        type="button"
                        key={`slide-active-${currentSlide}`} // A chave baseada estritamente no índice força a renderização perfeita
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'tween', duration: 0.4, ease: 'easeInOut' }, // ✨ CURVA TWEEN INDÚSTRIAL: Deslize sedoso, sutil e profissional
                            opacity: { duration: 0.25 }
                        }}
                        onClick={() => onNavigate(activeSlide.path)}
                        className={`absolute inset-0 bg-gradient-to-r ${activeSlide.bgGradient} px-14 py-4 flex items-center justify-between cursor-pointer w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-300`}
                    >
                        <div className="space-y-1 text-left min-w-0 pr-6">
                            <h2 className="text-white text-sm font-black tracking-tight">{activeSlide.name}</h2>
                            <p className="text-[11px] text-slate-400 font-bold leading-tight line-clamp-2">{activeSlide.description}</p>
                        </div>

                        <div className="p-2 bg-white/10 text-white rounded-xl border border-white/10 shrink-0 shadow-sm flex items-center justify-center">
                            <SlideIcon className="w-4 h-4" />
                        </div>
                    </motion.button>
                </AnimatePresence>

                {/* 🧭 SETAS DE CONTROLE MANUAIS CENTRALIZADAS E PROTEGIDAS */}
                <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/30 hover:bg-black/50 text-white rounded-xl flex items-center justify-center cursor-pointer border border-white/5 backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    title={previousLabel}
                    aria-label={previousLabel}
                >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={handleNextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/30 hover:bg-black/50 text-white rounded-xl flex items-center justify-center cursor-pointer border border-white/5 backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    title={nextLabel}
                    aria-label={nextLabel}
                >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
