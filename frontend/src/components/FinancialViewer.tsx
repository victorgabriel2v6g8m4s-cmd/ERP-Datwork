import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { type FinancialItem } from '../types/appointment.ts';
import { formatCurrencyBRL } from '../utils/format.ts';

interface FinancialViewerProps {
    financials: FinancialItem[];
}

export function FinancialViewer({ financials }: FinancialViewerProps) {
    const totalIncome = financials.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.value, 0);
    const totalExpense = financials.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.value, 0);
    const balance = totalIncome - totalExpense;

    if (financials.length === 0) return null;

    return (
        <div className="border-t border-slate-100 pt-4 space-y-3 w-full">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Fluxo Financeiro</h4>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${balance >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                    Balanço: {formatCurrencyBRL(balance)}
                </span>
            </div>

            <div className="divide-y divide-slate-50 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-3xs max-h-44 overflow-y-auto">
                {financials.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                            <div className={`p-1 rounded-lg ${item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {item.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            </div>
                            <span className="font-semibold text-slate-700">{item.description}</span>
                        </div>
                        <span className={`font-black tracking-tight ${item.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {item.type === 'income' ? '+' : '-'} {formatCurrencyBRL(item.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
