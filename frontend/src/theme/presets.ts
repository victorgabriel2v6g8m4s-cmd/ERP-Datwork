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
    },

    recipes: {
        page: {
            shell: 'w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none',
            main: 'w-full px-6 mx-auto mt-6 space-y-4',
            emptyState: 'text-center py-12 bg-white border rounded-2xl border-slate-200/80 text-slate-400 font-bold text-xs uppercase tracking-wider block w-full',
            createFab: 'fixed bottom-20 right-6 z-40 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-indigo-500/20'
        },
        card: {
            wrapper: 'w-full block rounded-2xl transition-shadow',
            dragging: 'shadow-md ring-2 ring-indigo-500/5 z-30 scale-[1.01]',
            shell: 'w-full rounded-2xl border overflow-hidden relative shadow-3xs transition-colors duration-200',
            active: 'border-slate-200/80 bg-white hover:border-indigo-300',
            inactive: 'border-red-200 bg-red-50/30 opacity-45 shadow-none',
            body: 'p-4 z-10 relative flex items-center justify-between w-full h-full cursor-pointer select-none gap-3',
            bodyActive: 'bg-white hover:bg-slate-50/20',
            bodyInactive: 'bg-transparent',
            inactiveBadge: 'text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200',
            metrics: 'flex gap-4 text-[11px] font-bold text-slate-500 mt-2 bg-slate-50 p-2 rounded-xl w-fit border border-slate-100'
        },
        modal: {
            overlay: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm select-none',
            editor: 'w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4 text-left',
            viewer: 'w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[85vh] overflow-y-auto space-y-5 relative',
            section: 'bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3',
            costSummary: 'bg-slate-900 text-white p-3 rounded-2xl grid grid-cols-2 gap-4 px-4 divide-x divide-slate-800 border border-slate-800',
            footer: 'flex gap-3 border-t border-slate-100 pt-4 font-bold text-xs'
        },
        statusDialog: {
            container: 'bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 border border-slate-100 shadow-xl',
            cancelButton: 'flex-1 py-2 bg-slate-100 text-slate-500 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors',
            confirmButton: 'flex-1 py-2 bg-rose-600 text-white rounded-xl cursor-pointer hover:bg-rose-700 transition-colors shadow-md shadow-rose-100'
        }
    },

    pricing: {
        page: {
            shell: 'w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none',
            main: 'w-full px-6 md:px-8 mt-5 space-y-5',
            panel: 'w-full bg-white border border-slate-200/80 rounded-3xl p-5 shadow-3xs min-h-[260px]'
        },
        settings: {
            form: 'w-full space-y-5 text-left font-sans text-xs sm:text-sm animate-fadeIn',
            loading: 'text-center py-8 text-slate-400 animate-pulse font-bold',
            section: 'bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3',
            sectionTitle: 'text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5',
            label: 'block text-[11px] font-bold text-slate-500 mb-1',
            input: 'w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums',
            marginInput: 'w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-800 focus:outline-none focus:border-indigo-500 tabular-nums',
            footer: 'flex items-center gap-4 border-t border-slate-100 pt-4 justify-end',
            saveButton: 'px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
            successMessage: 'text-[10px] font-bold text-emerald-600 inline-flex items-center gap-1',
            errorMessage: 'text-[10px] font-bold text-rose-600 inline-flex items-center gap-1'
        },
        products: {
            container: 'w-full font-sans text-xs sm:text-sm animate-fadeIn space-y-3 text-left',
            loading: 'text-center py-12 text-slate-400 font-bold animate-pulse',
            suggestedPrice: 'font-black text-slate-900 bg-slate-50 py-1 px-2 rounded-xl border border-slate-200/60 font-mono text-[11px] tabular-nums min-w-[75px]',
            finalPriceInput: 'w-full max-w-[85px] mx-auto px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-black text-indigo-600 focus:outline-none focus:bg-white focus:border-indigo-500 tabular-nums text-xs',
            netProfit: 'font-black tabular-nums py-0.5 rounded-lg border px-2 min-w-[75px]',
            netProfitPositive: 'text-emerald-700 bg-emerald-50/20 border-emerald-100',
            netProfitNegative: 'text-rose-700 bg-rose-50/20 border-rose-100',
            fixedCostSelect: 'w-full max-w-[90px] mx-auto px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-600 text-[10px] focus:outline-none cursor-pointer',
            syncSaving: 'text-[10px] font-black text-amber-600 flex items-center gap-0.5 animate-pulse',
            syncSaved: 'text-[10px] font-black text-emerald-600 flex items-center gap-0.5',
            syncError: 'text-[10px] font-black text-rose-600 flex items-center gap-0.5'
        },
        services: {
            placeholder: 'space-y-2 text-center py-10'
        }
    }
} as const;
