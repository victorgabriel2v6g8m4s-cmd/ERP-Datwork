import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

// Contrato estrito para os mini-cards de indicadores (KPIs)
export interface HeaderKpiCard {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    valueColorClass?: string; // Ex: 'text-indigo-600', 'text-emerald-600'
}

// Contrato estrito para botões de ação (Ex: Histórico, Filtros avançados)
export interface HeaderActionButton {
    label?: string;
    icon: LucideIcon;
    onClick: () => void;
    title?: string;
    className?: string;
}

interface UniversalHeaderDashboardProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    iconColorClass?: string;
    backPath?: string;                // Caminho de volta opcional. Se enviado, exibe a seta.
    statusBadge?: ReactNode;          // Elemento customizado de status (Ex: Sincronizado, Gravando...)
    subBadge?: ReactNode;             // Elemento secundário abaixo do subtítulo (Ex: Total da Aba)
    kpiCards?: HeaderKpiCard[];       // Fila de mini-cards informativos financeiros
    actionButtons?: HeaderActionButton[]; // Botões de gatilho do lado direito
}

export function UniversalHeaderDashboard({
    title, subtitle, icon: TitleIcon, iconColorClass = 'text-indigo-600',
    backPath, statusBadge, subBadge, kpiCards = [], actionButtons = []
}: UniversalHeaderDashboardProps) {
    const navigate = useNavigate();

    return (
        <header className="w-full bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/80 select-none">
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                {/* LADO ESQUERDO: Identificação, Títulos e Navegação Retroativa */}
                <div className="flex items-center gap-3 min-w-0">
                    {backPath && (
                        <button
                            type="button"
                            onClick={() => navigate(backPath)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 shadow-3xs shrink-0"
                            title="Voltar para a tela anterior"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}
                    <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                                <TitleIcon className={`w-4 h-4 ${iconColorClass}`} />
                                <span>{title}</span>
                            </h1>
                            {statusBadge && <div className="shrink-0">{statusBadge}</div>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">{subtitle}</p>
                        {subBadge && <div className="mt-1 block">{subBadge}</div>}
                    </div>
                </div>

                {/* LADO DIREITO: Bloco Misto de KPIs e Botões Operacionais */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center flex-wrap justify-end">

                    {/* 📊 FILA DE INDICADORES DINÂMICOS (KPIs) */}
                    {kpiCards.map((kpi, idx) => {
                        const KpiIcon = kpi.icon;
                        return (
                            <div
                                key={`header-kpi-${idx}`}
                                className="flex flex-col text-right bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1 min-w-[110px]"
                            >
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-end gap-0.5">
                                    {KpiIcon && <KpiIcon className="w-2.5 h-2.5 opacity-60" />}
                                    <span>{kpi.label}</span>
                                </span>
                                <span className={`text-xs font-black font-mono tabular-nums mt-0.5 ${kpi.valueColorClass || 'text-slate-800'}`}>
                                    {kpi.value}
                                </span>
                            </div>
                        );
                    })}

                    {/* 🛠️ FILA DE BOTÕES DE AÇÃO ADICIONAIS */}
                    {actionButtons.map((btn, idx) => {
                        const BtnIcon = btn.icon;
                        return (
                            <button
                                key={`header-btn-${idx}`}
                                type="button"
                                onClick={btn.onClick}
                                title={btn.title}
                                className={btn.className || "flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-black text-xs rounded-xl shadow-3xs hover:scale-102 active:scale-98 transition-all cursor-pointer h-9"}
                            >
                                <BtnIcon className="w-3.5 h-3.5 text-indigo-500" />
                                {btn.label && <span>{btn.label}</span>}
                            </button>
                        );
                    })}

                </div>

            </div>
        </header>
    );
}
