import { BarChart3, Layers } from 'lucide-react';
import { maskCurrencyBRL } from '../../../../utils/format.ts';
import { type ProductAbcCategory, type ProductCostInclusion } from '../../types/product-form.types.ts';

interface StepPricingProps {
    finalPrice: number;
    setFinalPrice: (value: number) => void;
    abcCategory: ProductAbcCategory;
    setAbcCategory: (value: ProductAbcCategory) => void;
    includeFixedCosts: ProductCostInclusion;
    setIncludeFixedCosts: (value: ProductCostInclusion) => void;
}

export function StepPricing({
    finalPrice,
    setFinalPrice,
    abcCategory,
    setAbcCategory,
    includeFixedCosts,
    setIncludeFixedCosts
}: StepPricingProps) {
    return (
        <div className="space-y-3 font-sans text-xs sm:text-sm">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" /> Preço, Custos Fixos & Curva ABC
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Preço Praticado</label>
                    <input
                        type="text"
                        placeholder="R$ 0,00"
                        value={finalPrice > 0 ? maskCurrencyBRL((finalPrice * 100).toFixed(0)) : ''}
                        onChange={(event) => setFinalPrice(Number(event.target.value.replace(/\D/g, '')) / 100)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 focus:outline-none focus:border-indigo-500 tabular-nums"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Custos Fixos</label>
                    <select
                        value={includeFixedCosts}
                        onChange={(event) => setIncludeFixedCosts(event.target.value as ProductCostInclusion)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 h-[38px] focus:outline-none cursor-pointer"
                    >
                        <option value="DEFAULT">Padrão Global</option>
                        <option value="YES">Incluir</option>
                        <option value="NO">Não incluir</option>
                    </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-0.5">
                        <Layers className="w-3 h-3 text-indigo-500" /> Curva ABC
                    </label>
                    <select
                        value={abcCategory}
                        onChange={(event) => setAbcCategory(event.target.value as ProductAbcCategory)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-700 h-[38px] focus:outline-none cursor-pointer"
                    >
                        <option value="A">Classe A</option>
                        <option value="B">Classe B</option>
                        <option value="C">Classe C</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
