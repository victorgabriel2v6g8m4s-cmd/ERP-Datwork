import { Package } from 'lucide-react';

interface StepIdentificationProps {
    sku: string;
    setSku: (v: string) => void;
    name: string;
    setName: (v: string) => void;
    brand: string;
    setBrand: (v: string) => void;
    variation: string;
    setVariation: (v: string) => void;
    description: string;
    setDescription: (v: string) => void;
    hideOptionalFields?: boolean; // ✨ NOVA: Flag polimórfica opcional para reciclagem limpa
}

export function StepIdentification({
    sku, setSku, name, setName, brand, setBrand, variation, setVariation, description, setDescription,
    hideOptionalFields = false // Por padrão, mostra tudo (útil na página de produtos)
}: StepIdentificationProps) {
    return (
        <div className="space-y-3 font-sans text-xs sm:text-sm">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> Dados Identificadores
            </h4>

            {/* 📐 Se ocultar os campos opcionais, a grade vira 1 coluna automática para mobile-friendly perfeito */}
            <div className={`grid gap-3 ${hideOptionalFields ? 'grid-cols-2' : 'grid-cols-2'}`}>
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Código SKU *</label>
                    <input
                        type="text" value={sku} onChange={(e) => setSku(e.target.value)}
                        placeholder="Ex: SKU-8849"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Nome do Item *</label>
                    <input
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Placa Drywall ST"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                </div>

                {/* ✨ CONDICIONAL CIRÚRGICA: Oculta as linhas de produtos caso a flag seja repassada */}
                {!hideOptionalFields && (
                    <>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Marca (Opcional)</label>
                            <input
                                type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                                placeholder="Ex: Knauf"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Variação (Opcional)</label>
                            <input
                                type="text" value={variation} onChange={(e) => setVariation(e.target.value)}
                                placeholder="Ex: 1200x2400mm"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Descrição Comercial</label>
                            <textarea
                                value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="Breve resumo das características técnicas do produto..."
                                rows={2}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}