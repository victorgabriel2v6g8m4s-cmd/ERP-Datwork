import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, ChefHat, FlaskConical, Tags, Wallet, Calendar,
    LayoutDashboard, BarChart3, Package, ChevronRight, X
} from 'lucide-react';

const FOOTER_NAV_GROUPS = [
    { id: 'home', label: 'Início', icon: Home, path: '/home', isDirect: true, subModules: [] },
    {
        id: 'engenharia', label: 'Engenharia', icon: ChefHat, isDirect: false,
        baseSegments: ['/produtos', '/receitas', '/precificacao', '/despesas'],
        subModules: [
            { name: 'Catálogo de Produtos', path: '/produtos', icon: Tags },
            { name: 'Fichas Técnicas', path: '/receitas', icon: ChefHat },
            { name: 'Despesas Operacionais', path: '/despesas/custos-fixos', icon: Wallet },
            { name: 'Precificação Inteligente', path: '/precificacao/ajustes', icon: Tags }
        ]
    },
    {
        id: 'suprimentos', label: 'Estoque', icon: Package, isDirect: false, baseSegments: ['/estoque', '/insumos'],
        subModules: [
            { name: 'Controle de Estoque', path: '/estoque', icon: Package },
            { name: 'Cadastro de Insumos', path: '/insumos', icon: FlaskConical }
        ]
    },
    {
        id: 'financas', label: 'Finanças', icon: LayoutDashboard, isDirect: false, baseSegments: ['/dashboard', '/dre'],
        subModules: [
            { name: 'Dashboard Geral', path: '/dashboard', icon: LayoutDashboard },
            { name: 'DRE Anual', path: '/dre', icon: BarChart3 }
        ]
    },
    {
        id: 'operacao', label: 'Operação', icon: Calendar, isDirect: false, baseSegments: ['/agenda', '/servicos'],
        subModules: [
            { name: 'Agenda & Horários', path: '/agenda', icon: Calendar },
            { name: 'Módulo de Serviços', path: '/servicos', icon: Calendar }
        ]
    }
];

export function GlobalFooterNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

    // 🎢 ESTADOS DO SENSOR DE SCROLL REVERSO (Oculta ao descer, exibe ao subir)
    const [isFooterVisible, setIsSearchBarVisible] = useState(true);
    const lastScrollY = useRef(0);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveGroupId(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 🤖 MOTOR SENSOR DE ROLAGEM: Monitora o scroll físico do cliente
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Se rolar para baixo, recolhe. Se rolar para cima, mostra.
            if (currentScrollY > lastScrollY.current && currentScrollY > 30) {
                setIsSearchBarVisible(false);
                setActiveGroupId(null); // Fecha a gaveta preventiva se o usuário rolar
            } else {
                setIsSearchBarVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getActiveGroupMenu = () => {
        if (currentPath === '/home') return 'home';
        const active = FOOTER_NAV_GROUPS.find(group =>
            group.baseSegments?.some(segment => currentPath.startsWith(segment))
        );
        return active ? active.id : null;
    };

    const activeGroupMenuId = getActiveGroupMenu();
    const openedGroup = FOOTER_NAV_GROUPS.find(g => g.id === activeGroupId);

    const handleGroupClick = (group: any) => {
        if (group.isDirect && group.path) {
            setActiveGroupId(null);
            navigate(group.path);
        } else {
            setActiveGroupId(activeGroupId === group.id ? null : group.id);
        }
    };

    const handleSubModuleNavigate = (path: string) => {
        setActiveGroupId(null);
        navigate(path);
    };

    return (
        /* ✨ AJUSTADO: z-40 impede colisão com modais que rodam em z-50. Animação de Y esconde o menu na base */
        <motion.div
            ref={menuRef}
            animate={{ y: isFooterVisible ? 0 : 80 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="fixed bottom-0 left-0 right-0 z-40 font-sans select-none w-full"
        >

            {/* 🔮 GAVETA FLUTUANTE INFERIOR ESCURA (BOTTOM-SHEET) */}
            <AnimatePresence>
                {activeGroupId && openedGroup && openedGroup.subModules.length > 0 && (
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 rounded-t-3xl shadow-2xl pb-20 px-4 pt-4 border-x border-slate-800"
                    >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 px-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Módulos de {openedGroup.label}</span>
                            <button type="button" onClick={() => setActiveGroupId(null)} className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer rounded-lg hover:bg-slate-800"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {openedGroup.subModules.map((sub, idx) => {
                                const SubIcon = sub.icon;
                                const isCurrentSubActive = currentPath.startsWith(sub.path.split('/')[1]);

                                return (
                                    <button
                                        key={`sub-nav-${idx}`} type="button" onClick={() => handleSubModuleNavigate(sub.path)}
                                        className={`w-full p-3 border rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${isCurrentSubActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-850 border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300'}`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`p-2 rounded-lg shrink-0 ${isCurrentSubActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}><SubIcon className="w-3.5 h-3.5" /></div>
                                            <span className="text-xs font-black truncate">{sub.name}</span>
                                        </div>
                                        <ChevronRight className={`w-3.5 h-3.5 ${isCurrentSubActive ? 'text-white' : 'text-slate-500'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🧭 DOCK DE BOTÕES FIXO NO RODAPÉ - LARGURA FULL COM BORDAS ACESSÍVEIS */}
            <nav className="w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-850 py-2 px-6 shadow-2xl flex items-center justify-between h-[64px]">
                {FOOTER_NAV_GROUPS.map((group) => {
                    const GroupIcon = group.icon;
                    const isSelected = activeGroupId === group.id || (!activeGroupId && activeGroupMenuId === group.id);

                    return (
                        <button
                            key={group.id} type="button" onClick={() => handleGroupClick(group)}
                            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center group cursor-pointer relative"
                        >
                            <div className={`p-1.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white scale-105 shadow-sm font-black' : 'text-slate-400 hover:text-slate-200'}`}>
                                <GroupIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            </div>
                            <span className={`text-[9px] uppercase tracking-wider font-bold mt-1 block transition-colors ${isSelected ? 'text-indigo-400 font-black' : 'text-slate-500 group-hover:text-slate-300'}`}>{group.label}</span>
                            {isSelected && <motion.div layoutId="magneticFooterLine" className="absolute bottom-0 w-5 h-0.5 bg-indigo-400 rounded-full" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                        </button>
                    );
                })}
            </nav>
        </motion.div>
    );
}
