export const PRODUCT_THUMBNAIL_UPLOAD = {
    maxSizeBytes: 5 * 1024 * 1024,
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
    acceptAttribute: 'image/jpeg,image/png,image/webp'
} as const;
