import { Coins } from 'lucide-react';
import { maskCurrencyBRL } from '../../../../utils/format.ts';

interface StepCostsProps {
    batchCost: number;
    setBatchCost: (v: number) => void;
    unitsPerBatch: number;
    setUnitsPerBatch: (v: number) => void;
    productionCostInput: number;
    setProductionCostInput: (v: number) => void;
    calculatedProductionCost: number;
    calculatedTotalUnitCost: number;
}

export function StepCosts({
    batchCost,
    setBatchCost,
    unitsPerBatch,
    setUnitsPerBatch,
    productionCostInput,
    setProductionCostInput,
    calculatedProductionCost,
    calculatedTotalUnitCost
}: StepCostsProps) {
    return (
        <div className="space-y-3 font-sans text-xs sm:text-sm">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> Rateio de Custos Fracionados
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Input Custo Total do Lote */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Custo Total Lote</label>
                    <input
                        type="text"
                        placeholder="R$ 0,00"
                        value={batchCost > 0 ? maskCurrencyBRL((batchCost * 100).toFixed(0)) : ''}
                        onChange={(e) => setBatchCost(Number(e.target.value.replace(/\D/g, "")) / 100)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums"
                    />
                </div>

                {/* Input Unidades por Lote */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Unidades por Lote</label>
                    <input
                        type="number"
                        min={1}
                        value={unitsPerBatch}
                        onChange={(e) => setUnitsPerBatch(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums"
                    />
                </div>

                {/* Input Custo Direto Adicional */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Custo Ind. Adicional</label>
                    <input
                        type="text"
                        placeholder="R$ 0,00"
                        value={productionCostInput > 0 ? maskCurrencyBRL((productionCostInput * 100).toFixed(0)) : ''}
                        onChange={(e) => setProductionCostInput(Number(e.target.value.replace(/\D/g, "")) / 100)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums"
                    />
                </div>
            </div>

            {/* Painel de Outputs Calculados de Forma Transparente */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 grid grid-cols-2 gap-3 text-xs mt-2">
                <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-400">Frações Lote (1 un.)</span>
                    <span className="font-bold text-slate-700 tabular-nums">
                        {maskCurrencyBRL((calculatedProductionCost * 100).toFixed(0))}
                    </span>
                </div>
                <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-400">Custo Absoluto (1 un.)</span>
                    <span className="font-black text-indigo-600 tabular-nums">
                        {maskCurrencyBRL((calculatedTotalUnitCost * 100).toFixed(0))}
                    </span>
                </div>
            </div>
        </div>
    );
}
