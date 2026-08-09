import { APP_CONFIG } from '../config/app.config.ts';
import { TEXTS } from '../i18n/index.ts';
import type { AppointmentSubStatus } from '../types/appointment.ts';
import { UI_KEYS } from '../ui/keys.ts';
import {
    getAgendaSubStatusPresentation,
    getAgendaSubStatusesForGroup,
    type AgendaSubStatusGroup
} from '../ui/agendaSubStatus.ts';

export type SubStatusKey = AppointmentSubStatus;

interface UniversalSubStatusSelectProps {
    value: SubStatusKey;
    onChange: (nextSub: SubStatusKey) => void;
    disabled?: boolean;
    variant?: 'compact' | 'form';
}

const GROUP_ORDER: AgendaSubStatusGroup[] = ['INITIAL_PAYMENT', 'EXECUTION', 'FINAL_EXCEPTION'];

export function UniversalSubStatusSelect({
    value,
    onChange,
    disabled = false,
    variant = 'compact'
}: UniversalSubStatusSelectProps) {
    const safeValue = value || APP_CONFIG.agenda.defaults.subStatus;
    const current = getAgendaSubStatusPresentation(safeValue);

    const renderOptionsGroup = (groupKey: AgendaSubStatusGroup) => (
        <optgroup label={TEXTS.agenda.subStatus.groups[groupKey]}>
            {getAgendaSubStatusesForGroup(groupKey).map((key) => (
                <option key={key} value={key}>
                    {getAgendaSubStatusPresentation(key).label}
                </option>
            ))}
        </optgroup>
    );

    if (variant === 'compact') {
        return (
            <div
                data-ui-key={UI_KEYS.agenda.cardSubStatus}
                className="relative flex items-center gap-2 group cursor-pointer border border-slate-200/60 bg-slate-50/50 hover:bg-slate-100 px-2.5 py-1 rounded-xl transition-all shadow-3xs h-[26px]"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
            >
                <span className={`w-2 h-2 rounded-full inline-block shadow-3xs shrink-0 ${current.colorClass}`} />
                <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-800 select-none tracking-tight font-sans transition-colors">
                    {current.label}
                </span>

                <select
                    value={safeValue}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value as SubStatusKey)}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                >
                    {GROUP_ORDER.map(renderOptionsGroup)}
                </select>
            </div>
        );
    }

    return (
        <div data-ui-key={UI_KEYS.agenda.formSubStatus} className="space-y-1.5 text-left bg-slate-50 p-3 rounded-xl border border-slate-200/40 w-full font-sans animate-fadeIn">
            <div className="flex items-center justify-between select-none">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{TEXTS.agenda.subStatus.fieldLabel}</label>
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shadow-3xs ${current.colorClass}`} />
                    <span className="text-[10px] font-black text-slate-500">{current.label}</span>
                </div>
            </div>

            <select
                value={safeValue}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value as SubStatusKey)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer shadow-3xs transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
                {GROUP_ORDER.map(renderOptionsGroup)}
            </select>
        </div>
    );
}
