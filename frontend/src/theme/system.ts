export const SYSTEM_THEME = {
  login: {
    shell: 'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-4 font-sans',
    form: 'w-full max-w-sm space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8',
    label: 'mb-1.5 block text-xs font-bold text-slate-200',
    input: 'w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm font-medium text-white transition-colors placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30',
    notice: 'rounded-xl border border-amber-400/25 bg-amber-300/10 p-3 text-xs font-semibold leading-relaxed text-amber-100',
    error: 'rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-200',
    submit: 'flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-[0.99]'
  },
  feedback: {
    shell: 'flex min-h-52 w-full items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-3xs',
    content: 'max-w-sm space-y-3',
    icon: 'mx-auto h-6 w-6 text-slate-400',
    spinner: 'mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent',
    title: 'text-sm font-black text-slate-800',
    description: 'text-xs font-medium leading-relaxed text-slate-500',
    retry: 'inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
  },
  navigation: {
    topTab: 'min-h-11 shrink-0 rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
    footerButton: 'relative flex min-h-12 flex-1 cursor-pointer flex-col items-center justify-center px-1 py-1 text-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400',
    moduleButton: 'flex min-h-12 w-full items-center justify-between rounded-xl border p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400',
    plannedModule: 'cursor-not-allowed border-slate-800 bg-slate-900/60 text-slate-500 opacity-80',
    availableModule: 'cursor-pointer border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
  },
  home: {
    shell: 'relative min-h-screen w-full bg-slate-50/50 pb-24 font-sans tracking-tight antialiased selection:bg-indigo-500/10',
    search: 'w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-xs font-bold text-slate-800 shadow-3xs transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm',
    moduleButton: 'flex min-h-16 w-full items-center justify-between rounded-xl border p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
    availableModule: 'cursor-pointer border-slate-200/60 bg-slate-50/40 hover:border-indigo-300 hover:bg-white',
    plannedModule: 'cursor-not-allowed border-slate-200 bg-slate-100/70 opacity-75'
  },
  visualEditor: {
    shell: 'min-h-screen bg-slate-950 text-slate-100',
    header: 'sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-md',
    workspace: 'grid min-h-[calc(100vh-73px)] grid-cols-1 gap-4 p-4 xl:grid-cols-[360px_minmax(0,1fr)]',
    panel: 'rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl',
    label: 'mb-1.5 block text-xs font-bold text-slate-300',
    input: 'min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/25',
    button: 'inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-slate-100 transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-40',
    primaryButton: 'inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-40',
    tab: 'min-h-11 rounded-xl px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400',
    previewFrame: 'h-[calc(100vh-190px)] min-h-[520px] w-full rounded-xl border-0 bg-white',
    status: 'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold',
    warning: 'rounded-xl border border-amber-400/30 bg-amber-300/10 p-3 text-xs font-bold leading-relaxed text-amber-100'
  },
  catalog: {
    shell: 'min-h-screen w-full bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/10',
    main: 'mx-auto mt-6 w-full space-y-4 px-4 sm:px-6',
    createFab: 'fixed bottom-20 right-4 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 sm:right-6'
  }
} as const;
