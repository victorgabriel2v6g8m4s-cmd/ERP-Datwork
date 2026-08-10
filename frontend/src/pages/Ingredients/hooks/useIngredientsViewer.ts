import { useEffect, useState } from 'react';
import type { Ingredient, IngredientVersion } from '../../../types/ingredient.ts';
import type { MediaItem } from '../../../types/media.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { ingredientsService } from '../services/ingredients.service.ts';
import { parseIngredientSnapshot } from '../utils/ingredientContract.ts';

interface UseIngredientsViewerProps {
  isOpen: boolean;
  ingredient: Ingredient | null;
}

export function useIngredientsViewer({ isOpen, ingredient }: UseIngredientsViewerProps) {
  const [versions, setVersions] = useState<IngredientVersion[]>([]);
  const [activeData, setActiveData] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!isOpen || !ingredient) {
      setActiveData(null);
      setVersions([]);
      setActiveMedia(null);
      return;
    }

    let cancelled = false;
    setActiveData(ingredient);
    setVersions([]);
    setLoading(true);

    void ingredientsService.listVersions(ingredient.id)
      .then((data) => {
        if (!cancelled) setVersions(data);
      })
      .catch((error) => {
        if (cancelled) return;
        CustomLogger.error(`[Ingredients][History] ${TEXTS.ingredients.errors.history}`, error);
        setVersions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ingredient, isOpen]);

  const handleSelectVersion = (snapshotData: unknown) => {
    const historical = parseIngredientSnapshot(snapshotData);
    if (!historical) {
      CustomLogger.warn('[Ingredients][History] Invalid snapshot ignored');
      return;
    }
    setActiveData(historical);
    setActiveMedia(null);
  };

  return {
    versions,
    activeData,
    loading,
    medias: activeData?.medias ?? [],
    activeMedia,
    setActiveMedia,
    handleSelectVersion
  };
}
