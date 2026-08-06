import { memo } from 'react';

interface CalendarMonthSectionProps {
    baseMonth: Date;
    appointmentsCountByDay: Record<string, { completed: number; pending: number; canceled: number }>;
    handleDayClick: (date: Date) => void;
    getDayClasses: (date: Date) => string;
}

export const CalendarMonthSection = memo(function CalendarMonthSection({
    baseMonth, appointmentsCountByDay, handleDayClick, getDayClasses
}: CalendarMonthSectionProps) {
    const year = baseMonth.getFullYear();
    const month = baseMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const monthName = baseMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const dayCells = [];

    // Injeta as células vazias estruturais
    for (let i = 0; i < firstDayIndex; i++) {
        dayCells.push(<div key={`empty-${month}-${i}`} className="h-12 w-full" />);
    }

    // Gera o laço numérico dos dias reais
    for (let day = 1; day <= totalDays; day++) {
        const currentDayDate = new Date(year, month, day);
        const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayCounts = appointmentsCountByDay[dayKey] || { completed: 0, pending: 0, canceled: 0 };

        dayCells.push(
            <button
                key={`day-${month}-${day}`}
                type="button"
                onClick={() => handleDayClick(currentDayDate)}
                className={`h-12 w-full relative flex items-center justify-center text-xs font-semibold font-mono tabular-nums transition-all cursor-pointer rounded-xl select-none ${getDayClasses(currentDayDate)}`}
            >
                <span>{day}</span>

                {/* 🧭 FILEIRA DE STATUS FLUTUANTE */}
                <div className="absolute top-1 right-1 flex flex-row-reverse gap-0.5 max-w-[80%] items-center justify-start pointer-events-none">
                    {dayCounts.completed > 0 && (
                        <span className="w-3.5 h-3.5 bg-emerald-500 text-white text-[7.5px] font-black rounded-full flex items-center justify-center scale-85 border border-emerald-600/10 shadow-3xs animate-fadeIn shrink-0">
                            {dayCounts.completed}
                        </span>
                    )}
                    {dayCounts.pending > 0 && (
                        <span className="w-3.5 h-3.5 bg-indigo-500 text-white text-[7.5px] font-black rounded-full flex items-center justify-center scale-85 border border-indigo-600/10 shadow-3xs animate-fadeIn shrink-0">
                            {dayCounts.pending}
                        </span>
                    )}
                    {dayCounts.canceled > 0 && (
                        <span className="w-3.5 h-3.5 bg-rose-500 text-white text-[7.5px] font-black rounded-full flex items-center justify-center scale-85 border border-rose-600/10 shadow-3xs animate-fadeIn shrink-0">
                            {dayCounts.canceled}
                        </span>
                    )}
                </div>
            </button>
        );
    }

    return (
        <div
            id={`month-card-${year}-${month}`}
            data-month-card
            data-year={year}
            data-month={month}
            className="space-y-3 border-b border-slate-100 pb-6 last:border-none scroll-mt-2 text-center"
        >
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider text-center capitalize w-full block">
                {monthName}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center w-full">
                {dayCells}
            </div>
        </div>
    );
});
