import { useState, useEffect, useRef } from 'react';
import { CloudCheck, CloudLightning } from 'lucide-react';
import { api } from '../../../api/client.ts';
import { type Product } from '../../../types/product.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';
import { UniversalGridTable, type GridColumn } from '../../../components/index.ts'

interface PricingPayload { products: Product[]; }

export function TabProductsPricing() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<'saved' | 'saving'>('saved');
    const timeoutsRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});

    useEffect(() => {
        fetchPricingData();
        return () => Object.values(timeoutsRef.current).forEach(clearTimeout);
    }, []);

    const fetchPricingData = async () => {
        try {
            const response = await api.get<PricingPayload>('/pricing/products');
            setProducts(response.data.products);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleUpdateLocalCell = (id: string, field: string, value: any) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
        setSyncStatus('saving');
        if (timeoutsRef.current[id]) clearTimeout(timeoutsRef.current[id]);

        timeoutsRef.current[id] = setTimeout(async () => {
            try {
                await api.patch(`/pricing/products/${id}`, { [field]: value });
                setSyncStatus('saved');
                const response = await api.get<PricingPayload>('/pricing/products');
                setProducts(response.data.products);
            } catch (error) { console.error(error); }
        }, 800);
    };

    // 📐 3. DEFINIÇÃO MATRICIAL DO OBJETO DE COLUNAS COM SEUS COMPONENTES CUSTOMIZADOS
    const columnsDefinition: GridColumn<Product>[] = [
        {
            header: 'Item / Estrutura Comercial',
            gridRatio: '2fr',
            textAlign: 'left',
            render: (product) => (
                <div className="flex gap-2.5 items-center min-w-0 text-left">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 overflow-hidden shadow-3xs flex items-center justify-center shrink-0">
                        {product.thumbnail ? <img src={product.thumbnail} className="w-full h-full object-cover" /> : <span className="text-[9px] font-black text-white">PROD</span>}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-mono tabular-nums">{product.sku}</span>
                            <span className="text-[8px] font-black uppercase px-1 rounded bg-slate-100 text-slate-500">Curva {product.abcCategory}</span>
                        </div>
                        <h4 className="font-black text-slate-800 text-xs truncate mt-0.5">{product.name}</h4>
                        <p className="text-[9px] text-slate-400 font-semibold truncate">{(product as any).brand}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Preço Custo Un.',
            gridRatio: '1fr',
            textAlign: 'center',
            render: (product) => <span className="font-bold text-slate-600 tabular-nums">{formatCurrencyBRL(product.totalUnitCost || 0)}</span>
        },
        {
            header: 'Preço Sugerido',
            gridRatio: '1.2fr',
            textAlign: 'center',
            render: (product) => (
                <div className="font-black text-slate-900 bg-slate-50 py-1 px-2 rounded-xl border border-slate-200/60 font-mono text-[11px] tabular-nums min-w-[75px]">
                    {formatCurrencyBRL(product.suggestedPrice || 0)}
                </div>
            )
        },
        {
            header: 'Preço Definitivo',
            gridRatio: '1.2fr',
            textAlign: 'center',
            render: (product) => (
                <input
                    type="number" step="any" min={0}
                    value={product.finalPrice || ''}
                    onChange={(e) => handleUpdateLocalCell(product.id, 'finalPrice', Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full max-w-[85px] mx-auto px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-black text-indigo-600 focus:outline-none focus:bg-white focus:border-indigo-500 tabular-nums text-xs"
                />
            )
        },
        {
            header: 'Lucro Bruto',
            gridRatio: '1fr',
            textAlign: 'center',
            render: (product) => {
                const activePrice = product.finalPrice && product.finalPrice > 0 ? product.finalPrice : product.suggestedPrice;
                const grossProfit = activePrice - product.totalUnitCost;
                return <span className={`font-bold tabular-nums ${grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrencyBRL(grossProfit)}</span>;
            }
        },
        {
            header: 'Lucro Líquido',
            gridRatio: '1fr',
            textAlign: 'center',
            render: (product) => (
                <div className={`font-black tabular-nums bg-slate-50 py-0.5 rounded-lg border px-2 min-w-[75px] ${product.predictedNetProfit >= 0 ? 'text-emerald-700 bg-emerald-50/20 border-emerald-100' : 'text-rose-700 bg-rose-50/20 border-rose-100'}`}>
                    {formatCurrencyBRL(product.predictedNetProfit || 0)}
                </div>
            )
        },
        {
            header: 'Incluir Custo Fixo',
            gridRatio: '1.2fr',
            textAlign: 'center',
            render: (product) => (
                <select
                    value={product.includeFixedCosts || 'DEFAULT'}
                    onChange={(e) => handleUpdateLocalCell(product.id, 'includeFixedCosts', e.target.value)}
                    className="w-full max-w-[90px] mx-auto px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-600 text-[10px] focus:outline-none cursor-pointer"
                >
                    <option value="DEFAULT">Padrão</option>
                    <option value="YES">Sim</option>
                    <option value="NO">Não</option>
                </select>
            )
        }
    ];

    if (loading) return <div className="text-center py-12 text-slate-400 font-bold animate-pulse">Lendo tabelas do banco...</div>;

    return (
        <div className="w-full font-sans text-xs sm:text-sm animate-fadeIn space-y-3 text-left">
            <div className="flex justify-end px-1">
                {syncStatus === 'saving' ? (
                    <span className="text-[10px] font-black text-amber-600 flex items-center gap-0.5 animate-pulse"><CloudLightning className="w-3 h-3" /> Gravando e recalculando no servidor...</span>
                ) : (
                    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-0.5"><CloudCheck className="w-3 h-3" /> Preços e lucros consolidados no banco</span>
                )}
            </div>

            {/* ✨ RENDERIZAÇÃO DA TAG ÚNICA GLOBAL: Sem complicação de código */}
            <UniversalGridTable columns={columnsDefinition} data={products} />
        </div>
    );
}
