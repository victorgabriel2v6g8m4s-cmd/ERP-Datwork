import { memo } from 'react';
import { Sparkles } from 'lucide-react';
import { TEXTS } from '../../../../i18n/index.ts';
import { UI_KEYS } from '../../../../ui/keys.ts';

export const AppointmentListEmpty = memo(function AppointmentListEmpty() {
  return (
    <div
      data-ui-key={UI_KEYS.agenda.listEmpty}
      className="flex flex-col items-center justify-center py-14 text-slate-400 bg-white border border-dashed border-slate-200/80 rounded-2xl animate-fadeIn"
    >
      <Sparkles className="w-7 h-7 text-indigo-400 mb-2 animate-pulse" />
      <p className="text-xs font-bold tracking-tight uppercase text-slate-400">
        {TEXTS.agenda.page.emptyState}
      </p>
    </div>
  );
});
