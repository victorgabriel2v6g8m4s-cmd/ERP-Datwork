export const ERP_THEME = {
    card: {
        base: 'flex items-center justify-between p-4 rounded-2xl shadow-sm border transition-all select-none touch-pan-y',
        white: 'border-slate-100 bg-white text-slate-800 hover:shadow-md',
        success: 'border-emerald-200 bg-emerald-50/50 opacity-60 text-slate-500 line-through',
        danger: 'border-red-200 bg-red-50/50 opacity-40 text-slate-400 line-through',
        cardDisabled: 'opacity-40 text-slate-400 border-red-200 bg-red-50/50 line-through pointer-events-none grayscale',
        rowDisabled: 'opacity-40 text-slate-400 bg-slate-100/70 line-through border-slate-200/80 grayscale'
    },

    input: {
        select: 'px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-xs focus:outline-none cursor-pointer h-[32px] sm:h-[34px]',
        text: 'w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800 text-sm font-medium transition-colors'
    },

    modal: {
        overlay: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm',
        container: 'bg-white rounded-2xl border border-slate-100 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl',
        btnCancel: 'flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-98 select-none text-center',
        btnConfirm: 'flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-98 disabled:cursor-not-allowed select-none text-center',
        btnSuccess: 'flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-black text-xs shadow-sm cursor-pointer transition-all active:scale-98 disabled:cursor-not-allowed select-none text-center'
    },

    badge: {
        base: 'text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-lg border',
        PENDING: 'bg-indigo-50 text-indigo-700 border-indigo-150',
        COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-150',
        CANCELED: 'bg-rose-50 text-rose-700 border-rose-150'
    },

    timeline: {
        active: 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm',
        inactive: 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100',
        pinnedBadge: 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-700 font-black'
    }
} as const;
