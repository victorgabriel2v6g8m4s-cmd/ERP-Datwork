import { CalendarClock, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Appointment } from '../../../../types/appointment.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';
import { useCascadeReschedule } from '../../hooks/useCascadeReschedule.ts';
import { CascadeTimeConfig } from './CascadeTimeConfig.tsx';

interface CascadeRescheduleModalProps {
    isOpen: boolean;
    targetAppointment: Appointment | null;
    droppedIndex: number;
    fullList: Appointment[];
    onClose: () => void;
    onExecuteCascade: (selectedIds: string[], offsetValue: number, unit: string, actionType: string) => Promise<void>;
}

export function CascadeRescheduleModal(props: CascadeRescheduleModalProps) {
    const { isOpen, targetAppointment, droppedIndex, onClose, onExecuteCascade } = props;
    const cascade = useCascadeReschedule(props);

    // Cláusula de barreira segura em conformidade absoluta com as Rules of Hooks
    if (!isOpen || !targetAppointment) return null;

    return (
        <div className={ERP_THEME.modal.overlay}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full shadow-2xl flex flex-col overflow-hidden text-left"
            >
                {/* Cabeçalho */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 font-sans">
                    <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-indigo-400" />
                        <div>
                            <h3 className="font-black text-xs uppercase tracking-wider">Reagendamento em Cascata</h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Item movido para posição #{droppedIndex + 1}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* CONTROLE DE SUB-ABAS */}
                <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1 shrink-0 font-sans">
                    {['POSTERIOR', 'ANTERIOR'].map((tab) => (
                        <button
                            key={tab} type="button" onClick={() => { cascade.setActiveTab(tab as any); cascade.resetSelection(); }}
                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${cascade.activeTab === tab ? 'bg-white text-indigo-600 shadow-3xs border-slate-200' : 'text-slate-400 border-transparent hover:text-slate-600'
                                }`}
                        >
                            {tab === 'POSTERIOR' ? 'Adiar (Posteriores)' : 'Adiantar (Anteriores)'}
                        </button>
                    ))}
                </div>

                {/* CONTEÚDO OPERACIONAL */}
                <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[40vh] scrollbar-none">
                    <CascadeTimeConfig offsetValue={cascade.offsetValue} setOffsetValue={cascade.setOffsetValue} timeUnit={cascade.timeUnit} setTimeUnit={cascade.setTimeUnit} />

                    {/* Fila de Candidatos */}
                    <div className="space-y-1 font-sans">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block text-left">Clique para definir o intervalo afetado:</span>
                        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[160px] overflow-y-auto scrollbar-none">
                            {cascade.candidatesList.map((apt, idx) => {
                                const selected = cascade.isRowSelected(idx);
                                return (
                                    <button
                                        key={apt.id} type="button" onClick={() => cascade.handleRowClick(idx)}
                                        className={`w-full p-2 text-left flex justify-between items-center transition-colors cursor-pointer text-xs ${selected ? 'bg-indigo-50/60 text-indigo-700 font-bold' : 'bg-white hover:bg-slate-50 text-slate-700'
                                            }`}
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
                            {cascade.candidatesList.length === 0 && (
                                <div className="p-4 text-center text-slate-400 font-bold text-xs uppercase tracking-wider bg-slate-50">Nenhum agendamento pendente nesta seção.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RODAPÉ E DISPARADORES COM PRESETS */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2 font-bold text-xs shrink-0 font-sans">
                    <button type="button" onClick={onClose} className={ERP_THEME.modal.btnCancel + ' !bg-white border border-slate-200'}>
                        Manter Inalterado
                    </button>
                    <button
                        type="button"
                        disabled={cascade.affectedIds.length === 0 || cascade.offsetValue <= 0}
                        onClick={() => onExecuteCascade(cascade.affectedIds, cascade.offsetValue, cascade.timeUnit, cascade.activeTab)}
                        className={ERP_THEME.modal.btnConfirm + ' !bg-indigo-600 hover:!bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed'}
                    >
                        Reagendamento Selecionados ({cascade.affectedIds.length})
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
