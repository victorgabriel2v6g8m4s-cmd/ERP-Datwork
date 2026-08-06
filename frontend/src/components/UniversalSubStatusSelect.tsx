import { type ReactNode, useMemo } from 'react';

export type SubStatusKey =

    | 'RASCUNHO' | 'AGUARDANDO_PAGAMENTO' | 'EM_ANALISE' | 'RECUSADO'
    | 'CONFIRMADO' | 'CHECK_IN' | 'EM_ESPERA' | 'EM_ANDAMENTO' | 'PAUSADO'
    | 'CONCLUIDO' | 'PARCIAL' | 'NAO_COMPARECEU' | 'REAGENDADO';

interface CatalogItem {
    label: string;
    colorClass: string;
    group: 'INITIAL_PAYMENT' | 'EXECUTION' | 'FINAL_EXCEPTION';
}

// 🎨 DICIONÁRIO DE METADADOS ESTRUTURADO COM AGRUPAMENTO OPERACIONAL
export const SUB_STATUS_CATALOG: Record<SubStatusKey, CatalogItem> = {
    RASCUNHO: { label: 'Rascunho', colorClass: 'bg-slate-400 text-slate-400', group: 'INITIAL_PAYMENT' },
    AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pagamento', colorClass: 'bg-amber-400 text-amber-400', group: 'INITIAL_PAYMENT' },
    EM_ANALISE: { label: 'Em Análise', colorClass: 'bg-orange-400 text-orange-400', group: 'INITIAL_PAYMENT' },
    RECUSADO: { label: 'Recusado', colorClass: 'bg-red-500 text-red-500', group: 'INITIAL_PAYMENT' },

    CONFIRMADO: { label: 'Confirmado', colorClass: 'bg-indigo-500 text-indigo-500', group: 'EXECUTION' },
    CHECK_IN: { label: 'Check-In', colorClass: 'bg-cyan-500 text-cyan-500', group: 'EXECUTION' },
    EM_ESPERA: { label: 'Em Espera', colorClass: 'bg-blue-400 text-blue-400', group: 'EXECUTION' },
    EM_ANDAMENTO: { label: 'Em Andamento', colorClass: 'bg-teal-500 text-teal-500', group: 'EXECUTION' },
    PAUSADO: { label: 'Pausado', colorClass: 'bg-yellow-500 text-yellow-500', group: 'EXECUTION' },

    CONCLUIDO: { label: 'Concluído', colorClass: 'bg-emerald-500 text-emerald-500', group: 'FINAL_EXCEPTION' },
    PARCIAL: { label: 'Parcial', colorClass: 'bg-lime-500 text-lime-500', group: 'FINAL_EXCEPTION' },
    NAO_COMPARECEU: { label: 'Não Compareceu', colorClass: 'bg-purple-500 text-purple-500', group: 'FINAL_EXCEPTION' },
    REAGENDADO: { label: 'Reagendado', colorClass: 'bg-fuchsia-500 text-fuchsia-500', group: 'FINAL_EXCEPTION' }
};

// Mapeamento de rótulos comerciais para os cabeçalhos visuais dos grupos
const GROUP_LABELS = {
    INITIAL_PAYMENT: 'Iniciais e Pagamento',
    EXECUTION: 'Confirmação e Execução',
    FINAL_EXCEPTION: 'Finais e Exceção'
};

interface UniversalSubStatusSelectProps {
    value: SubStatusKey;
    onChange: (nextSub: SubStatusKey) => void;
    disabled?: boolean;
    variant?: 'compact' | 'form';
}

export function UniversalSubStatusSelect({
    value, onChange, disabled = false, variant = 'compact'
}: UniversalSubStatusSelectProps) {

    const current = SUB_STATUS_CATALOG[value] || { label: value, colorClass: 'bg-slate-400 text-slate-400', group: 'INITIAL_PAYMENT' };
    const bgClass = current.colorClass ? current.colorClass : ['bg-slate-400'];

    // 🧠 MOTOR REATIVO: Organiza e divide o catálogo em blocos por grupo para renderizar no select
    const renderOptionsGroup = (groupKey: 'INITIAL_PAYMENT' | 'EXECUTION' | 'FINAL_EXCEPTION') => {
        return (
            <optgroup label={GROUP_LABELS[groupKey]}>
                {Object.entries(SUB_STATUS_CATALOG)
                    .filter(([_, item]) => item.group === groupKey)
                    .map(([key, item]) => (
                        <option key={key} value={key}>
                            {item.label}
                        </option>
                    ))}
            </optgroup>
        );
    };

    // 1. VARIANT COMPACT: Linhas de Tabelas e Cards de Agendamentos
    if (variant === 'compact') {
        return (
            <div
                className="relative flex items-center gap-2 group cursor-pointer border border-slate-200/60 bg-slate-50/50 hover:bg-slate-100 px-2.5 py-1 rounded-xl transition-all shadow-3xs h-[26px]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
            >
                <span className={`w-2 h-2 rounded-full inline-block shadow-3xs shrink-0 ${bgClass}`} />
                <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-800 select-none tracking-tight font-sans transition-colors">
                    {current.label}
                </span>

                <select
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value as SubStatusKey)}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                >
                    {renderOptionsGroup('INITIAL_PAYMENT')}
                    {renderOptionsGroup('EXECUTION')}
                    {renderOptionsGroup('FINAL_EXCEPTION')}
                </select>
            </div>
        );
    }

    // 2. VARIANT FORM: Modais de Criação, Visualização e Edição Avançada
    return (
        <div className="space-y-1.5 text-left bg-slate-50 p-3 rounded-xl border border-slate-200/40 w-full font-sans animate-fadeIn">
            <div className="flex items-center justify-between select-none">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sub-status do Atendimento</label>
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shadow-3xs ${bgClass}`} />
                    <span className="text-[10px] font-black text-slate-500">{current.label}</span>
                </div>
            </div>

            <select
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value as SubStatusKey)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer shadow-3xs transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
                {renderOptionsGroup('INITIAL_PAYMENT')}
                {renderOptionsGroup('EXECUTION')}
                {renderOptionsGroup('FINAL_EXCEPTION')}
            </select>
        </div>
    );
}
