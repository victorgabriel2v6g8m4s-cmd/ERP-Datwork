interface EditorGeneralStepProps {
    name: string; setName: (v: string) => void;
    date: string; setDate: (v: string) => void;
    time: string; setTime: (v: string) => void;
}

export function EditorGeneralStep({ name, setName, date, setDate, time, setTime }: EditorGeneralStepProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome do Cliente</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800 text-sm font-medium" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Data Agendada</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-semibold cursor-pointer h-[38px] text-sm" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Horário</label>
                <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800 text-sm font-medium" />
            </div>
        </div>
    );
}
