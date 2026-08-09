import { motion } from 'framer-motion';
import { FlaskConical, X } from 'lucide-react';

interface IngredientWizardHeaderProps {
    step: number;
    progressPercent: number;
    handleReset: () => void;
}

const STEP_LABELS = ['Identificação Básica', 'Métricas de Custo', 'Galeria & Capa'];

export function IngredientWizardHeader({ step, progressPercent, handleReset }: IngredientWizardHeaderProps) {
    return (
        <div className="space-y-4 font-sans">
            {/* Título */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-orange-600">
                    <FlaskConical className="w-5 h-5" />
                    <h3 className="text-base font-black text-slate-800">Assistente de Insumos</h3>
                </div>
                <button type="button" onClick={handleReset} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Linha de Progresso Dinâmica */}
            <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <span>Etapa {step} de 3</span>
                    <span className="text-emerald-600 font-bold">{STEP_LABELS[step - 1]}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="h-full bg-emerald-500 rounded-full"
                    />
                </div>
            </div>
        </div>
    );
}
