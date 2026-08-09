import type { AppTextDictionary } from '../types.ts';

export const PT_BR_TEXTS: AppTextDictionary = {
  common: {
    nouns: { items: 'Itens' },
    actions: {
      cancel: 'Cancelar', confirm: 'Confirmar', update: 'Atualizar', back: 'Voltar', close: 'Fechar',
      attachFile: 'Anexar Arquivo', chooseImage: 'Escolher Imagem', replaceCover: 'Substituir Capa', saveCurrentOrder: 'Salvar Ordem Atual'
    },
    status: { uploading: 'Enviando...', saving: 'Salvando...' },
    search: {
      filters: 'Filtros',
      sortCriterion: 'Critério de Ordenação',
      customOrder: 'Ordem customizada (Sua ordenação tátil)',
      alphabetical: 'Nome em ordem alfabética (A-Z)',
      recentDate: 'Data de cadastro (Mais recentes)',
      clearFilters: 'Limpar Filtros'
    }
  },
  uploads: {
    errors: {
      emptyImage: 'O arquivo de imagem está vazio.',
      productThumbnailMaxSize: (maxSize) => `A imagem de capa deve ter no máximo ${maxSize}.`,
      unsupportedProductThumbnailFormat: 'Formato não permitido. Use JPG, PNG ou WEBP.',
      productThumbnailUploadFailed: 'Não foi possível enviar a imagem de capa.'
    }
  },
  products: {
    validation: {
      skuRequired: 'Informe o SKU do produto.', nameRequired: 'Informe o nome do produto.',
      indirectCostNonNegative: 'O custo indireto deve ser um número maior ou igual a zero.',
      finalPriceNonNegative: 'O preço final deve ser um número maior ou igual a zero.'
    },
    errors: {
      create: (message) => `Erro: ${message}`, update: (message) => `Erro ao atualizar: ${message}`,
      createFallback: 'Falha ao salvar produto.', updateFallback: 'Falha na rede.'
    },
    media: { coverLabel: 'Imagem de Capa Principal', coverAlt: 'Capa', galleryLabel: 'Galeria de Fotos & Documentos Técnicos' }
  },
  recipes: {
    page: {
      title: 'Fichas Técnicas', subtitle: 'Engenharia de Insumos & Estruturação de Lotes', activeKpi: 'Fichas Ativas',
      averageBatchCostKpi: 'Custo Médio Lote', unitSuffix: 'un.', emptyState: 'Nenhuma receita vinculada com os critérios fornecidos.',
      createActionTitle: 'Cadastrar Nova Ficha Técnica'
    },
    card: { reactivate: 'Reativar Receita', deactivate: 'Desativar Receita', inactiveBadge: 'INATIVA', batchCost: 'Custo do Lote:', unitCost: 'Por Porção:', yield: 'Rendimento:' },
    statusDialog: {
      deactivateTitle: 'Deseja desativar esta receita?', reactivateTitle: 'Deseja reativar esta receita?',
      description: (productName) => `Esta ação alterará o status operacional da ficha técnica do produto “${productName}”.`
    },
    form: {
      createTitle: 'Nova Ficha Técnica', editTitle: 'Editar Engenharia', productTarget: 'Produto Alvo', chooseProduct: 'Escolha um produto...',
      unitsPerBatch: 'Qtd por Lote', addComponent: 'Inserir Componente Fracionado', ingredient: 'Matéria-Prima / Insumo', chooseIngredient: 'Escolha...',
      quantityUsed: 'Qtd. Usada', quantityAdditional: 'Qtd. Adicional', draftStructure: 'Estrutura de Insumos da Receita', savedStructure: 'Estrutura de Insumos Salva',
      emptyDraft: 'Adicione insumos acima para compor a receita.', linkedProduct: 'Produto Vinculado', linkageAndYield: 'Vinculação & Rendimento do Lote',
      modifyIngredients: 'Modificar Estrutura de Insumos', batchCost: 'Custo Total Lote', unitCost: 'Custo por Porção', saveCreate: 'Salvar Engenharia', saveEdit: 'Salvar Alterações'
    },
    view: {
      subtitle: 'Ficha Técnica & Composição Fracionada', yieldLabel: 'Rendimento Lote', servings: (value) => `${value} porções`,
      batchCost: 'Custo Total Lote', unitCost: 'Custo por Porção', ingredientColumn: 'Item (Insumo)', quantityColumn: 'Quantidade',
      unitColumn: 'Medida', fractionalCostColumn: 'Custo Fracionado', emptyIngredients: 'Nenhum insumo associado a esta receita.', close: 'Fechar Ficha Técnica'
    },
    errors: {
      load: 'Não foi possível carregar as fichas técnicas.', formOptions: 'Não foi possível carregar produtos e insumos para o formulário.',
      create: (message) => `Erro: ${message}`, update: (message) => `Erro ao atualizar: ${message}`, createFallback: 'Falha ao salvar a ficha técnica.',
      updateFallback: 'Falha ao atualizar a ficha técnica.', invalidResponse: 'O servidor retornou uma ficha técnica em formato inválido.'
    }
  },
  pricing: {
    page: { title: 'Precificação Inteligente', subtitle: 'Simulador de Markup & Lucratividade Real', fixedCostKpi: 'Rateio Fixo Un.', variableExpensesKpi: 'Desp. Variáveis' },
    tabs: { settings: 'Ajustes', products: 'Produtos', services: 'Serviços' },
    settings: {
      loading: 'Carregando parâmetros...', operationalLimits: 'Limites Operacionais', maxProductionCap: 'Capacidade Máxima de Produção (Lotes/Mês)',
      maxProductionPlaceholder: 'Ex: 1500', abcMargins: 'Margem Bruta Alvo por Curva ABC (Lucro Desejado)', marginCategory: (category) => `Margem Categoria ${category} *`,
      saveAction: 'Salvar Parâmetros', saveSuccess: 'Parâmetros atualizados e preços recalculados.', saveError: 'Não foi possível salvar os parâmetros.'
    },
    products: {
      loading: 'Lendo tabelas do banco...', thumbnailFallback: 'PROD', abcCategory: (category) => `Curva ${category}`,
      columns: { item: 'Item / Estrutura Comercial', unitCost: 'Preço Custo Un.', suggestedPrice: 'Preço Sugerido', finalPrice: 'Preço Definitivo', grossProfit: 'Lucro Bruto', netProfit: 'Lucro Líquido', includeFixedCosts: 'Incluir Custo Fixo' },
      fixedCostOptions: { default: 'Padrão', yes: 'Sim', no: 'Não' },
      sync: { saving: 'Gravando e recalculando no servidor...', saved: 'Preços e lucros consolidados no banco', error: 'Falha ao sincronizar. Os dados foram recarregados.' }
    },
    services: { title: 'Precificação de Mão de Obra', description: 'Estrutura preparada para receber o módulo de serviços.' }
  },
  expenses: {
    page: {
      title: 'Despesas Operacionais', subtitle: 'Centro de Custo & Margens de Planejamento', fixedCostKpi: 'Rateio Fixo Un.', variableExpensesKpi: 'Desp. Variáveis',
      totalTab: (value) => `Total Aba: ${value}`, loading: 'Carregando centro de custos...', emptyState: 'Nenhuma despesa ativa vinculada a esta categoria.'
    },
    tabs: { fixed: 'Custos Fixos', variable: 'Despesas Variáveis' },
    search: { placeholder: 'Buscar despesa pelo nome...' },
    columns: { name: 'Nome da Despesa / Canal', value: 'Valor Bruto', valueType: 'Tipo de Entrada', representation: 'Representação (%)', actions: 'Ações' },
    fields: { namePlaceholder: 'Nome da despesa...', valuePlaceholder: '0.00', literal: 'Literal (R$)', percent: 'Porcentagem (%)' },
    sync: { saving: 'Gravando...', saved: 'Sincronizado', error: 'Falha na sincronização' },
    actions: { history: 'Histórico', historyTitle: 'Abrir histórico de auditoria', delete: 'Excluir', deleteTitle: 'Excluir despesa' },
    history: {
      title: 'Versões da Planilha', subtitle: 'Logs Cronológicos Retroativos', loading: 'Carregando logs de auditoria...', empty: 'Nenhum histórico gerado ainda.',
      versionLabel: (version) => `Backup V${version}`, restoreTitle: 'Restaurar esta versão'
    },
    errors: {
      load: 'Não foi possível carregar o centro de custos.', save: 'Não foi possível salvar as despesas.', delete: 'Não foi possível excluir a despesa.',
      history: 'Não foi possível carregar o histórico de despesas.', restore: 'Não foi possível restaurar a versão selecionada.',
      invalidResponse: 'O servidor retornou dados de despesas em formato inválido.'
    }
  },
  agenda: {
    page: {
      title: 'Agenda & Horários',
      subtitle: 'Grade Operacional e Fluxo de Atendimentos',
      totalKpi: 'Total Agendados',
      pendingKpi: 'Pendentes',
      completedKpi: 'Realizados',
      canceledKpi: 'Cancelados',
      serviceSuffix: 'serv.',
      unitSuffix: 'un.',
      loading: 'Carregando agenda...',
      emptyState: 'Nenhum agendamento localizado nesta fila.'
    },
    filters: {
      searchPlaceholder: 'Pesquisar por agendamento...',
      calendarAction: 'Ver Calendário',
      statusAll: 'Qualquer Status',
      pending: 'Agendados',
      completed: 'Realizados',
      canceled: 'Cancelados',
      dateAll: 'Todas as Datas',
      today: 'Hoje',
      week: 'Esta Semana',
      month: 'Este Mês',
      custom: 'Personalizado',
      chronologicalSort: 'Data e horário (Mais próximos)'
    },
    status: { PENDING: 'Agendado', COMPLETED: 'Realizado', CANCELED: 'Cancelado' },
    swipe: { completed: 'Realizado', cancel: 'Desmarcar' },
    subStatus: {
      fieldLabel: 'Sub-status do Atendimento',
      groups: {
        INITIAL_PAYMENT: 'Iniciais e Pagamento',
        EXECUTION: 'Confirmação e Execução',
        FINAL_EXCEPTION: 'Finais e Exceção'
      },
      options: {
        RASCUNHO: 'Rascunho', AGUARDANDO_PAGAMENTO: 'Aguardando Pagamento', EM_ANALISE: 'Em Análise', RECUSADO: 'Recusado',
        CONFIRMADO: 'Confirmado', CHECK_IN: 'Check-In', EM_ESPERA: 'Em Espera', EM_ANDAMENTO: 'Em Andamento', PAUSADO: 'Pausado',
        CONCLUIDO: 'Concluído', PARCIAL: 'Parcial', NAO_COMPARECEU: 'Não Compareceu', REAGENDADO: 'Reagendado'
      }
    },
    wizard: {
      title: 'Criar Novo Agendamento',
      stepLabels: ['Etapa 1: Dados do Agendamento', 'Etapa 2: Cadastro do Cliente', 'Etapa 3: Anexar Mídias', 'Etapa 4: Lançamento Financeiro'],
      nameLabel: 'Nome do Agendamento *',
      namePlaceholder: 'Ex: Consultoria de Negócios',
      dateLabel: 'Data Agendada *',
      timeLabel: 'Horário *',
      notesLabel: 'Observações da Tarefa',
      notesPlaceholder: 'Insira notas explicativas...',
      customerHint: 'Preencha os dados ou clique em “Pular Etapa” para avançar.',
      mediaHint: 'Anexe mídias a este agendamento ou clique em “Pular Etapa”.',
      financialHint: 'Lance receitas ou despesas vinculadas ou clique em “Concluir Agendamento”.',
      next: 'Próximo',
      skip: 'Pular Etapa',
      advance: 'Avançar',
      finish: 'Concluir Agendamento'
    },
    edit: {
      title: 'Editar Agendamento',
      nameLabel: 'Nome do Agendamento',
      dateLabel: 'Data Agendada',
      timeLabel: 'Horário',
      notesLabel: 'Observações da Tarefa',
      notesPlaceholder: 'Adicione detalhes, notas ou observações...',
      mediaHeading: (count) => `Mídias e Anexos (${count})`,
      save: 'Salvar Alterações'
    },
    view: {
      timeLabel: 'Horário',
      dateLabel: 'Data',
      subStatusLabel: 'Sub-status Operacional',
      notesLabel: 'Observações da Tarefa'
    },
    confirm: {
      cancelTitle: 'Deseja desmarcar este item?',
      cancelDescription: 'O agendamento será cancelado.'
    },
    calendar: {
      back: 'Voltar',
      rangeAction: 'Agendamentos neste Período',
      loading: 'Sincronizando Linha do Tempo...',
      months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      weekHeaders: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    },
    cascade: {
      title: 'Reagendamento em Cascata',
      movedPosition: (position) => `Item movido para posição #${position}`,
      postponeTab: 'Adiar (Posteriores)',
      advanceTab: 'Adiantar (Anteriores)',
      intervalHint: 'Clique para definir o intervalo afetado:',
      originalTime: (time) => `Horário original: ${time}`,
      empty: 'Nenhum agendamento pendente nesta seção.',
      keep: 'Manter Inalterado',
      submit: (count) => `Reagendar Selecionados (${count})`,
      offsetLabel: 'Valor do Deslocamento',
      timeUnitLabel: 'Grandeza Temporal',
      units: { MINUTES: 'Minutos', HOURS: 'Horas', DAYS: 'Dias', WEEKS: 'Semanas', MONTHS: 'Meses' }
    },
    errors: {
      load: 'Não foi possível carregar a agenda.',
      create: 'Não foi possível criar o agendamento.',
      update: 'Não foi possível atualizar o agendamento.',
      status: 'Não foi possível atualizar o status do agendamento.',
      subStatus: 'Não foi possível atualizar o sub-status do agendamento.',
      cascade: 'Não foi possível concluir o reagendamento em cascata.',
      invalidResponse: 'O servidor retornou dados de agendamento em formato inválido.'
    }
  },
  orderProfiles: {
    title: 'Perfis de Ordenação Customizados', applyHint: 'Clique para aplicar. Botão direito ou segure para renomear.',
    empty: (contextLabel) => `Nenhum perfil de ordenação salvo para estes ${contextLabel}.`, saveTitle: 'Salvar Perfil de Ordenação',
    configurationName: (contextLabel) => `Nome da Configuração de ${contextLabel}`, savePlaceholder: 'Ex: Layout de Maior Giro',
    renameTitle: 'Renomear Configuração', newNameLabel: 'Novo Nome da Fila'
  }
};
