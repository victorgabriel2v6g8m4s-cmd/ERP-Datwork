import { useState } from 'react';
import type { Ingredient } from '../../../types/ingredient.ts';
import type { IngredientEditorSection, IngredientMutationPayload } from '../types/ingredient.types.ts';
import { useIngredientForm } from './useIngredientForm.ts';

interface UseIngredientsEditorProps {
  isOpen: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
  onSave: (id: string, payload: IngredientMutationPayload) => Promise<void>;
}

export function useIngredientsEditor({ isOpen, ingredient, onClose, onSave }: UseIngredientsEditorProps) {
  const form = useIngredientForm(isOpen, ingredient);
  const [openSection, setOpenSection] = useState<IngredientEditorSection | null>('id');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ingredient || isSubmitting) return;

    const payload = form.buildPayload();
    if (!payload) return;

    setIsSubmitting(true);
    try {
      await onSave(ingredient.id, payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, openSection, setOpenSection, isSubmitting, handleSubmit };
}
