import { Coins } from 'lucide-react';
import { maskCurrencyBRL } from '../../../../utils/format.ts';

interface StepIngredientMetricsProps {
    price: number;
    setPrice: (v: number) => void;
    quantity: number;
    setQuantity: (v: number) => void;
    unit: string;
    setUnit: (v: string) => void;
}

export function StepIngredientMetrics({
    price, setPrice, quantity, setQuantity, unit, setUnit
}: StepIngredientMetricsProps) {
    return (
        <div className="space-y-4 font-sans text-xs sm:text-sm">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> Métricas do Insumo
            </h4>

            <div className="grid grid-cols-3 gap-3">
                {/* Preço de Compra */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Preço de Compra</label>
                    <input
                        type="text"
                        placeholder="R$ 0,00"
                        value={price > 0 ? maskCurrencyBRL((price * 100).toFixed(0)) : ''}
                        onChange={(e) => setPrice(Number(e.target.value.replace(/\D/g, "")) / 100)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 tabular-nums focus:outline-none focus:border-indigo-500"
                    />
                </div>

                {/* Quantidade Contida */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Qtd. Contida</label>
                    <input
                        type="number"
                        min={0.01}
                        step="any"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(0.01, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                </div>

                {/* Unidade de Medida Oficial */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Unidade Medida</label>
                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-700 h-[38px] focus:outline-none cursor-pointer focus:border-indigo-500"
                    >
                        <option value="Unidades">Unidades (un.)</option>
                        <option value="Gramas">Gramas (g)</option>
                        <option value="Quilos">Quilos (kg)</option>
                        <option value="MLs">MLs (ml)</option>
                        <option value="Centímetros">Centímetros (cm)</option>
                        <option value="Metros">Metros (m)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
