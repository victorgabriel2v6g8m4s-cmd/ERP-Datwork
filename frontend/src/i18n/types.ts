export interface AppTextDictionary {
  common: {
    nouns: {
      items: string;
    };
    actions: {
      cancel: string;
      confirm: string;
      update: string;
      back: string;
      close: string;
      attachFile: string;
      chooseImage: string;
      replaceCover: string;
      saveCurrentOrder: string;
    };
    status: {
      uploading: string;
      saving: string;
    };
  };
  uploads: {
    errors: {
      emptyImage: string;
      productThumbnailMaxSize: (maxSize: string) => string;
      unsupportedProductThumbnailFormat: string;
      productThumbnailUploadFailed: string;
    };
  };
  products: {
    validation: {
      skuRequired: string;
      nameRequired: string;
      indirectCostNonNegative: string;
      finalPriceNonNegative: string;
    };
    errors: {
      create: (message: string) => string;
      update: (message: string) => string;
      createFallback: string;
      updateFallback: string;
    };
    media: {
      coverLabel: string;
      coverAlt: string;
      galleryLabel: string;
    };
  };
  recipes: {
    page: {
      title: string;
      subtitle: string;
      activeKpi: string;
      averageBatchCostKpi: string;
      unitSuffix: string;
      emptyState: string;
      createActionTitle: string;
    };
    card: {
      reactivate: string;
      deactivate: string;
      inactiveBadge: string;
      batchCost: string;
      unitCost: string;
      yield: string;
    };
    statusDialog: {
      deactivateTitle: string;
      reactivateTitle: string;
      description: (productName: string) => string;
    };
    form: {
      createTitle: string;
      editTitle: string;
      productTarget: string;
      chooseProduct: string;
      unitsPerBatch: string;
      addComponent: string;
      ingredient: string;
      chooseIngredient: string;
      quantityUsed: string;
      quantityAdditional: string;
      draftStructure: string;
      savedStructure: string;
      emptyDraft: string;
      linkedProduct: string;
      linkageAndYield: string;
      modifyIngredients: string;
      batchCost: string;
      unitCost: string;
      saveCreate: string;
      saveEdit: string;
    };
    view: {
      subtitle: string;
      yieldLabel: string;
      servings: (value: number) => string;
      batchCost: string;
      unitCost: string;
      ingredientColumn: string;
      quantityColumn: string;
      unitColumn: string;
      fractionalCostColumn: string;
      emptyIngredients: string;
      close: string;
    };
    errors: {
      load: string;
      formOptions: string;
      create: (message: string) => string;
      update: (message: string) => string;
      createFallback: string;
      updateFallback: string;
      invalidResponse: string;
    };
  };
  pricing: {
    page: {
      title: string;
      subtitle: string;
      fixedCostKpi: string;
      variableExpensesKpi: string;
    };
    tabs: {
      settings: string;
      products: string;
      services: string;
    };
    settings: {
      loading: string;
      operationalLimits: string;
      maxProductionCap: string;
      maxProductionPlaceholder: string;
      abcMargins: string;
      marginCategory: (category: 'A' | 'B' | 'C') => string;
      saveAction: string;
      saveSuccess: string;
      saveError: string;
    };
    products: {
      loading: string;
      thumbnailFallback: string;
      abcCategory: (category: 'A' | 'B' | 'C') => string;
      columns: {
        item: string;
        unitCost: string;
        suggestedPrice: string;
        finalPrice: string;
        grossProfit: string;
        netProfit: string;
        includeFixedCosts: string;
      };
      fixedCostOptions: {
        default: string;
        yes: string;
        no: string;
      };
      sync: {
        saving: string;
        saved: string;
        error: string;
      };
    };
    services: {
      title: string;
      description: string;
    };
  };
  orderProfiles: {
    title: string;
    applyHint: string;
    empty: (contextLabel: string) => string;
    saveTitle: string;
    configurationName: (contextLabel: string) => string;
    savePlaceholder: string;
    renameTitle: string;
    newNameLabel: string;
  };
}
