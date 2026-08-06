import { Clock, UserCheck } from 'lucide-react';
import { type Appointment } from '../../../../types/appointment.ts';
import { SUB_STATUS_CATALOG } from '../../utils/SubStatusCatalog.ts';

interface ViewerHeaderCardProps {
    appointment: Appointment;
    formattedDate: string;
}

export function ViewerHeaderCard({ appointment, formattedDate }: ViewerHeaderCardProps) {
    const catalogItem = SUB_STATUS_CATALOG[appointment.subStatus as keyof typeof SUB_STATUS_CATALOG];

    return (
        <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3 font-sans">
            <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Agendamento</span>
                <span className="font-black text-slate-800 text-base">{appointment.title}</span>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-600 border-t border-slate-100/70 pt-2.5">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>Horário: {appointment.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span>Data: {formattedDate}</span>
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl space-y-2 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Sub-status Operacional</span>
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full inline-block shrink-0 ${catalogItem?.colorClass || 'bg-slate-400'}`} />
                    <span className="font-black text-slate-800 text-xs sm:text-sm">
                        {catalogItem?.label || appointment.subStatus}
                    </span>
                </div>
            </div>
        </div>
    );
}
