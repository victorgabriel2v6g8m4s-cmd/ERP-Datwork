const BYTES_PER_MEGABYTE = 1024 * 1024;

const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL?.trim();

export const APP_CONFIG = {
  locale: 'pt-BR',
  api: {
    baseUrl: configuredApiBaseUrl || 'http://localhost:3333',
    endpoints: {
      uploads: {
        products: '/products/upload',
        appointments: '/appointments/upload'
      },
      pricing: {
        products: '/pricing/products',
        settings: '/settings'
      },
      expenses: {
        overview: '/expenses',
        versions: '/expenses/versions',
        status: (id: string) => `/expenses/${encodeURIComponent(id)}/status`,
        restoreVersion: (versionId: string) => `/expenses/versions/${encodeURIComponent(versionId)}/restore`
      }
    }
  },
  uploads: {
    productThumbnail: {
      maxSizeBytes: 5 * BYTES_PER_MEGABYTE,
      acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
      acceptAttribute: 'image/jpeg,image/png,image/webp'
    }
  },
  products: {
    defaults: {
      brand: 'Sem Marca',
      abcCategory: 'C',
      includeFixedCosts: 'DEFAULT',
      unitsPerBatch: 1
    }
  },
  recipes: {
    defaults: {
      unitsPerBatch: 1
    },
    limits: {
      minUnitsPerBatch: 1,
      minIngredientQuantity: 0
    },
    interactions: {
      swipeActionThresholdPx: 80,
      swipeDragLimitPx: 120
    }
  },
  pricing: {
    limits: {
      minProductionCap: 1,
      minMarginPercent: 0,
      maxMarginPercent: 100,
      minFinalPrice: 0
    },
    interactions: {
      productSaveDebounceMs: 800
    }
  },
  expenses: {
    defaults: {
      category: 'FIXED',
      valueType: 'LITERAL'
    },
    limits: {
      minValue: 0
    },
    interactions: {
      autosaveDebounceMs: 800
    },
    routes: {
      fixed: '/despesas/custos-fixos',
      variable: '/despesas/variaveis'
    }
  }
} as const;

export type AppLocale = typeof APP_CONFIG.locale;

export function formatMegabytes(bytes: number): string {
  const megabytes = bytes / BYTES_PER_MEGABYTE;
  const normalized = Number.isInteger(megabytes) ? String(megabytes) : megabytes.toFixed(1);
  return `${normalized} MB`;
}
