export const AGENDA_THEME = {
  page: {
    shell: 'w-full min-h-screen bg-slate-50/50 pb-24 font-sans select-none tracking-tight antialiased',
    main: 'w-full px-6 md:px-8 mt-5 space-y-4',
    loading: 'flex justify-center items-center py-20 w-full',
    spinner: 'w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin',
    subBadge: 'flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2.5 py-0.5 rounded-md mt-1 w-fit font-mono tabular-nums'
  },
  filters: {
    calendarButton: 'px-3 py-1.5 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer border border-slate-950 transition-transform active:scale-95 shrink-0 h-[32px] sm:h-[34px]'
  },
  card: {
    wrapper: 'relative mb-3 group',
    dragging: 'shadow-md ring-2 ring-indigo-500/20',
    pressing: 'border-indigo-400 shadow-sm',
    dragHandle: 'text-slate-400 hover:text-slate-600 p-1 cursor-grab active:cursor-grabbing shrink-0',
    balance: 'text-xs px-2 py-0.5 rounded-lg border font-black tracking-tight tabular-nums',
    balancePositive: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    balanceNegative: 'bg-red-100 text-red-800 border-red-200',
    swipeBackground: 'absolute inset-0 rounded-2xl flex items-center justify-between px-6 overflow-hidden pointer-events-none',
    swipeAction: 'flex items-center gap-2 text-white font-semibold',
    motionColors: {
      delete: '#ef4444',
      completed: '#f0fdf4',
      canceled: '#fef2f2',
      pending: '#ffffff',
      complete: '#22c55e'
    }
  },
  wizard: {
    createButton: 'fixed bottom-20 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans',
    container: 'w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col max-h-[90vh] overflow-y-auto',
    header: 'flex items-center justify-between border-b border-slate-100 pb-3 mb-5',
    stepBadge: 'flex items-center justify-center w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black font-mono',
    footer: 'flex gap-3 border-t border-slate-100 pt-4 justify-end',
    nextButton: 'flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100',
    finishButton: 'flex items-center gap-1.5 px-5 py-2 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-100'
  },
  editor: {
    container: 'w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-6 my-8 max-h-[90vh] overflow-y-auto space-y-6',
    header: 'flex items-center justify-between border-b border-slate-100 pb-3',
    fieldLabel: 'block text-xs font-bold uppercase text-slate-500 mb-1',
    textarea: 'w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 text-sm font-medium resize-none'
  },
  calendar: {
    shell: 'w-full space-y-4 animate-fadeIn text-left',
    toolbar: 'flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 border border-slate-200/60 p-3 rounded-2xl w-full',
    backButton: 'px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-3xs',
    rangeButton: 'w-full sm:w-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-150',
    container: 'w-full bg-white border border-slate-200/80 rounded-2xl shadow-3xs relative h-[62vh] overflow-hidden flex flex-col',
    selectedDay: 'bg-indigo-600 text-white rounded-xl font-black scale-102',
    rangeDay: 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50',
    normalDay: 'bg-slate-50/50 hover:bg-slate-100 text-slate-700 border border-transparent',
    loading: 'absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-white/80 backdrop-blur-xs rounded-2xl animate-fadeIn'
  },
  cascade: {
    container: 'bg-white rounded-2xl border border-slate-100 max-w-lg w-full shadow-2xl flex flex-col overflow-hidden text-left',
    header: 'p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 font-sans',
    tabs: 'flex border-b border-slate-100 bg-slate-50 p-1 gap-1 shrink-0 font-sans',
    tabActive: 'bg-white text-indigo-600 shadow-3xs border-slate-200',
    tabInactive: 'text-slate-400 border-transparent hover:text-slate-600',
    content: 'p-4 space-y-4 flex-1 overflow-y-auto max-h-[40vh] scrollbar-none',
    footer: 'p-3 bg-slate-50 border-t border-slate-100 flex gap-2 font-bold text-xs shrink-0 font-sans'
  },
  subStatus: {
    RASCUNHO: 'bg-slate-400 text-slate-400',
    AGUARDANDO_PAGAMENTO: 'bg-amber-400 text-amber-400',
    EM_ANALISE: 'bg-orange-400 text-orange-400',
    RECUSADO: 'bg-red-500 text-red-500',
    CONFIRMADO: 'bg-indigo-500 text-indigo-500',
    CHECK_IN: 'bg-cyan-500 text-cyan-500',
    EM_ESPERA: 'bg-blue-400 text-blue-400',
    EM_ANDAMENTO: 'bg-teal-500 text-teal-500',
    PAUSADO: 'bg-yellow-500 text-yellow-500',
    CONCLUIDO: 'bg-emerald-500 text-emerald-500',
    PARCIAL: 'bg-lime-500 text-lime-500',
    NAO_COMPARECEU: 'bg-purple-500 text-purple-500',
    REAGENDADO: 'bg-fuchsia-500 text-fuchsia-500'
  }
} as const;
