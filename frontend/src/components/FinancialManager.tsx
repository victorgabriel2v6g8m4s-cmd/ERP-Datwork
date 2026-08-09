import { DollarSign, Plus, X } from 'lucide-react';
import { maskCurrencyBRL } from '../utils/format.ts';
import { type FinancialItem } from '../types/appointment.ts';

interface FinancialManagerProps {
  financials: FinancialItem[];
  onChangeFinancials: (updated: FinancialItem[]) => void;
}

export function FinancialManager({ financials, onChangeFinancials }: FinancialManagerProps) {
  const handleFinancialChange = <K extends keyof FinancialItem>(
    index: number,
    field: K,
    value: FinancialItem[K]
  ) => {
    const updated = [...financials];
    const current = updated[index];
    if (!current) return;

    updated[index] = { ...current, [field]: value };

    if (field === 'description' && typeof value === 'string' && value.trim() !== '' && index === financials.length - 1) {
      updated.push({ value: 0, type: 'income', description: '' });
    }

    onChangeFinancials(updated);
  };

  const handleRemoveFinancial = (index: number) => {
    onChangeFinancials(financials.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleAddFinancial = () => {
    onChangeFinancials([...financials, { value: 0, type: 'income', description: '' }]);
  };

  return (
    <div className="border-t border-slate-100 pt-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-700">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-black uppercase tracking-wider">Movimentação Financeira</h4>
        </div>

        <button
          type="button"
          onClick={handleAddFinancial}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar</span>
        </button>
      </div>

      <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
        {financials.map((item, index) => {
          const isIncome = item.type === 'income';
          const borderClass = item.value > 0
            ? isIncome
              ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500 bg-emerald-50/10'
              : 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10'
            : 'border-slate-200 focus:border-indigo-500 bg-slate-50';

          const textClass = item.value > 0
            ? isIncome
              ? 'text-emerald-700 font-bold'
              : 'text-red-700 font-bold'
            : 'text-slate-800';

          return (
            <div key={index} className="flex flex-col sm:flex-row gap-2 items-center w-full">
              <div className="w-full sm:w-3/12">
                <input
                  type="text"
                  placeholder="R$ 0,00"
                  value={item.value > 0 ? maskCurrencyBRL((item.value * 100).toFixed(0)) : ''}
                  onChange={(event) => {
                    const rawNumber = Number(event.target.value.replace(/\D/g, '')) / 100;
                    handleFinancialChange(index, 'value', rawNumber);
                  }}
                  className={`w-full px-3 py-1.5 border rounded-xl focus:outline-none text-xs tabular-nums ${borderClass} ${textClass}`}
                />
              </div>

              <div className="w-full sm:w-3/12">
                <select
                  value={item.type}
                  onChange={(event) => handleFinancialChange(index, 'type', event.target.value as FinancialItem['type'])}
                  className={`w-full px-3 py-1.5 border rounded-xl focus:outline-none text-xs h-[32px] cursor-pointer ${borderClass} ${textClass}`}
                >
                  <option value="income" className="text-emerald-700">Entrada (+)</option>
                  <option value="expense" className="text-red-700">Saída (-)</option>
                </select>
              </div>

              <div className="w-full sm:w-5/12">
                <input
                  type="text"
                  placeholder="Ex: Adiantamento"
                  value={item.description}
                  onChange={(event) => handleFinancialChange(index, 'description', event.target.value)}
                  className={`w-full px-3 py-1.5 border rounded-xl focus:outline-none text-xs text-slate-800 ${borderClass}`}
                />
              </div>

              <div className="w-full sm:w-1/12 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveFinancial(index)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {financials.length === 0 && (
          <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl text-xs text-slate-400 font-medium">
            Nenhum lançamento financeiro atrelado.
          </div>
        )}
      </div>
    </div>
  );
}
