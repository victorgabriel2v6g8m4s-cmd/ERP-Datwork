import { useNavigate, useLocation } from 'react-router-dom';

// 📝 ESTRUTURA DECLARATIVA PURA: Mapeia o eixo principal de navegação do ERP
const TOP_TAB_NAV_MENU = [
    { label: 'Catálogo Produtos', baseSegment: '/produtos', defaultPath: '/produtos' },
    { label: 'Fichas Técnicas', baseSegment: '/receitas', defaultPath: '/receitas' },
    { label: 'Precificação Inteligente', baseSegment: '/precificacao', defaultPath: '/precificacao/produtos' },
    { label: 'Despesas Operacionais', baseSegment: '/despesas', defaultPath: '/despesas/custos-fixos' }
];

// Listagem de rotas que pertencem a este grande grupo de engenharia e finanças físicas
const ELIGIBLE_BASE_SEGMENTS = ['/produtos', '/receitas', '/precificacao', '/despesas'];

export function GlobalTopTabs() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    // 📐 EXTRATOR DE IMPRESSÃO DIGITAL DE ROTA: Pega apenas o primeiro bloco da URL
    // Ex: "/precificacao/produtos" -> "/precificacao" | "/despesas/variaveis" -> "/despesas"
    const currentBaseSegment = '/' + currentPath.split('/')[1];

    // Se a rota atual não fizer parte deste grupo superior, o componente se oculta (Bypass Silencioso)
    const isEligible = ELIGIBLE_BASE_SEGMENTS.includes(currentBaseSegment);
    if (!isEligible) return null;

    return (
        <div className="w-full bg-white border-b border-slate-100 sticky top-[69px] z-20 shadow-3xs select-none">
            <div className="max-w-4xl mx-auto px-4 flex items-center justify-start sm:justify-center gap-1 overflow-x-auto scrollbar-none py-1.5 w-full">
                {TOP_TAB_NAV_MENU.map((tab) => {

                    // ✨ ACENDIMENTO AUTOMÁTICO UNIVERSAL: Compara o segmento base extraído da URL
                    // Se o segmento for igual, o botão acende. Não importa quantas sub-abas você crie!
                    const isTabActive = currentBaseSegment === tab.baseSegment;

                    return (
                        <button
                            key={tab.baseSegment}
                            type="button"
                            onClick={() => navigate(tab.defaultPath)}
                            className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shrink-0 cursor-pointer ${isTabActive
                                    ? 'bg-indigo-50 text-indigo-600 shadow-3xs border border-indigo-100/50'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent'
                                }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
