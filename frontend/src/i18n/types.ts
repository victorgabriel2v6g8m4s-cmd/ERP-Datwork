export interface AppTextDictionary {
  common: {
    nouns: {
      items: string;
    };
    actions: {
      cancel: string;
      confirm: string;
      update: string;
      attachFile: string;
      chooseImage: string;
      replaceCover: string;
      saveCurrentOrder: string;
    };
    status: {
      uploading: string;
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
