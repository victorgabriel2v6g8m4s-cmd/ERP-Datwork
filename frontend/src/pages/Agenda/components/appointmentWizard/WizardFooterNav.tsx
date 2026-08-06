import { ChevronRight, Check } from 'lucide-react';

interface WizardFooterNavProps {
    step: number;
    setStep: (s: number) => void;
    title: string;
    time: string;
    date: string;
    firstName: string;
    phone: string;
    cep: string;
    mediasLength: number;
    handleResetModal: () => void;
    handleFinalSubmit: () => Promise<void>;
}

export function WizardFooterNav({
    step, setStep, title, time, date, firstName, phone, cep, mediasLength, handleResetModal, handleFinalSubmit
}: WizardFooterNavProps) {
    return (
        <div className="flex gap-3 border-t border-slate-100 pt-4 justify-end">
            <button type="button" onClick={handleResetModal} className="px-5 py-2 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                Cancelar
            </button>

            {step === 1 && (
                <button type="button" disabled={!title || !time || !date} onClick={() => setStep(2)} className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100">
                    <span>Próximo</span><ChevronRight className="w-4 h-4" />
                </button>
            )}

            {step === 2 && (
                <button type="button" onClick={() => setStep(3)} className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-md">
                    <span>{(!firstName && !phone && !cep) ? "Pular Etapa" : "Avançar"}</span><ChevronRight className="w-4 h-4" />
                </button>
            )}

            {step === 3 && (
                <button type="button" onClick={() => setStep(4)} className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-md">
                    <span>{mediasLength === 0 ? "Pular Etapa" : "Avançar"}</span><ChevronRight className="w-4 h-4" />
                </button>
            )}

            {step === 4 && (
                <button type="button" onClick={handleFinalSubmit} className="flex items-center gap-1.5 px-5 py-2 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-100">
                    <Check className="w-4 h-4" /><span>Concluir Agendamento</span>
                </button>
            )}
        </div>
    );
}
