import { ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import { type Appointment } from '../../../../types/appointment.ts';
import { useAgendaCalendarEngine } from '../../hooks/useAgendaCalendarEngine.ts';
import { CalendarMonthSection } from './CalendarMonthSection.tsx';
import { ERP_THEME } from '../../../../theme/presets.ts';

interface AgendaCalendarViewProps {
    appointments: Appointment[];
    onSelectRange: (start: Date, end: Date) => void;
    onBack: () => void;
}

const MONTH_LABELS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEK_HEADERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function AgendaCalendarView({ appointments, onSelectRange, onBack }: AgendaCalendarViewProps) {
    const engine = useAgendaCalendarEngine(appointments);

    // Helper de cálculo de estilização reativa das células
    const getDayClasses = (dayDate: Date) => {
        const time = dayDate.getTime();
        const startTime = engine.rangeStart?.getTime();
        const endTime = engine.rangeEnd?.getTime();

        if (startTime && time === startTime) return 'bg-indigo-600 text-white rounded-xl font-black scale-102';
        if (endTime && time === endTime) return 'bg-indigo-600 text-white rounded-xl font-black scale-102';
        if (startTime && endTime && time > startTime && time < endTime) {
            return 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50';
        }
        return 'bg-slate-50/50 hover:bg-slate-100 text-slate-700 border border-transparent';
    };

    return (
        <div className="w-full space-y-4 animate-fadeIn text-left">

            {/* 🧭 BARRA SUPERIOR DE FILTROS CONFIGURADA COM PRESETS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 border border-slate-200/60 p-3 rounded-2xl w-full">
                <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap justify-start">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-3xs"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Voltar</span>
                    </button>

                    <select value={engine.selectedMonth} onChange={(e) => engine.scrollToMonth(engine.selectedYear, parseInt(e.target.value, 10))} className={ERP_THEME.input.select + ' !h-[30px]'}>
                        {MONTH_LABELS.map((m, idx) => <option key={`m-${idx}`} value={idx}>{m}</option>)}
                    </select>

                    <select value={engine.selectedYear} onChange={(e) => engine.scrollToMonth(parseInt(e.target.value, 10), engine.selectedMonth)} className={ERP_THEME.input.select + ' !h-[30px]'}>
                        {engine.availableYears.map(y => <option key={`y-${y}`} value={y}>{y}</option>)}
                    </select>
                </div>

                {engine.rangeStart && engine.rangeEnd && !engine.isEngineLoading && (
                    <button
                        type="button"
                        onClick={() => onSelectRange(engine.rangeStart!, engine.rangeEnd!)}
                        className="w-full sm:w-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-150"
                    >
                        <span>Agendamentos neste Período</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* CONTAINER PRINCIPAL DE CONTEÚDO */}
            <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-3xs relative h-[62vh] overflow-hidden flex flex-col">
                {!engine.isEngineLoading && (
                    <div className="grid grid-cols-7 gap-1 text-center w-full bg-slate-50 border-b border-slate-100 py-2 px-5 shrink-0 z-20">
                        {WEEK_HEADERS.map((d, i) => (
                            <div key={`wk-${i}`} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{d}</div>
                        ))}
                    </div>
                )}

                {engine.isEngineLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-white/80 backdrop-blur-xs rounded-2xl animate-fadeIn">
                        <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Linha do Tempo...</span>
                    </div>
                ) : (
                    <div
                        ref={engine.scrollContainerRef}
                        onScroll={engine.handleScrollThreshold}
                        className="w-full h-full p-5 pt-3 space-y-8 overflow-y-auto scrollbar-none scroll-smooth"
                    >
                        {engine.monthsData.map((monthBase) => (
                            <CalendarMonthSection
                                key={`section-${monthBase.getFullYear()}-${monthBase.getMonth()}`}
                                baseMonth={monthBase}
                                appointmentsCountByDay={engine.appointmentsCountByDay}
                                handleDayClick={engine.handleDayClick}
                                getDayClasses={getDayClasses}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
