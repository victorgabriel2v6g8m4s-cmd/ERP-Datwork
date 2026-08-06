import { motion } from 'framer-motion';

interface WizardStep1Props {
    title: string;
    setTitle: (v: string) => void;
    date: string;
    setDate: (v: string) => void;
    time: string;
    setTime: (v: string) => void;
    description: string;
    setDescription: (v: string) => void;
}

export function WizardStep1({ title, setTitle, date, setDate, time, setTime, description, setDescription }: WizardStep1Props) {
    return (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome do Agendamento *</label>
                <input
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Consultoria de Negócios"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-medium"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Data Agendada *</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none cursor-pointer h-[38px] font-semibold" />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Horário *</label>
                    <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none h-[38px]" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Observações da Tarefa</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Insira notas explicativas..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none resize-none" />
            </div>
        </motion.div>
    );
}
