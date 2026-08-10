const BYTES_PER_MEGABYTE = 1024 * 1024;

function readPositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() === 'true';
}

function readCsv(value: string | undefined, fallback: string[]): string[] {
  if (!value?.trim()) return fallback;
  return value.split(',').map((entry) => entry.trim()).filter(Boolean);
}

const environment = process.env['NODE_ENV']?.trim() || 'development';
const isProduction = environment === 'production';

export const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'application/pdf'
] as const;

export type AllowedUploadMimeType = typeof ALLOWED_UPLOAD_MIME_TYPES[number];

export const SERVER_CONFIG = {
  runtime: {
    environment,
    isProduction,
    port: readPositiveInteger(process.env['PORT'], 3333),
    trustProxy: readBoolean(process.env['TRUST_PROXY'], isProduction)
  },
  http: {
    jsonBodyLimit: process.env['JSON_BODY_LIMIT']?.trim() || '1mb',
    allowedOrigins: readCsv(
      process.env['ALLOWED_ORIGINS'],
      isProduction ? [] : ['http://localhost:5173', 'http://localhost:4173']
    ),
    rateLimit: {
      windowMs: readPositiveInteger(process.env['RATE_LIMIT_WINDOW_MS'], 15 * 60 * 1000),
      maxRequests: readPositiveInteger(process.env['RATE_LIMIT_MAX_REQUESTS'], 600),
      maxTrackedClients: readPositiveInteger(process.env['RATE_LIMIT_MAX_CLIENTS'], 10_000)
    }
  },
  auth: {
    allowInsecureDevelopmentBypass: !isProduction && readBoolean(
      process.env['ALLOW_INSECURE_AUTH_BYPASS'],
      true
    )
  },
  uploads: {
    maxSizeBytes: readPositiveInteger(process.env['UPLOAD_MAX_SIZE_MB'], 25) * BYTES_PER_MEGABYTE,
    allowedMimeTypes: ALLOWED_UPLOAD_MIME_TYPES,
    publicBaseUrl: process.env['APP_URL']?.trim().replace(/\/$/, '') || null
  },
  externalServices: {
    viaCep: {
      baseUrl: 'https://viacep.com.br/ws',
      timeoutMs: readPositiveInteger(process.env['VIACEP_TIMEOUT_MS'], 4_000)
    }
  },
  pricing: {
    recalculationBatchSize: readPositiveInteger(process.env['PRICING_RECALCULATION_BATCH_SIZE'], 50)
  },
  expenses: {
    history: {
      maxVersions: 30
    }
  }
} as const;
