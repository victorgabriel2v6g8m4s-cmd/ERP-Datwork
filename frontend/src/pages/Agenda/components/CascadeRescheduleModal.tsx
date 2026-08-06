import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { type Appointment } from '../../../types/appointment.ts';

interface CascadeRescheduleModalProps {
    isOpen: boolean;
    targetAppointment: Appointment | null;
    droppedIndex: number;
    fullList: Appointment[];
    onClose: () => void;
    onExecuteCascade: (selectedIds: string[], offsetValue: number, unit: string, actionType: string) => Promise<void>;
}

export function CascadeRescheduleModal({
    isOpen, targetAppointment, droppedIndex, fullList, onClose, onExecuteCascade
}: CascadeRescheduleModalProps) {
    const [activeTab, setActiveTab] = useState<'POSTERIOR' | 'ANTERIOR'>('POSTERIOR');
    const [offsetValue, setOffsetValue] = useState<number>(0);
    const [timeUnit, setTimeUnit] = useState<string>('MINUTES');
    const [startIndex, setStartIndex] = useState<number>(-1);
    const [endIndex, setEndIndex] = useState<number>(-1);

    // 2. 🧠 MOTOR 1: Executado de forma segura em todo render
    const candidatesList = useMemo(() => {
        // Se o modal estiver fechado, retorna uma lista vazia preventiva sem quebrar o hook
        if (!isOpen || !targetAppointment) return [];

        return fullList.filter((apt, idx) => {
            if (apt.status === 'CANCELED' || apt.status === 'COMPLETED') return false;
            if (apt.id === targetAppointment.id) return false;

            if (activeTab === 'POSTERIOR') return idx >= droppedIndex;
            return idx < droppedIndex;
        });
    }, [fullList, activeTab, droppedIndex, targetAppointment, isOpen]);

    // 3. 🧠 MOTOR 2: Executado de forma segura em todo render
    const affectedIds = useMemo(() => {
        if (startIndex === -1 || endIndex === -1) return [];
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        return candidatesList.slice(start, end + 1).map(apt => apt.id);
    }, [candidatesList, startIndex, endIndex]);


    // 🛡️ ✨ CORREÇÃO CIRÚRGICA: Cláusula de barreira movida para DEPOIS de todos os hooks (Rules of Hooks)
    if (!isOpen || !targetAppointment) return null;

    const handleRowClick = (idx: number) => {
        if (startIndex === -1 || (startIndex !== -1 && endIndex !== -1)) {
            setStartIndex(idx);
            setEndIndex(-1);
        } else {
            setEndIndex(idx);
        }
    };

    const isRowSelected = (idx: number) => {
        if (startIndex === -1) return false;
        if (endIndex === -1) return idx === startIndex;
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        return idx >= start && idx <= end;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full shadow-2xl flex flex-col overflow-hidden text-left"
            >
                {/* Cabeçalho */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-indigo-400" />
                        <div>
                            <h3 className="font-black text-xs uppercase tracking-wider">Reagendamento em Cascata</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Item movido para posição #{droppedIndex + 1}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                {/* 🧭 SELETOR DE SUB-ABAS (ADIAR / ADIANTAR) */}
                <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1 shrink-0">
                    <button
                        type="button" onClick={() => { setActiveTab('POSTERIOR'); setStartIndex(-1); setEndIndex(-1); }}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${activeTab === 'POSTERIOR' ? 'bg-white text-indigo-600 shadow-3xs border-slate-200' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Adiar (Posteriores)
                    </button>
                    <button
                        type="button" onClick={() => { setActiveTab('ANTERIOR'); setStartIndex(-1); setEndIndex(-1); }}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${activeTab === 'ANTERIOR' ? 'bg-white text-indigo-600 shadow-3xs border-slate-200' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Adiantar (Anteriores)
                    </button>
                </div>

                {/* Miolo: Listagem e Inputs */}
                <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[40vh] scrollbar-none">

                    {/* Formulário de Configuração de Tempo */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                        <div className="space-y-1 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Valor do Deslocamento</label>
                            <input
                                type="number" min={0} value={offsetValue || ''} onChange={(e) => setOffsetValue(Number(e.target.value))} placeholder="0"
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-slate-800 text-xs focus:outline-none focus:border-indigo-500 tabular-nums"
                            />
                        </div>
                        <div className="space-y-1 text-left">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Grandeza Temporal</label>
                            <select
                                value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 text-xs focus:outline-none cursor-pointer"
                            >
                                <option value="MINUTES">Minutos</option>
                                <option value="HOURS">Horas</option>
                                <option value="DAYS">Dias</option>
                                <option value="WEEKS">Semanas</option>
                                <option value="MONTHS">Meses</option>
                            </select>
                        </div>
                    </div>

                    {/* Fila de Candidatos */}
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block text-left">Clique para definir o Início e o Fim do intervalo afetado:</span>
                        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[160px] overflow-y-auto scrollbar-none">
                            {candidatesList.map((apt, idx) => {
                                const selected = isRowSelected(idx);
                                return (
                                    <button
                                        key={apt.id} type="button" onClick={() => handleRowClick(idx)}
                                        className={`w-full p-2 text-left flex justify-between items-center transition-colors cursor-pointer text-xs ${selected ? 'bg-indigo-50/60 text-indigo-700 font-bold' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                                    >
                                        <div className="truncate pr-2">
                                            <span className="font-black text-slate-400 font-mono text-[10px] mr-1.5">#{idx + 1}</span>
                                            <span className="font-black">{apt.title}</span>
                                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">Horário original: {apt.time}</span>
                                        </div>
                                        <span className="font-mono text-[10px] text-slate-400 shrink-0 font-bold">{new Date(apt.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </button>
                                );
                            })}
                            {candidatesList.length === 0 && (
                                <div className="p-4 text-center text-slate-400 font-bold text-xs uppercase tracking-wider bg-slate-50">Nenhum agendamento pendente nesta seção.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rodapé de Gatilhos */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2 font-bold text-xs shrink-0">
                    <button
                        type="button" onClick={onClose}
                        className="flex-1 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors cursor-pointer text-center"
                    >
                        Manter Inalterado
                    </button>
                    <button
                        type="button"
                        disabled={affectedIds.length === 0 || offsetValue <= 0}
                        /* ✨ CORREÇÃO: Repassa o activeTab ('POSTERIOR' ou 'ANTERIOR') no clique de salvar */
                        onClick={() => onExecuteCascade(affectedIds, offsetValue, timeUnit, activeTab)}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-all cursor-pointer text-center"
                    >
                        Reagendamento Selecionados ({affectedIds.length})
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
