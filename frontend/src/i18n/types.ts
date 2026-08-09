export interface AppTextDictionary {
  common: {
    nouns: { items: string };
    actions: {
      cancel: string; confirm: string; update: string; back: string; close: string;
      attachFile: string; chooseImage: string; replaceCover: string; saveCurrentOrder: string;
    };
    status: { uploading: string; saving: string };
    search: {
      filters: string;
      sortCriterion: string;
      customOrder: string;
      alphabetical: string;
      recentDate: string;
      clearFilters: string;
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
    validation: { skuRequired: string; nameRequired: string; indirectCostNonNegative: string; finalPriceNonNegative: string };
    errors: { create: (message: string) => string; update: (message: string) => string; createFallback: string; updateFallback: string };
    media: { coverLabel: string; coverAlt: string; galleryLabel: string };
  };
  recipes: {
    page: { title: string; subtitle: string; activeKpi: string; averageBatchCostKpi: string; unitSuffix: string; emptyState: string; createActionTitle: string };
    card: { reactivate: string; deactivate: string; inactiveBadge: string; batchCost: string; unitCost: string; yield: string };
    statusDialog: { deactivateTitle: string; reactivateTitle: string; description: (productName: string) => string };
    form: {
      createTitle: string; editTitle: string; productTarget: string; chooseProduct: string; unitsPerBatch: string;
      addComponent: string; ingredient: string; chooseIngredient: string; quantityUsed: string; quantityAdditional: string;
      draftStructure: string; savedStructure: string; emptyDraft: string; linkedProduct: string; linkageAndYield: string;
      modifyIngredients: string; batchCost: string; unitCost: string; saveCreate: string; saveEdit: string;
    };
    view: {
      subtitle: string; yieldLabel: string; servings: (value: number) => string; batchCost: string; unitCost: string;
      ingredientColumn: string; quantityColumn: string; unitColumn: string; fractionalCostColumn: string; emptyIngredients: string; close: string;
    };
    errors: {
      load: string; formOptions: string; create: (message: string) => string; update: (message: string) => string;
      createFallback: string; updateFallback: string; invalidResponse: string;
    };
  };
  pricing: {
    page: { title: string; subtitle: string; fixedCostKpi: string; variableExpensesKpi: string };
    tabs: { settings: string; products: string; services: string };
    settings: {
      loading: string; operationalLimits: string; maxProductionCap: string; maxProductionPlaceholder: string;
      abcMargins: string; marginCategory: (category: 'A' | 'B' | 'C') => string; saveAction: string; saveSuccess: string; saveError: string;
    };
    products: {
      loading: string; thumbnailFallback: string; abcCategory: (category: 'A' | 'B' | 'C') => string;
      columns: { item: string; unitCost: string; suggestedPrice: string; finalPrice: string; grossProfit: string; netProfit: string; includeFixedCosts: string };
      fixedCostOptions: { default: string; yes: string; no: string };
      sync: { saving: string; saved: string; error: string };
    };
    services: { title: string; description: string };
  };
  expenses: {
    page: { title: string; subtitle: string; fixedCostKpi: string; variableExpensesKpi: string; totalTab: (value: string) => string; loading: string; emptyState: string };
    tabs: { fixed: string; variable: string };
    search: { placeholder: string };
    columns: { name: string; value: string; valueType: string; representation: string; actions: string };
    fields: { namePlaceholder: string; valuePlaceholder: string; literal: string; percent: string };
    sync: { saving: string; saved: string; error: string };
    actions: { history: string; historyTitle: string; delete: string; deleteTitle: string };
    history: {
      title: string; subtitle: string; loading: string; empty: string;
      versionLabel: (version: number) => string; restoreTitle: string;
    };
    errors: { load: string; save: string; delete: string; history: string; restore: string; invalidResponse: string };
  };
  agenda: {
    page: {
      title: string; subtitle: string; totalKpi: string; pendingKpi: string; completedKpi: string; canceledKpi: string;
      serviceSuffix: string; unitSuffix: string; loading: string; emptyState: string;
    };
    filters: {
      searchPlaceholder: string; calendarAction: string; statusAll: string; pending: string; completed: string; canceled: string;
      dateAll: string; today: string; week: string; month: string; custom: string; chronologicalSort: string;
    };
    status: { PENDING: string; COMPLETED: string; CANCELED: string };
    swipe: { completed: string; cancel: string };
    subStatus: {
      fieldLabel: string;
      groups: { INITIAL_PAYMENT: string; EXECUTION: string; FINAL_EXCEPTION: string };
      options: {
        RASCUNHO: string; AGUARDANDO_PAGAMENTO: string; EM_ANALISE: string; RECUSADO: string; CONFIRMADO: string;
        CHECK_IN: string; EM_ESPERA: string; EM_ANDAMENTO: string; PAUSADO: string; CONCLUIDO: string;
        PARCIAL: string; NAO_COMPARECEU: string; REAGENDADO: string;
      };
    };
    wizard: {
      title: string; stepLabels: string[]; nameLabel: string; namePlaceholder: string; dateLabel: string; timeLabel: string;
      notesLabel: string; notesPlaceholder: string; customerHint: string; mediaHint: string; financialHint: string;
      next: string; skip: string; advance: string; finish: string;
    };
    edit: {
      title: string; nameLabel: string; dateLabel: string; timeLabel: string; notesLabel: string; notesPlaceholder: string;
      mediaHeading: (count: number) => string; save: string;
    };
    view: { timeLabel: string; dateLabel: string; subStatusLabel: string; notesLabel: string };
    confirm: { cancelTitle: string; cancelDescription: string };
    calendar: {
      back: string; rangeAction: string; loading: string; months: string[]; weekHeaders: string[];
    };
    cascade: {
      title: string; movedPosition: (position: number) => string; postponeTab: string; advanceTab: string;
      intervalHint: string; originalTime: (time: string) => string; empty: string; keep: string; submit: (count: number) => string;
      offsetLabel: string; timeUnitLabel: string;
      units: { MINUTES: string; HOURS: string; DAYS: string; WEEKS: string; MONTHS: string };
    };
    errors: {
      load: string; create: string; update: string; status: string; subStatus: string; cascade: string; invalidResponse: string;
    };
  };
  orderProfiles: {
    title: string; applyHint: string; empty: (contextLabel: string) => string; saveTitle: string;
    configurationName: (contextLabel: string) => string; savePlaceholder: string; renameTitle: string; newNameLabel: string;
  };
}
