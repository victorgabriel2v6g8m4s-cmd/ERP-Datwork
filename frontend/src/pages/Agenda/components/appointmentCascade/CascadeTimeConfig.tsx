import { TEXTS } from '../../../../i18n/index.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';
import type { AgendaTimeUnit } from '../../types/agenda.types.ts';

interface CascadeTimeConfigProps {
  offsetValue: number;
  setOffsetValue: (value: number) => void;
  timeUnit: AgendaTimeUnit;
  setTimeUnit: (value: AgendaTimeUnit) => void;
}

const TIME_UNITS: AgendaTimeUnit[] = ['MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS'];

export function CascadeTimeConfig({ offsetValue, setOffsetValue, timeUnit, setTimeUnit }: CascadeTimeConfigProps) {
  return (
    <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/60 p-3 rounded-xl font-sans">
      <div data-ui-key={UI_KEYS.agenda.cascadeOffset} className="space-y-1 text-left">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{TEXTS.agenda.cascade.offsetLabel}</label>
        <input type="number" min={0} value={offsetValue || ''} onChange={(event) => setOffsetValue(Number(event.target.value))} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-slate-800 text-xs focus:outline-none focus:border-indigo-500 tabular-nums" />
      </div>
      <div data-ui-key={UI_KEYS.agenda.cascadeUnit} className="space-y-1 text-left">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{TEXTS.agenda.cascade.timeUnitLabel}</label>
        <select value={timeUnit} onChange={(event) => setTimeUnit(event.target.value as AgendaTimeUnit)} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 text-xs focus:outline-none cursor-pointer">
          {TIME_UNITS.map((unit) => <option key={unit} value={unit}>{TEXTS.agenda.cascade.units[unit]}</option>)}
        </select>
      </div>
    </div>
  );
}
