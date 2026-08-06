import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tags, Sliders, Package, Landmark, Percent, Landmark as FixedIcon } from 'lucide-react';
import { api } from '../../api/client.ts';
import { TabSettings } from './components/TabSettings.tsx';
import { TabProductsPricing } from './components/TabProductsPricing.tsx';
import { formatCurrencyBRL } from '../../utils/format.ts';
import { UniversalSearchBar, type UniversalFilters, UniversalHeaderDashboard, GlobalTopTabs, GlobalFooterNav, SubTabSelector } from '../../components/index.ts'


interface PricingHeaderData {
    fixedCostPerUnitFactor: number;
    totalVariablePercent: number;
}

export function PricingPage() {
    const navigate = useNavigate();
    const { subtab } = useParams<{ subtab: string }>(); // Captura /ajustes, /produtos ou /servicos

    // const [activeSubTab, setActiveSubTab] = useState<PricingTab>('SETTINGS');

    // Define o mapa de sub-abas da precificação para o nosso componente atômico reciclado
    const PRICING_SUB_TABS = [
        { id: 'ajustes', label: 'Ajustes', path: '/precificacao/ajustes', icon: Sliders },
        { id: 'produtos', label: 'Produtos', path: '/precificacao/produtos', icon: Package },
        { id: 'servicos', label: 'Serviços', path: '/precificacao/servicos', icon: Landmark }
    ];

    // Resolve qual ID de sub-aba está ativo com base na URL (padrão é ajustes)
    const currentActiveSubTab = subtab || 'produtos';
    // 📈 Estados para os indicadores dinâmicos do cabeçalho
    const [metrics, setMetrics] = useState<PricingHeaderData>({ fixedCostPerUnitFactor: 0, totalVariablePercent: 0 });

    useEffect(() => {
        fetchHeaderMetrics();
    }, [subtab]);  // Recarrega se o usuário alternar entre as abas

    const fetchHeaderMetrics = async () => {
        try {
            const response = await api.get('/pricing/products');
            setMetrics({
                fixedCostPerUnitFactor: response.data.fixedCostPerUnitFactor || 0,
                totalVariablePercent: response.data.totalVariablePercent || 0
            });
        } catch (error) {
            console.error('🔥 Erro ao carregar métricas do header:', error);
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none">

            {/* 🔮 Header Corporativo Fixado Contendo o Micro-Dashboard de Índices */}
            <UniversalHeaderDashboard
                title="Precificação Inteligente"
                subtitle="Simulador de Markup & Lucratividade Real"
                icon={Tags}
                backPath="/home"
                kpiCards={[
                    { label: 'Rateio Fixo Un.', value: formatCurrencyBRL(metrics.fixedCostPerUnitFactor), icon: FixedIcon, valueColorClass: 'text-slate-800' },
                    { label: 'Desp. Variáveis', value: `${metrics.totalVariablePercent.toFixed(2)}%`, icon: Percent, valueColorClass: 'text-indigo-600' }
                ]}
            />

            {/* Barramento de Abas Superiores de Eixo do ERP */}
            <GlobalTopTabs />

            {/* Área Central do Simulador */}
            <main className="w-full px-6 md:px-8 mt-5 space-y-5">

                <SubTabSelector tabs={PRICING_SUB_TABS} activeTabId={currentActiveSubTab} />

                {/* Containers Condicionais das Abas */}
                <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-5 shadow-3xs min-h-[260px]">
                    {currentActiveSubTab === 'ajustes' && <TabSettings />}
                    {currentActiveSubTab === 'produtos' && <TabProductsPricing />}

                    {currentActiveSubTab === 'servicos' && (
                        /* ✨ Próxima tarefa: O componente oficial TabServicesPricing entrará exatamente aqui! */
                        <div className="space-y-1 text-center py-10">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">💼 Precificação de Mão de Obra</h3>
                            <p className="text-xs text-slate-400 font-medium">Pronto para receber o Módulo de Serviços...</p>
                        </div>
                    )}
                </div>

            </main>

            <GlobalFooterNav />
        </div>
    );
}
