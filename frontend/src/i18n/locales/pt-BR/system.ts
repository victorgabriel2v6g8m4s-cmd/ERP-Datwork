export const PT_BR_SYSTEM_TEXTS = {
  login: {
    title: 'ERP Datwork',
    subtitle: 'Ambiente local de desenvolvimento',
    demoNotice: 'Este formulário ainda não autentica usuários. Não use credenciais reais.',
    usernameLabel: 'Usuário ou e-mail de demonstração',
    usernamePlaceholder: 'Informe uma identificação fictícia',
    passwordLabel: 'Senha de demonstração',
    passwordPlaceholder: 'Use apenas uma senha fictícia',
    requiredFields: 'Preencha os dois campos com dados fictícios para abrir a demonstração.',
    submit: 'Abrir modo de demonstração'
  },
  navigation: {
    groups: {
      home: { label: 'Início', title: 'Início', subtitle: 'Acesso ao mapa do ERP' },
      engineering: { label: 'Engenharia', title: 'Engenharia & Precificação', subtitle: 'Estruturação de custos, insumos e margens reais' },
      supply: { label: 'Estoque', title: 'Suprimentos & Estoque', subtitle: 'Gestão de inventário e matérias-primas' },
      finance: { label: 'Finanças', title: 'Finanças & Relatórios', subtitle: 'Demonstrativos e indicadores de desempenho' },
      operation: { label: 'Operação', title: 'Operação & Atendimento', subtitle: 'Agenda e execução operacional' }
    },
    modules: {
      home: { name: 'Início', description: 'Mapa dos módulos do sistema' },
      products: { name: 'Catálogo de Produtos', description: 'Preços de venda e margens comerciais' },
      recipes: { name: 'Fichas Técnicas', description: 'Composição de insumos por lote e rendimentos' },
      expenses: { name: 'Despesas Operacionais', description: 'Custos fixos e variáveis da operação' },
      pricing: { name: 'Precificação Inteligente', description: 'Simulação de preços, markup e lucro' },
      ingredients: { name: 'Cadastro de Insumos', description: 'Matérias-primas e histórico de preços' },
      inventory: { name: 'Controle de Estoque', description: 'Inventário e alertas de disponibilidade' },
      dashboard: { name: 'Dashboard Geral', description: 'Indicadores e métricas de desempenho' },
      dre: { name: 'DRE Anual', description: 'Demonstrativo de resultado do exercício' },
      agenda: { name: 'Agenda & Horários', description: 'Grade operacional de agendamentos' }
    },
    openGroup: (group: string) => `Abrir módulos de ${group}`,
    closeGroup: 'Fechar menu de módulos',
    groupDialog: (group: string) => `Módulos de ${group}`,
    plannedBadge: 'Em breve',
    topTabsLabel: 'Navegação de engenharia e precificação',
    primaryNavigationLabel: 'Navegação principal do ERP',
    highlights: 'Destaques do sistema',
    previousHighlight: 'Destaque anterior',
    nextHighlight: 'Próximo destaque',
    assistedNavigation: 'Navegação por área',
    moduleSearchLabel: 'Pesquisar módulos',
    moduleSearchPlaceholder: 'Procurar um módulo ou tela do sistema...',
    filteredModules: 'Módulos encontrados',
    moduleMap: 'Mapa de módulos',
    noSearchResults: 'Nenhum módulo corresponde à pesquisa.'
  },
  feedback: {
    loading: 'Carregando dados...',
    errorTitle: 'Não foi possível carregar os dados',
    retry: 'Tentar novamente',
    emptyTitle: 'Nenhum item encontrado',
    emptyDescription: 'Cadastre um item ou ajuste os filtros para começar.',
    moduleUnavailableDescription: 'Esta área ainda não está implementada e não executa operações reais.',
    backToHome: 'Voltar ao mapa de módulos',
    productsLoadError: 'Não foi possível carregar o catálogo de produtos.',
    recipesLoadError: 'Não foi possível carregar as fichas técnicas.',
    ingredientsLoadError: 'Não foi possível carregar os insumos.'
  },
  products: {
    title: 'Gestão de Produtos',
    subtitle: 'Catálogo comercial e engenharia de produtos',
    activeItems: 'Itens ativos',
    unitSuffix: 'un.',
    gridSettings: 'Configurações de exibição da grade',
    createAction: 'Cadastrar novo produto',
    searchPlaceholder: 'Pesquisar por SKU, nome ou marca do produto...',
    emptyTitle: 'Nenhum produto encontrado',
    emptyDescription: 'Cadastre um produto ou ajuste os filtros da pesquisa.'
  }
} as const;
