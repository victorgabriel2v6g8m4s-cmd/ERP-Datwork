import { useEffect, useState } from 'react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Ingredient } from '../../../types/ingredient.ts';
import type { MediaItem } from '../../../types/media.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { uploadMedia } from '../../../utils/uploadService.ts';
import type { IngredientFormValues, IngredientMutationPayload, IngredientUnit } from '../types/ingredient.types.ts';

const EMPTY_VALUES: IngredientFormValues = {
  sku: '',
  name: '',
  price: 0,
  quantity: 1,
  unit: APP_CONFIG.ingredients.defaults.unit,
  thumbnail: null,
  medias: []
};

function ingredientToValues(ingredient: Ingredient | null): IngredientFormValues {
  if (!ingredient) return { ...EMPTY_VALUES, medias: [] };

  const unit = APP_CONFIG.ingredients.units.includes(ingredient.unit as IngredientUnit)
    ? ingredient.unit as IngredientUnit
    : APP_CONFIG.ingredients.defaults.unit;

  return {
    sku: ingredient.sku,
    name: ingredient.name,
    price: ingredient.price,
    quantity: ingredient.quantity,
    unit,
    thumbnail: ingredient.thumbnail,
    medias: [...ingredient.medias]
  };
}

export function useIngredientForm(isOpen: boolean, ingredient: Ingredient | null = null) {
  const [values, setValues] = useState<IngredientFormValues>(() => ingredientToValues(ingredient));
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setValues(ingredientToValues(ingredient));
    setActiveMedia(null);
  }, [ingredient, isOpen]);

  const setField = <K extends keyof IngredientFormValues>(field: K, value: IngredientFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setValues({ ...EMPTY_VALUES, medias: [] });
    setActiveMedia(null);
  };

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setIsThumbnailUploading(true);
    const media = await uploadMedia(file, APP_CONFIG.api.endpoints.uploads.ingredients);
    if (media) {
      setField('thumbnail', media.url);
      CustomLogger.info('[Ingredients][Form] Thumbnail uploaded', { mediaId: media.id });
    }
    setIsThumbnailUploading(false);
    event.currentTarget.value = '';
  };

  const buildPayload = (): IngredientMutationPayload | null => {
    const sku = values.sku.trim().toUpperCase();
    const name = values.name.trim();

    if (!sku || !name) return null;
    if (!Number.isFinite(values.price) || values.price < APP_CONFIG.ingredients.limits.minPrice) return null;
    if (!Number.isFinite(values.quantity) || values.quantity < APP_CONFIG.ingredients.limits.minQuantity) return null;

    return {
      sku,
      name,
      price: values.price,
      quantity: values.quantity,
      unit: values.unit,
      thumbnail: values.thumbnail,
      medias: [...values.medias]
    };
  };

  return {
    values,
    setField,
    reset,
    activeMedia,
    setActiveMedia,
    isThumbnailUploading,
    handleThumbnailUpload,
    buildPayload
  };
}
