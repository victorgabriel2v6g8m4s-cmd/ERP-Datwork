import { motion } from 'framer-motion';
import { TEXTS } from '../../../../i18n/index.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';

interface WizardStep1Props {
  title: string;
  setTitle: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}

export function WizardStep1(props: WizardStep1Props) {
  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
      <div data-ui-key={UI_KEYS.agenda.formTitle}>
        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{TEXTS.agenda.wizard.nameLabel}</label>
        <input type="text" required value={props.title} onChange={(event) => props.setTitle(event.target.value)} placeholder={TEXTS.agenda.wizard.namePlaceholder} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-medium" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div data-ui-key={UI_KEYS.agenda.formDate}>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{TEXTS.agenda.wizard.dateLabel}</label>
          <input type="date" required value={props.date} onChange={(event) => props.setDate(event.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none cursor-pointer h-[38px] font-semibold" />
        </div>
        <div data-ui-key={UI_KEYS.agenda.formTime}>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{TEXTS.agenda.wizard.timeLabel}</label>
          <input type="time" required value={props.time} onChange={(event) => props.setTime(event.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none h-[38px]" />
        </div>
      </div>
      <div data-ui-key={UI_KEYS.agenda.formNotes}>
        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{TEXTS.agenda.wizard.notesLabel}</label>
        <textarea value={props.description} onChange={(event) => props.setDescription(event.target.value)} rows={3} placeholder={TEXTS.agenda.wizard.notesPlaceholder} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none resize-none" />
      </div>
    </motion.div>
  );
}
