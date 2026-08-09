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
  }
} as const;

export type AppLocale = typeof APP_CONFIG.locale;

export function formatMegabytes(bytes: number): string {
  const megabytes = bytes / BYTES_PER_MEGABYTE;
  const normalized = Number.isInteger(megabytes) ? String(megabytes) : megabytes.toFixed(1);
  return `${normalized} MB`;
}
