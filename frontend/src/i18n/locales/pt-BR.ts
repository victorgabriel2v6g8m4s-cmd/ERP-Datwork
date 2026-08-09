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
      attachFile: 'Anexar Arquivo',
      chooseImage: 'Escolher Imagem',
      replaceCover: 'Substituir Capa',
      saveCurrentOrder: 'Salvar Ordem Atual'
    },
    status: {
      uploading: 'Enviando...'
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
