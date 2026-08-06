interface CascadeTimeConfigProps {
    offsetValue: number;
    setOffsetValue: (v: number) => void;
    timeUnit: string;
    setTimeUnit: (v: string) => void;
}

export function CascadeTimeConfig({ offsetValue, setOffsetValue, timeUnit, setTimeUnit }: CascadeTimeConfigProps) {
    return (
        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/60 p-3 rounded-xl font-sans">
            <div className="space-y-1 text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Valor do Deslocamento</label>
                <input
                    type="number" min={0} value={offsetValue || ''} onChange={(e) => setOffsetValue(Number(e.target.value))} placeholder="0"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-slate-800 text-xs focus:outline-none focus:border-indigo-500 tabular-nums"
                />
            </div>
            <div className="space-y-1 text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Grandeza Temporal</label>
                <select
                    value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 text-xs focus:outline-none cursor-pointer"
                >
                    <option value="MINUTES">Minutos</option>
                    <option value="HOURS">Horas</option>
                    <option value="DAYS">Dias</option>
                    <option value="WEEKS">Semanas</option>
                    <option value="MONTHS">Meses</option>
                </select>
            </div>
        </div>
    );
}
