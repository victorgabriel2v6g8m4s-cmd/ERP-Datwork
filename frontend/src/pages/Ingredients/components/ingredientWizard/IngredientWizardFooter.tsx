import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface IngredientWizardFooterProps {
    step: number;
    sku: string;
    name: string;
    handlePrevStep: () => void;
    handleNextStep: () => void;
    handleReset: () => void;
    handleSubmit: () => Promise<void>;
}

export function IngredientWizardFooter({
    step, sku, name, handlePrevStep, handleNextStep, handleReset, handleSubmit
}: IngredientWizardFooterProps) {
    const isFirstStepInvalid = !sku.trim() || !name.trim();

    return (
        <div className="flex gap-2 border-t border-slate-100 pt-4 text-xs font-bold font-sans">
            {step > 1 ? (
                <button type="button" onClick={handlePrevStep} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> <span>Voltar</span>
                </button>
            ) : (
                <button type="button" onClick={handleReset} className="px-4 py-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer">
                    Cancelar
                </button>
            )}

            {step < 3 ? (
                <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={step === 1 && isFirstStepInvalid}
                    className={`px-5 py-2.5 font-bold rounded-xl text-white transition-all flex items-center gap-1 cursor-pointer ml-auto ${step === 1 && isFirstStepInvalid ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100'
                        }`}
                >
                    <span>Avançar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            ) : (
                <button type="button" onClick={handleSubmit} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors flex items-center gap-1 shadow-md shadow-emerald-100 cursor-pointer ml-auto">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Concluir Cadastro</span>
                </button>
            )}
        </div>
    );
}
