import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, type LucideIcon } from 'lucide-react';

interface UniversalAccordionProps {
    id: string;
    title: string;
    icon: LucideIcon;
    currentOpenSection: string | null;
    setOpenSection: (id: string | null) => void;
    children: ReactNode;
}

export function UniversalAccordion({
    id, title, icon: Icon, currentOpenSection, setOpenSection, children
}: UniversalAccordionProps) {
    const isOpen = currentOpenSection === id;

    return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs w-full block animate-fadeIn">
            <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 font-bold text-xs uppercase text-slate-700 cursor-pointer font-sans select-none transition-colors"
            >
                <span className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{title}</span>
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="text-slate-400 shrink-0"
                >
                    <ChevronRight className="w-4 h-4" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="bg-white border-t border-slate-100 overflow-hidden"
                    >
                        <div className="p-4 w-full block">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
