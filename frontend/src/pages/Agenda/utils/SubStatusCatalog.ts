// 🎨 DICIONÁRIO DE SUB-STATUS DO ERP (NÃO-POLUÍDO, FOCO EM ALTA NITIDEZ COMERCIAL)
export const SUB_STATUS_CATALOG: Record<string, { label: string; colorClass: string }> = {
  RASCUNHO: { label: 'Rascunho', colorClass: 'bg-slate-400 text-slate-400' },
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pagamento', colorClass: 'bg-amber-400 text-amber-400' },
  EM_ANALISE: { label: 'Em Análise', colorClass: 'bg-orange-400 text-orange-400' },
  RECUSADO: { label: 'Recusado', colorClass: 'bg-red-500 text-red-500' },
  CONFIRMADO: { label: 'Confirmado', colorClass: 'bg-indigo-500 text-indigo-500' },
  CHECK_IN: { label: 'Check-In', colorClass: 'bg-cyan-500 text-cyan-500' },
  EM_ESPERA: { label: 'Em Espera', colorClass: 'bg-blue-400 text-blue-400' },
  EM_ANDAMENTO: { label: 'Em Andamento', colorClass: 'bg-teal-500 text-teal-500' },
  PAUSADO: { label: 'Pausado', colorClass: 'bg-yellow-500 text-yellow-500' },
  CONCLUIDO: { label: 'Concluído', colorClass: 'bg-emerald-500 text-emerald-500' },
  PARCIAL: { label: 'Parcial', colorClass: 'bg-lime-500 text-lime-500' },
  NAO_COMPARECEU: { label: 'Não Compareceu', colorClass: 'bg-purple-500 text-purple-500' },
  REAGENDADO: { label: 'Reagendado', colorClass: 'bg-fuchsia-500 text-fuchsia-500' }
};
