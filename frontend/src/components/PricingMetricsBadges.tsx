import { Percent, Landmark as FixedIcon } from 'lucide-react';
import { formatCurrencyBRL } from '../utils/format.ts';

interface PricingMetricsBadgesProps {
    fixedCostPerUnitFactor: number;
    totalVariablePercent: number;
}

export function PricingMetricsBadges({ fixedCostPerUnitFactor, totalVariablePercent }: PricingMetricsBadgesProps) {
    return (
        <div className="flex items-center gap-2.5 shrink-0 select-none">

            {/* Badge 1: Rateio de Custos Fixos por Unidade */}
            <div className="flex flex-col text-right bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1 min-w-[110px]">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-end gap-0.5">
                    <FixedIcon className="w-2.5 h-2.5 text-amber-500" /> Rateio Fixo Un.
                </span>
                <span className="text-xs font-black text-slate-800 font-mono tabular-nums mt-0.5">
                    {formatCurrencyBRL(fixedCostPerUnitFactor)}
                </span>
            </div>

            {/* Badge 2: Percentual Total de Despesas Variáveis */}
            <div className="flex flex-col text-right bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1 min-w-[110px]">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-end gap-0.5">
                    <Percent className="w-2.5 h-2.5 text-indigo-500" /> Desp. Variáveis
                </span>
                <span className="text-xs font-black text-indigo-600 font-mono tabular-nums mt-0.5">
                    {totalVariablePercent.toFixed(2)}%
                </span>
            </div>

        </div>
    );
}
