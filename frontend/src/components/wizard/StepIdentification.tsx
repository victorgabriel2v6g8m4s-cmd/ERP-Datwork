import { Package } from 'lucide-react';
import { TEXTS } from '../../i18n/index.ts';
import { UI_KEYS } from '../../ui/keys.ts';

interface StepIdentificationProps {
  sku: string;
  setSku: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  brand?: string;
  setBrand?: (value: string) => void;
  variation?: string;
  setVariation?: (value: string) => void;
  description?: string;
  setDescription?: (value: string) => void;
  hideOptionalFields?: boolean;
}

export function StepIdentification({
  sku,
  setSku,
  name,
  setName,
  brand = '',
  setBrand = () => undefined,
  variation = '',
  setVariation = () => undefined,
  description = '',
  setDescription = () => undefined,
  hideOptionalFields = false
}: StepIdentificationProps) {
  const heading = hideOptionalFields ? TEXTS.ingredients.form.identification : 'Dados Identificadores';
  const skuLabel = hideOptionalFields ? TEXTS.ingredients.form.sku : 'Código SKU *';
  const skuPlaceholder = hideOptionalFields ? TEXTS.ingredients.form.skuPlaceholder : 'Ex: SKU-8849';
  const nameLabel = hideOptionalFields ? TEXTS.ingredients.form.name : 'Nome do Item *';
  const namePlaceholder = hideOptionalFields ? TEXTS.ingredients.form.namePlaceholder : 'Ex: Placa Drywall ST';

  return (
    <div className="space-y-3 font-sans text-xs sm:text-sm">
      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 select-none">
        <Package className="w-3.5 h-3.5" /> {heading}
      </h4>

      <div className={`grid gap-3 ${hideOptionalFields ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
        <div className={hideOptionalFields ? 'col-span-1' : ''}>
          <label className="block text-[11px] font-bold text-slate-500 mb-1 select-none">{skuLabel}</label>
          <input
            type="text"
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            placeholder={skuPlaceholder}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
            data-ui-key={hideOptionalFields ? UI_KEYS.ingredients.formSku : undefined}
          />
        </div>

        <div className={hideOptionalFields ? 'col-span-1' : ''}>
          <label className="block text-[11px] font-bold text-slate-500 mb-1 select-none">{nameLabel}</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={namePlaceholder}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
            data-ui-key={hideOptionalFields ? UI_KEYS.ingredients.formName : undefined}
          />
        </div>

        {!hideOptionalFields && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 select-none">Marca (Opcional)</label>
              <input type="text" value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Ex: Knauf" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 select-none">Variação (Opcional)</label>
              <input type="text" value={variation} onChange={(event) => setVariation(event.target.value)} placeholder="Ex: 1200x2400mm" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 mb-1 select-none">Descrição Comercial</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Breve resumo das características técnicas do produto..." rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500 resize-none transition-colors" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
