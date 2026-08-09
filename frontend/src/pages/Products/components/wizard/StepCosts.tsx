import { Coins } from 'lucide-react';
import { formatCurrencyBRL, maskCurrencyBRL } from '../../../../utils/format.ts';

interface StepCostsProps {
    recipeCostPerUnit: number;
    unitsPerBatch: number;
    indirectCost: number;
    setIndirectCost: (value: number) => void;
    batchRecipeCost: number;
    baseUnitCost: number;
}

export function StepCosts({
    recipeCostPerUnit,
    unitsPerBatch,
    indirectCost,
    setIndirectCost,
    batchRecipeCost,
    baseUnitCost
}: StepCostsProps) {
    return (
        <div className="space-y-3 font-sans text-xs sm:text-sm">
            <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> Custos do Produto
                </h4>
                <p className="text-[10px] text-slate-400">
                    Custos de receita e unidades por lote são calculados pela Ficha Técnica e ficam somente para leitura aqui.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Custo Receita do Lote</label>
                    <input
                        type="text"
                        readOnly
                        value={formatCurrencyBRL(batchRecipeCost)}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed tabular-nums"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Unidades por Lote</label>
                    <input
                        type="number"
                        readOnly
                        value={unitsPerBatch}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed tabular-nums"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Custo Ind. Adicional</label>
                    <input
                        type="text"
                        placeholder="R$ 0,00"
                        value={indirectCost > 0 ? maskCurrencyBRL((indirectCost * 100).toFixed(0)) : ''}
                        onChange={(event) => setIndirectCost(Number(event.target.value.replace(/\D/g, '')) / 100)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums"
                    />
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 grid grid-cols-2 gap-3 text-xs mt-2">
                <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-400">Receita (1 un.)</span>
                    <span className="font-bold text-slate-700 tabular-nums">
                        {formatCurrencyBRL(recipeCostPerUnit)}
                    </span>
                </div>
                <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-400">Base p/ Precificação</span>
                    <span className="font-black text-indigo-600 tabular-nums">
                        {formatCurrencyBRL(baseUnitCost)}
                    </span>
                </div>
            </div>
        </div>
    );
}
