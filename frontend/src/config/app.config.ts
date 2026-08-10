const BYTES_PER_MEGABYTE = 1024 * 1024;

const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL?.trim();

export const APP_CONFIG = {
  locale: 'pt-BR',
  api: {
    baseUrl: configuredApiBaseUrl || 'http://localhost:3333',
    endpoints: {
      uploads: {
        products: '/products/upload',
        ingredients: '/ingredients/upload',
        appointments: '/appointments/upload'
      },
      ingredients: {
        catalog: '/ingredients',
        item: (id: string) => `/ingredients/${encodeURIComponent(id)}`,
        status: (id: string) => `/ingredients/${encodeURIComponent(id)}/status`,
        reorder: '/ingredients/reorder',
        versions: (id: string) => `/ingredients/${encodeURIComponent(id)}/versions`,
        orderProfiles: '/ingredients/orders',
        orderProfile: (id: string) => `/ingredients/orders/${encodeURIComponent(id)}`
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
      },
      agenda: {
        appointments: '/appointments',
        appointment: (id: string) => `/appointments/${encodeURIComponent(id)}`,
        status: (id: string) => `/appointments/${encodeURIComponent(id)}/status`,
        subStatus: (id: string) => `/appointments/${encodeURIComponent(id)}/sub-status`,
        cascadeReschedule: '/appointments/cascade-reschedule'
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
  ingredients: {
    defaults: {
      unit: 'Unidades'
    },
    units: ['Unidades', 'Gramas', 'Quilos', 'MLs', 'Centímetros', 'Metros'] as const,
    limits: {
      minPrice: 0,
      minQuantity: 0.01
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
  },
  agenda: {
    defaults: {
      subStatus: 'CONFIRMADO',
      documentType: 'CPF',
      timeUnit: 'MINUTES',
      cascadeDirection: 'POSTERIOR'
    },
    subStatusGroups: {
      INITIAL_PAYMENT: ['RASCUNHO', 'AGUARDANDO_PAGAMENTO', 'EM_ANALISE', 'RECUSADO'],
      EXECUTION: ['CONFIRMADO', 'CHECK_IN', 'EM_ESPERA', 'EM_ANDAMENTO', 'PAUSADO'],
      FINAL_EXCEPTION: ['CONCLUIDO', 'PARCIAL', 'NAO_COMPARECEU', 'REAGENDADO']
    },
    interactions: {
      swipeActionThresholdPx: 150,
      swipeOpacityThresholdPx: 100,
      movementCancelThresholdPx: 5,
      longPressDelayMs: 800,
      clickDelayMs: 150,
      metricsClockIntervalMs: 1000
    },
    cascade: {
      minOffsetValue: 1
    },
    calendar: {
      initialPastMonths: 6,
      initialFutureMonths: 6,
      bufferExpansionMonths: 4,
      bottomLoadThresholdPx: 150,
      topLoadThresholdPx: 80,
      availableYearsBefore: 3,
      availableYearsAfter: 3
    }
  }
} as const;

export type AppLocale = typeof APP_CONFIG.locale;

export function formatMegabytes(bytes: number): string {
  const megabytes = bytes / BYTES_PER_MEGABYTE;
  const normalized = Number.isInteger(megabytes) ? String(megabytes) : megabytes.toFixed(1);
  return `${normalized} MB`;
}
