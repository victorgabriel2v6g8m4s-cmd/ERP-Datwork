import { ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { TEXTS } from '../../../../i18n/index.ts';
import { ERP_THEME } from '../../../../theme/presets.ts';
import type { Appointment } from '../../../../types/appointment.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';
import { useAgendaCalendarEngine } from '../../hooks/useAgendaCalendarEngine.ts';
import { CalendarMonthSection } from './CalendarMonthSection.tsx';

interface AgendaCalendarViewProps {
  appointments: Appointment[];
  onSelectRange: (start: Date, end: Date) => void;
  onBack: () => void;
}

export function AgendaCalendarView({ appointments, onSelectRange, onBack }: AgendaCalendarViewProps) {
  const engine = useAgendaCalendarEngine(appointments);

  const getDayClasses = (dayDate: Date) => {
    const time = dayDate.getTime();
    const startTime = engine.rangeStart?.getTime();
    const endTime = engine.rangeEnd?.getTime();
    if ((startTime !== undefined && time === startTime) || (endTime !== undefined && time === endTime)) return ERP_THEME.agenda.calendar.selectedDay;
    if (startTime !== undefined && endTime !== undefined && time > startTime && time < endTime) return ERP_THEME.agenda.calendar.rangeDay;
    return ERP_THEME.agenda.calendar.normalDay;
  };

  return (
    <div data-ui-key={UI_KEYS.agenda.calendar} className={ERP_THEME.agenda.calendar.shell}>
      <div className={ERP_THEME.agenda.calendar.toolbar}>
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap justify-start">
          <button type="button" onClick={onBack} className={ERP_THEME.agenda.calendar.backButton}>
            <ChevronLeft className="w-3.5 h-3.5" /><span>{TEXTS.agenda.calendar.back}</span>
          </button>
          <select value={engine.selectedMonth} onChange={(event) => engine.scrollToMonth(engine.selectedYear, Number(event.target.value))} className={`${ERP_THEME.input.select} !h-[30px]`}>
            {TEXTS.agenda.calendar.months.map((month, index) => <option key={month} value={index}>{month}</option>)}
          </select>
          <select value={engine.selectedYear} onChange={(event) => engine.scrollToMonth(Number(event.target.value), engine.selectedMonth)} className={`${ERP_THEME.input.select} !h-[30px]`}>
            {engine.availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>

        {engine.rangeStart && engine.rangeEnd && !engine.isEngineLoading && (
          <button data-ui-key={UI_KEYS.agenda.calendarRangeAction} type="button" onClick={() => onSelectRange(engine.rangeStart!, engine.rangeEnd!)} className={ERP_THEME.agenda.calendar.rangeButton}>
            <span>{TEXTS.agenda.calendar.rangeAction}</span><ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className={ERP_THEME.agenda.calendar.container}>
        {!engine.isEngineLoading && (
          <div className="grid grid-cols-7 gap-1 text-center w-full bg-slate-50 border-b border-slate-100 py-2 px-5 shrink-0 z-20">
            {TEXTS.agenda.calendar.weekHeaders.map((day, index) => <div key={`${day}-${index}`} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{day}</div>)}
          </div>
        )}

        {engine.isEngineLoading ? (
          <div className={ERP_THEME.agenda.calendar.loading}>
            <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{TEXTS.agenda.calendar.loading}</span>
          </div>
        ) : (
          <div ref={engine.scrollContainerRef} onScroll={engine.handleScrollThreshold} className="w-full h-full p-5 pt-3 space-y-8 overflow-y-auto scrollbar-none scroll-smooth">
            {engine.monthsData.map((monthBase) => (
              <CalendarMonthSection
                key={`${monthBase.getFullYear()}-${monthBase.getMonth()}`}
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
