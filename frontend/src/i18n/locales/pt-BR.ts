import type { AppTextDictionary } from '../types.ts';

export const PT_BR_TEXTS: AppTextDictionary = {
  common: {
    nouns: {
      items: 'Itens'
    },
    actions: {
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      update: 'Atualizar',
      back: 'Voltar',
      close: 'Fechar',
      attachFile: 'Anexar Arquivo',
      chooseImage: 'Escolher Imagem',
      replaceCover: 'Substituir Capa',
      saveCurrentOrder: 'Salvar Ordem Atual'
    },
    status: {
      uploading: 'Enviando...',
      saving: 'Salvando...'
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
      skuRequired: 'Informe o SKU do produto.',
      nameRequired: 'Informe o nome do produto.',
      indirectCostNonNegative: 'O custo indireto deve ser um número maior ou igual a zero.',
      finalPriceNonNegative: 'O preço final deve ser um número maior ou igual a zero.'
    },
    errors: {
      create: (message) => `Erro: ${message}`,
      update: (message) => `Erro ao atualizar: ${message}`,
      createFallback: 'Falha ao salvar produto.',
      updateFallback: 'Falha na rede.'
    },
    media: {
      coverLabel: 'Imagem de Capa Principal',
      coverAlt: 'Capa',
      galleryLabel: 'Galeria de Fotos & Documentos Técnicos'
    }
  },
  recipes: {
    page: {
      title: 'Fichas Técnicas',
      subtitle: 'Engenharia de Insumos & Estruturação de Lotes',
      activeKpi: 'Fichas Ativas',
      averageBatchCostKpi: 'Custo Médio Lote',
      unitSuffix: 'un.',
      emptyState: 'Nenhuma receita vinculada com os critérios fornecidos.',
      createActionTitle: 'Cadastrar Nova Ficha Técnica'
    },
    card: {
      reactivate: 'Reativar Receita',
      deactivate: 'Desativar Receita',
      inactiveBadge: 'INATIVA',
      batchCost: 'Custo do Lote:',
      unitCost: 'Por Porção:',
      yield: 'Rendimento:'
    },
    statusDialog: {
      deactivateTitle: 'Deseja desativar esta receita?',
      reactivateTitle: 'Deseja reativar esta receita?',
      description: (productName) => `Esta ação alterará o status operacional da ficha técnica do produto “${productName}”.`
    },
    form: {
      createTitle: 'Nova Ficha Técnica',
      editTitle: 'Editar Engenharia',
      productTarget: 'Produto Alvo',
      chooseProduct: 'Escolha um produto...',
      unitsPerBatch: 'Qtd por Lote',
      addComponent: 'Inserir Componente Fracionado',
      ingredient: 'Matéria-Prima / Insumo',
      chooseIngredient: 'Escolha...',
      quantityUsed: 'Qtd. Usada',
      quantityAdditional: 'Qtd. Adicional',
      draftStructure: 'Estrutura de Insumos da Receita',
      savedStructure: 'Estrutura de Insumos Salva',
      emptyDraft: 'Adicione insumos acima para compor a receita.',
      linkedProduct: 'Produto Vinculado',
      linkageAndYield: 'Vinculação & Rendimento do Lote',
      modifyIngredients: 'Modificar Estrutura de Insumos',
      batchCost: 'Custo Total Lote',
      unitCost: 'Custo por Porção',
      saveCreate: 'Salvar Engenharia',
      saveEdit: 'Salvar Alterações'
    },
    view: {
      subtitle: 'Ficha Técnica & Composição Fracionada',
      yieldLabel: 'Rendimento Lote',
      servings: (value) => `${value} porções`,
      batchCost: 'Custo Total Lote',
      unitCost: 'Custo por Porção',
      ingredientColumn: 'Item (Insumo)',
      quantityColumn: 'Quantidade',
      unitColumn: 'Medida',
      fractionalCostColumn: 'Custo Fracionado',
      emptyIngredients: 'Nenhum insumo associado a esta receita.',
      close: 'Fechar Ficha Técnica'
    },
    errors: {
      load: 'Não foi possível carregar as fichas técnicas.',
      formOptions: 'Não foi possível carregar produtos e insumos para o formulário.',
      create: (message) => `Erro: ${message}`,
      update: (message) => `Erro ao atualizar: ${message}`,
      createFallback: 'Falha ao salvar a ficha técnica.',
      updateFallback: 'Falha ao atualizar a ficha técnica.',
      invalidResponse: 'O servidor retornou uma ficha técnica em formato inválido.'
    }
  },
  pricing: {
    page: {
      title: 'Precificação Inteligente',
      subtitle: 'Simulador de Markup & Lucratividade Real',
      fixedCostKpi: 'Rateio Fixo Un.',
      variableExpensesKpi: 'Desp. Variáveis'
    },
    tabs: {
      settings: 'Ajustes',
      products: 'Produtos',
      services: 'Serviços'
    },
    settings: {
      loading: 'Carregando parâmetros...',
      operationalLimits: 'Limites Operacionais',
      maxProductionCap: 'Capacidade Máxima de Produção (Lotes/Mês)',
      maxProductionPlaceholder: 'Ex: 1500',
      abcMargins: 'Margem Bruta Alvo por Curva ABC (Lucro Desejado)',
      marginCategory: (category) => `Margem Categoria ${category} *`,
      saveAction: 'Salvar Parâmetros',
      saveSuccess: 'Parâmetros atualizados e preços recalculados.',
      saveError: 'Não foi possível salvar os parâmetros.'
    },
    products: {
      loading: 'Lendo tabelas do banco...',
      thumbnailFallback: 'PROD',
      abcCategory: (category) => `Curva ${category}`,
      columns: {
        item: 'Item / Estrutura Comercial',
        unitCost: 'Preço Custo Un.',
        suggestedPrice: 'Preço Sugerido',
        finalPrice: 'Preço Definitivo',
        grossProfit: 'Lucro Bruto',
        netProfit: 'Lucro Líquido',
        includeFixedCosts: 'Incluir Custo Fixo'
      },
      fixedCostOptions: {
        default: 'Padrão',
        yes: 'Sim',
        no: 'Não'
      },
      sync: {
        saving: 'Gravando e recalculando no servidor...',
        saved: 'Preços e lucros consolidados no banco',
        error: 'Falha ao sincronizar. Os dados foram recarregados.'
      }
    },
    services: {
      title: 'Precificação de Mão de Obra',
      description: 'Estrutura preparada para receber o módulo de serviços.'
    }
  },
  orderProfiles: {
    title: 'Perfis de Ordenação Customizados',
    applyHint: 'Clique para aplicar. Botão direito ou segure para renomear.',
    empty: (contextLabel) => `Nenhum perfil de ordenação salvo para estes ${contextLabel}.`,
    saveTitle: 'Salvar Perfil de Ordenação',
    configurationName: (contextLabel) => `Nome da Configuração de ${contextLabel}`,
    savePlaceholder: 'Ex: Layout de Maior Giro',
    renameTitle: 'Renomear Configuração',
    newNameLabel: 'Novo Nome da Fila'
  }
};
