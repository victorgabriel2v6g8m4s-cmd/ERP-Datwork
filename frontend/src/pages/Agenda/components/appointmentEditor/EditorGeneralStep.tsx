import { TEXTS } from '../../../../i18n/index.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';

interface EditorGeneralStepProps {
  name: string;
  setName: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
}

export function EditorGeneralStep(props: EditorGeneralStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div data-ui-key={UI_KEYS.agenda.formTitle} className="md:col-span-2">
        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{TEXTS.agenda.edit.nameLabel}</label>
        <input type="text" required value={props.name} onChange={(event) => props.setName(event.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800 text-sm font-medium" />
      </div>
      <div data-ui-key={UI_KEYS.agenda.formDate}>
        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{TEXTS.agenda.edit.dateLabel}</label>
        <input type="date" required value={props.date} onChange={(event) => props.setDate(event.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-semibold cursor-pointer h-[38px] text-sm" />
      </div>
      <div data-ui-key={UI_KEYS.agenda.formTime}>
        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{TEXTS.agenda.edit.timeLabel}</label>
        <input type="time" required value={props.time} onChange={(event) => props.setTime(event.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800 text-sm font-medium" />
      </div>
    </div>
  );
}
