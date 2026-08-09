import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const { APP_CONFIG, formatMegabytes } = await import('../src/config/app.config.ts');
const { TEXTS } = await import('../src/i18n/index.ts');
const { validateProductThumbnailFile } = await import('../src/pages/Products/utils/product-form.utils.ts');

test('application config centralizes API, locale and product thumbnail rules', () => {
  assert.equal(APP_CONFIG.locale, 'pt-BR');
  assert.equal(APP_CONFIG.api.baseUrl, 'http://localhost:3333');
  assert.equal(APP_CONFIG.api.endpoints.uploads.products, '/products/upload');
  assert.equal(APP_CONFIG.uploads.productThumbnail.maxSizeBytes, 5 * 1024 * 1024);
  assert.equal(formatMegabytes(APP_CONFIG.uploads.productThumbnail.maxSizeBytes), '5 MB');
});

test('thumbnail validation composes configuration with translated copy', () => {
  const oversizedFile = {
    type: 'image/png',
    size: APP_CONFIG.uploads.productThumbnail.maxSizeBytes + 1
  };

  assert.equal(
    validateProductThumbnailFile(oversizedFile),
    TEXTS.uploads.errors.productThumbnailMaxSize('5 MB')
  );

  assert.equal(
    validateProductThumbnailFile({ type: 'image/gif', size: 1024 }),
    TEXTS.uploads.errors.unsupportedProductThumbnailFormat
  );
});

test('shared consumers use centralized config and text catalog', async () => {
  const apiClient = await readFile(new URL('../src/api/client.ts', import.meta.url), 'utf8');
  const productUtils = await readFile(new URL('../src/pages/Products/utils/product-form.utils.ts', import.meta.url), 'utf8');
  const stepMedia = await readFile(new URL('../src/pages/Products/components/wizard/StepMedia.tsx', import.meta.url), 'utf8');

  assert.match(apiClient, /APP_CONFIG\.api\.baseUrl/);
  assert.doesNotMatch(apiClient, /baseURL:\s*['"]http:\/\/localhost:3333/);
  assert.match(productUtils, /TEXTS\.products\.validation/);
  assert.match(productUtils, /APP_CONFIG\.uploads\.productThumbnail/);
  assert.match(stepMedia, /TEXTS\.products\.media/);
  assert.doesNotMatch(stepMedia, /PRODUCT_THUMBNAIL_UPLOAD/);
});
