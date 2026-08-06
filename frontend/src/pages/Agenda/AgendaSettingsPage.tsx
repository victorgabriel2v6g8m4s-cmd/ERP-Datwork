import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, EyeOff, Sliders } from 'lucide-react';
import { GlobalFooterNav } from '../../components/GlobalFooterNav.tsx';

export function AgendaSettingsPage() {
    const navigate = useNavigate();

    // Preferências locais persistidas temporariamente em estado (Podem ser migradas para Contexto/LocalStorage depois)
    const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h');
    const [showCanceledItems, setShowCanceledItems] = useState(true);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto px-4 py-8 space-y-6 font-sans select-none"
        >
            {/* Cabeçalho Superior com SVG ArrowLeft */}
            <div className="flex items-center gap-3 border-b border-slate-200/60 pb-5">
                <button
                    onClick={() => navigate('/agenda')}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-3xs"
                    title="Voltar para a Agenda"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-slate-900 tracking-tight">Preferências da Agenda</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ajustes da Ferramenta</p>
                    </div>
                </div>
            </div>

            {/* Caixa de Ajustes Físicos */}
            <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-3xs space-y-5">

                {/* Config 1: Formato do Horário */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Formato de Exibição das Horas</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button" onClick={() => setTimeFormat('24h')}
                            className={`flex-1 py-2 text-xs rounded-xl font-bold border transition-all cursor-pointer ${timeFormat === '24h' ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-3xs' : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                        >
                            24 Horas (Ex: 14:30)
                        </button>
                        <button
                            type="button" onClick={() => setTimeFormat('12h')}
                            className={`flex-1 py-2 text-xs rounded-xl font-bold border transition-all cursor-pointer ${timeFormat === '12h' ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-3xs' : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                        >
                            12 Horas (Ex: 02:30 PM)
                        </button>
                    </div>
                </div>

                {/* Config 2: Exibição de Cancelados */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                        <EyeOff className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Itens Cancelados na Linha do Tempo</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCanceledItems(!showCanceledItems)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer text-center ${showCanceledItems ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-3xs' : 'bg-red-50 border-red-200 text-red-700 shadow-3xs'
                            }`}
                    >
                        {showCanceledItems ? "✓ Exibindo registros desmarcados na fila" : "✕ Ocultando e limpando registros desmarcados da fila"}
                    </button>
                </div>
            </div>
            <GlobalFooterNav />
        </motion.div>
    );
}
