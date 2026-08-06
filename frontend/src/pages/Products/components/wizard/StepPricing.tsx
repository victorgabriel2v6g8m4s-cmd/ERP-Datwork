import { BarChart3, Layers } from 'lucide-react';
import { maskCurrencyBRL } from '../../../../utils/format.ts';

interface StepPricingProps {
    salePrice: number;
    setSalePrice: (v: number) => void;
    stockQuantity: number;
    setStockQuantity: (v: number) => void;
    abcCategory: string;
    setAbcCategory: (v: string) => void;
}

export function StepPricing({
    salePrice,
    setSalePrice,
    stockQuantity,
    setStockQuantity,
    abcCategory,
    setAbcCategory
}: StepPricingProps) {
    return (
        <div className="space-y-3 font-sans text-xs sm:text-sm">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" /> Metas de Venda & Curva ABC
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Input Preço Base de Venda */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Preço Base de Venda</label>
                    <input
                        type="text"
                        placeholder="R$ 0,00"
                        value={salePrice > 0 ? maskCurrencyBRL((salePrice * 100).toFixed(0)) : ''}
                        onChange={(e) => setSalePrice(Number(e.target.value.replace(/\D/g, "")) / 100)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 focus:outline-none focus:border-indigo-500 tabular-nums"
                    />
                </div>

                {/* Input Estoque Inicial */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Qtd. Estoque Inicial</label>
                    <input
                        type="number"
                        min={0}
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums"
                    />
                </div>

                {/* Select Curva ABC */}
                <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-0.5">
                        <Layers className="w-3 h-3 text-indigo-500" /> Curva ABC
                    </label>
                    <select
                        value={abcCategory}
                        onChange={(e) => setAbcCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-700 h-[38px] focus:outline-none cursor-pointer"
                    >
                        <option value="A">Classe A (Alto Giro)</option>
                        <option value="B">Classe B (Médio Giro)</option>
                        <option value="C">Classe C (Baixo Giro)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
