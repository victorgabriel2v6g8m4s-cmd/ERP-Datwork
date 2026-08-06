import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChefHat, FlaskConical, Tags, Wallet, Calendar, LayoutDashboard, BarChart3, Package, ChevronRight, Layers, Settings } from 'lucide-react';

// Componentes Universais e Atômicos Compartilhados
import { HomeCarousel } from './components/HomeCarousel.tsx';
import { HomeAnchorNav } from './components/HomeAnchorNav.tsx';
import { GlobalFooterNav } from '../../components/GlobalFooterNav.tsx';

const MODULE_GROUPS = [
  {
    id: 'engenharia',
    title: 'Engenharia & Precificação',
    subtitle: 'Estruturação de custos, insumos e margens reais',
    icon: Layers,
    bgIcon: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    modules: [
      { name: 'Catálogo de Produtos', path: '/produtos', desc: 'Preços de venda e margens comerciais', icon: Tags },
      { name: 'Fichas Técnicas', path: '/receitas', desc: 'Composição de insumos por lote e rendimentos', icon: ChefHat },
      { name: 'Despesas Operacionais', path: '/despesas/custos-fixos', desc: 'Planilha automatizada de custos fixos e variáveis', icon: Wallet },
      { name: 'Precificação Inteligente', path: '/precificacao/ajustes', desc: 'Simulador central de markup divisor e lucro real', icon: Tags }
    ]
  },
  {
    id: 'suprimentos',
    title: 'Suprimentos & Estoque',
    subtitle: 'Gestão de fila de inventário e matérias-primas',
    icon: Package,
    bgIcon: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    modules: [
      { name: 'Controle de Estoque', path: '/estoque', desc: 'Fila de inventário e alertas de quebra de barreira', icon: Package },
      { name: 'Cadastro de Insumos', path: '/insumos', desc: 'Matérias-primas e histórico de preços de compra', icon: FlaskConical }
    ]
  },
  {
    id: 'financas',
    title: 'Finanças & Relatórios',
    subtitle: 'Demonstrativos e indicadores de faturamento',
    icon: BarChart3,
    bgIcon: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
    modules: [
      { name: 'Dashboard Geral', path: '/dashboard', desc: 'Indicadores gráficos e métricas de desempenho', icon: LayoutDashboard },
      { name: 'DRE Anual', path: '/dre', desc: 'Demonstrativo de resultado do exercício acumulado', icon: BarChart3 }
    ]
  },
  {
    id: 'operacao',
    title: 'Operação & Atendimento',
    subtitle: 'Grade tátil de horários e agendamento de equipes',
    icon: Calendar,
    bgIcon: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
    modules: [
      { name: 'Agenda & Horários', path: '/agenda', desc: 'Grade operacional tátil de agendamentos', icon: Calendar },
      { name: 'Módulo de Serviços', path: '/servicos', desc: 'Configuração de tarifas horárias e comissões', icon: Settings }
    ]
  }
];

const HIGHLIGHT_MODULES = [
  { name: 'Agenda Operacional', path: '/agenda', desc: 'Controle em tempo real de horários e equipes', icon: Calendar, bgGradient: 'from-slate-900 to-rose-950 border-rose-900/30' },
  { name: 'Fichas Técnicas', path: '/receitas', desc: 'Engenharia estrita de insumos e matérias-primas', icon: ChefHat, bgGradient: 'from-slate-900 to-emerald-950 border-emerald-900/30' },
  { name: 'Precificação Inteligente', path: '/precificacao/ajustes', desc: 'Simulador matemático de markup e lucro líquido', icon: Tags, bgGradient: 'from-slate-900 to-indigo-950 border-indigo-900/30' },
  { name: 'Centro de Custos', path: '/despesas/custos-fixos', desc: 'Gerenciamento automatizado de despesas gerais', icon: Wallet, bgGradient: 'from-slate-900 to-amber-950 border-amber-900/30' }
];

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // 🤖 1. MOTOR SENSOR DE ROLAGEM: Ocultação elástica inteligente
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 40) {
        setIsSearchBarVisible(false);
      } else {
        setIsSearchBarVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🤖 2. SMOOTH SCROLL: Deslocamento suave até o hash alvo da URL
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
      }
    }
  }, [location.hash]);

  const isSearching = searchQuery.trim() !== '';

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none relative tracking-tight antialiased">

      {/* 🔍 BARRA DE PESQUISA INTELIGENTE SUPERIOR: Ocultação elástica assistida por scroll reverso */}
      <motion.div
        animate={{ y: isSearchBarVisible ? 0 : -80 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/40 py-3 px-4 sticky top-0 z-30 shadow-2xs"
      >
        <div className="max-w-4xl mx-auto relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar um módulo operacional ou tela do sistema..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-bold text-xs sm:text-sm transition-colors shadow-3xs"
          />
        </div>
      </motion.div>

      {/* ÁREA CENTRAL E GRIDS OPERACIONAIS DO HUB */}
      <main className="max-w-4xl mx-auto px-4 mt-4 space-y-6">

        {/* ✨ EXIBIÇÃO CONDICIONAL: Oculta componentes de destaque caso o usuário esteja filtrando na busca */}
        {!isSearching && (
          <>
            {/* 🎢 ELEMENTO RECICLADO ATÔMICO: Carrossel lento de alta fidelidade visual */}
            <HomeCarousel items={HIGHLIGHT_MODULES} onNavigate={navigate} />

            {/* 🧭 ELEMENTO RECICLADO ATÔMICO: Barra magnética de âncoras para scroll assistido por hash */}
            <HomeAnchorNav
              groups={MODULE_GROUPS}
              currentHash={location.hash}
              onAnchorClick={(id) => navigate(`#${id}`)}
            />
          </>
        )}

        {/* MATRIZ OPERACIONAL CENTRAL DO ERP */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            {isSearching ? 'Módulos Operacionais Filtrados' : 'Matriz Estrutural de Módulos'}
          </span>

          {isSearching ? (
            /* 🔍 VISÃO FILTRADA DINAMICAMENTE NA DIGITAÇÃO (PLANILHA DE BUSCA DIRETA) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fadeIn">
              {MODULE_GROUPS.flatMap(g => g.modules)
                .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((mod, idx) => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={`search-mod-${idx}`}
                      type="button"
                      onClick={() => navigate(mod.path)}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 text-left shadow-3xs flex items-center justify-between hover:border-indigo-400 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-800 leading-tight">{mod.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{mod.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  );
                })}
            </div>
          ) : (
            /* 🗂️ VISÃO ORIGINAL MATRIZ: Blocos corporativos expandidos e indexados por ID Âncora */
            <div className="space-y-4">
              {MODULE_GROUPS.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div
                    key={group.id}
                    id={group.id} // Chave primária para o motor de scroll assistido em segundo plano
                    className="border border-slate-200/80 rounded-2xl bg-white shadow-3xs p-4 space-y-3 scroll-mt-20 text-left transition-all"
                  >
                    {/* Cabeçalho do Bloco Operacional com Vetores SVG Nitidos */}
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-2.5 w-full">
                      <div className={`p-2 rounded-xl shrink-0 ${group.bgIcon}`}>
                        <GroupIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 leading-none">{group.title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{group.subtitle}</p>
                      </div>
                    </div>

                    {/* Grade Interna de Sub-Módulos do Eixo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.modules.map((mod, idx) => {
                        const Icon = mod.icon;
                        return (
                          <button
                            key={`mod-${idx}`}
                            type="button"
                            onClick={() => navigate(mod.path)}
                            className="w-full p-3 bg-slate-50/40 border border-slate-200/60 rounded-xl text-left hover:border-indigo-300 hover:bg-white flex items-center justify-between transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 group-hover:text-indigo-600 group-hover:border-indigo-100 shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-[11px] font-black text-slate-700 leading-tight group-hover:text-slate-900">{mod.name}</h4>
                                <p className="text-[9px] text-slate-400 font-bold truncate mt-0.5">{mod.desc}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 🧭 DOCK ESCURO FLUTUANTE DE RODAPÉ (NATIVO APP LOOK) */}
      <GlobalFooterNav />
    </div>
  );
}