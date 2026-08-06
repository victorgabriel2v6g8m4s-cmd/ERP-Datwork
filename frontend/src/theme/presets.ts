// 🪐 TOKENS DE DESIGN CORPORATIVOS DO ERP (Reutilizáveis em qualquer página)
export const ERP_THEME = {
    // Padrões de Cards e Containers
    card: {
        base: 'flex items-center justify-between p-4 rounded-2xl shadow-sm border transition-all select-none touch-pan-y',
        white: 'border-slate-100 bg-white text-slate-800 hover:shadow-md',
        success: 'border-emerald-200 bg-emerald-50/50 opacity-60 text-slate-500 line-through',
        danger: 'border-red-200 bg-red-50/50 opacity-40 text-slate-400 line-through'
    },

    // Elementos de Entrada e Filtros
    input: {
        select: 'px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-xs focus:outline-none cursor-pointer h-[32px] sm:h-[34px]'
    },

    // Modais e Sobreposições (Popups)
    modal: {
        overlay: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm',
        container: 'bg-white rounded-2xl border border-slate-100 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl',
        btnCancel: 'flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors cursor-pointer font-bold text-xs',
        btnConfirm: 'flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer'
    },

    // Crachás / Badges de Indicação Rápida
    badge: {
        base: 'text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-lg border',
        PENDING: 'bg-indigo-50 text-indigo-700 border-indigo-150',
        COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-150',
        CANCELED: 'bg-rose-50 text-rose-700 border-rose-150'
    }
};
