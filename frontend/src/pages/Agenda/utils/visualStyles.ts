export interface VisualStyle {
    bg: string;
    text: string;
    border: string;
    indicator: string;
}

// ✨ Dicionário estático imutável: Alocado uma única vez na memória global do Javascript
const STYLES: Record<string, VisualStyle> = {
    SCHEDULED: {
        bg: 'bg-indigo-50/40 hover:bg-indigo-50/80',
        text: 'text-indigo-700',
        border: 'border-indigo-100/50',
        indicator: 'bg-indigo-500'
    },
    PENDING: {
        bg: 'bg-amber-50/40 hover:bg-amber-50/80',
        text: 'text-amber-700',
        border: 'border-amber-100/50',
        indicator: 'bg-amber-500'
    },
    COMPLETED: {
        bg: 'bg-emerald-50/40 hover:bg-emerald-50/80',
        text: 'text-emerald-700',
        border: 'border-emerald-100/50',
        indicator: 'bg-emerald-500'
    },
    CANCELED: {
        bg: 'bg-rose-50/20 opacity-50 line-through text-slate-400',
        text: 'text-rose-600',
        border: 'border-rose-100',
        indicator: 'bg-rose-500'
    }
};

const FALLBACK_STYLE: VisualStyle = {
    bg: 'bg-white',
    text: 'text-slate-700',
    border: 'border-slate-200',
    indicator: 'bg-slate-400'
};

export const getStatusVisualStyle = (status: string): VisualStyle => {
    return STYLES[status] || FALLBACK_STYLE;
};
