export const INGREDIENTS_THEME = {
  page: {
    shell: 'w-full min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10 select-none',
    main: 'w-full px-6 mx-auto mt-6 space-y-4',
    loading: 'flex justify-center items-center py-20',
    spinner: 'w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin',
    empty: 'text-center py-12 bg-white border rounded-2xl border-slate-200/80 text-slate-400 font-bold text-xs uppercase tracking-wider',
    createFab: 'fixed bottom-20 right-6 z-40 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-indigo-500/20'
  },
  modal: {
    editor: 'w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4',
    wizard: 'w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5',
    header: 'flex items-center justify-between border-b border-slate-100 pb-3',
    title: 'text-base font-black text-slate-800',
    close: 'text-slate-400 hover:text-slate-600 cursor-pointer',
    footer: 'flex gap-3 border-t border-slate-100 pt-4 font-sans'
  },
  form: {
    sectionTitle: 'text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1',
    label: 'block text-[11px] font-bold text-slate-500 mb-1',
    input: 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500',
    select: 'w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-700 h-[38px] focus:outline-none cursor-pointer focus:border-indigo-500'
  },
  view: {
    metrics: 'grid grid-cols-2 gap-3 select-none font-sans',
    metricCard: 'bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-1 border-b-2',
    metricLabel: 'text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1',
    metricValue: 'text-sm font-black text-slate-800 tabular-nums',
    costAccent: 'border-b-orange-400',
    quantityAccent: 'border-b-indigo-400'
  }
} as const;
