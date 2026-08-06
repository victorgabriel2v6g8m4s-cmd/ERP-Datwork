import { useState, useEffect } from 'react';
import { Save, Sliders, Layers, CheckCircle, Percent } from 'lucide-react';
import { api } from '../../../api/client.ts';

export function TabSettings() {
    const [maxProductionCap, setMaxProductionCap] = useState<number>(0);
    const [marginCategoryA, setMarginCategoryA] = useState<number>(0);
    const [marginCategoryB, setMarginCategoryB] = useState<number>(0);
    const [marginCategoryC, setMarginCategoryC] = useState<number>(0);

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/pricing/settings');
            setMaxProductionCap(response.data.maxProductionCap);
            setMarginCategoryA(response.data.marginCategoryA);
            setMarginCategoryB(response.data.marginCategoryB);
            setMarginCategoryC(response.data.marginCategoryC);
        } catch (error) {
            console.error('🔥 Erro ao carregar ajustes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put('/pricing/settings', {
                maxProductionCap,
                marginCategoryA,
                marginCategoryB,
                marginCategoryC
            });
            alert('⚙️ Constantes de precificação atualizadas globalmente!');
        } catch {
            alert('⚠️ Falha ao salvar configurações.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-slate-400 animate-pulse font-bold">Carregando parâmetros...</div>;
    }

    return (
        <form onSubmit={handleSave} className="w-full space-y-5 text-left font-sans text-xs sm:text-sm animate-fadeIn">

            {/* Bloco 1: Capacidade Produtiva */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Limites Operacionais
                </h4>
                <div className="max-w-xs">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Capacidade Máxima de Produção (Lotes/Mês)</label>
                    <input
                        type="number" required min={1}
                        value={maxProductionCap || ''}
                        onChange={(e) => setMaxProductionCap(Math.max(0, Number(e.target.value)))}
                        placeholder="Ex: 1500"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums"
                    />
                </div>
            </div>

            {/* Bloco 2: Margens Alvo por Curva ABC */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" /> Margem Bruta Alvo por Curva ABC (Lucro Desejado)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative">
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Margem Categoria A *</label>
                        <div className="relative">
                            <input type="number" required min={0} max={100} value={marginCategoryA || ''} onChange={(e) => setMarginCategoryA(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums" />
                            <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Margem Categoria B *</label>
                        <div className="relative">
                            <input type="number" required min={0} max={100} value={marginCategoryB || ''} onChange={(e) => setMarginCategoryB(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums" />
                            <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Margem Categoria C *</label>
                        <div className="relative">
                            <input type="number" required min={0} max={100} value={marginCategoryC || ''} onChange={(e) => setMarginCategoryC(Math.min(100, Math.max(0, Number(e.target.value))))} className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums" />
                            <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Botão de Persistência Dedicado */}
            <div className="flex border-t border-slate-100 pt-4 justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
                >
                    {isSaving ? <CheckCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Salvar Parâmetros</span>
                </button>
            </div>

        </form>
    );
}
