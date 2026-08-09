import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { type Product } from '../../../types/product.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { uploadMedia } from '../../../utils/uploadService.ts';
import {
    buildProductMutationPayload,
    calculateProductCostPreview,
    createProductFormValues,
    validateProductForm,
    validateProductThumbnailFile
} from '../utils/product-form.utils.ts';
import { type ProductFormValues, type ProductMutationPayload } from '../types/product-form.types.ts';

interface UseProductFormOptions {
    isOpen: boolean;
    product?: Product | null;
    mode: 'create' | 'edit';
}

export function useProductForm({ isOpen, product = null, mode }: UseProductFormOptions) {
    const [values, setValues] = useState<ProductFormValues>(() => createProductFormValues(product));
    const [activeMedia, setActiveMedia] = useState<ProductFormValues['medias'][number] | null>(null);
    const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
    const [thumbnailError, setThumbnailError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setValues(createProductFormValues(product));
        setActiveMedia(null);
        setThumbnailError(null);
        setIsThumbnailUploading(false);
        setIsSubmitting(false);

        CustomLogger.info(`[Products][Form] ${mode === 'create' ? 'Create' : 'Edit'} form initialized`, {
            productId: product?.id ?? null
        });
    }, [isOpen, mode, product]);

    const setField = useCallback(<K extends keyof ProductFormValues>(
        field: K,
        value: ProductFormValues[K]
    ) => {
        setValues((current) => ({ ...current, [field]: value }));
    }, []);

    const { recipeCostPerUnit, unitsPerBatch, indirectCost } = values;
    const costPreview = useMemo(
        () => calculateProductCostPreview({ recipeCostPerUnit, unitsPerBatch, indirectCost }),
        [recipeCostPerUnit, unitsPerBatch, indirectCost]
    );

    const validation = useMemo(() => validateProductForm(values), [values]);

    const reset = useCallback(() => {
        setValues(createProductFormValues(null));
        setActiveMedia(null);
        setThumbnailError(null);
        setIsThumbnailUploading(false);
        setIsSubmitting(false);
    }, []);

    const handleThumbnailUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        if (!file) return;

        const validationError = validateProductThumbnailFile(file);
        if (validationError) {
            setThumbnailError(validationError);
            CustomLogger.warn('[Products][Form] Thumbnail upload blocked by client validation', {
                fileType: file.type,
                fileSize: file.size,
                reason: validationError
            });
            input.value = '';
            return;
        }

        setThumbnailError(null);
        setIsThumbnailUploading(true);

        try {
            const media = await uploadMedia(file, '/products/upload');
            if (!media) {
                setThumbnailError('Não foi possível enviar a imagem de capa.');
                return;
            }

            setField('thumbnail', media.url);
            CustomLogger.info('[Products][Form] Thumbnail updated successfully', { mediaId: media.id });
        } finally {
            setIsThumbnailUploading(false);
            input.value = '';
        }
    }, [setField]);

    const submit = useCallback(async (
        onSubmit: (payload: ProductMutationPayload) => Promise<void>
    ): Promise<boolean> => {
        const currentValidation = validateProductForm(values);
        if (!currentValidation.isValid) {
            CustomLogger.warn('[Products][Form] Submission blocked because form is invalid', {
                invalidFields: Object.keys(currentValidation.errors)
            });
            return false;
        }

        setIsSubmitting(true);

        try {
            const payload = buildProductMutationPayload(values);
            await onSubmit(payload);
            CustomLogger.info(`[Products][Form] ${mode === 'create' ? 'Create' : 'Edit'} submission completed`);
            return true;
        } catch (error) {
            CustomLogger.error(`[Products][Form] ${mode === 'create' ? 'Create' : 'Edit'} submission failed`, error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [mode, values]);

    return {
        values,
        setField,
        costPreview,
        validation,
        activeMedia,
        setActiveMedia,
        isThumbnailUploading,
        thumbnailError,
        isSubmitting,
        handleThumbnailUpload,
        submit,
        reset
    };
}
