import { useEffect, useState } from 'react';
import type { IngredientMutationPayload } from '../types/ingredient.types.ts';
import { useIngredientForm } from './useIngredientForm.ts';

interface UseIngredientsWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: IngredientMutationPayload) => Promise<void>;
}

export function useIngredientsWizard({ isOpen, onClose, onSave }: UseIngredientsWizardProps) {
  const form = useIngredientForm(isOpen);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  const progressPercent = ((step - 1) / 2) * 100;
  const identificationReady = Boolean(form.values.sku.trim() && form.values.name.trim());

  const handleNextStep = () => {
    if (step === 1 && !identificationReady) return;
    setStep((current) => Math.min(current + 1, 3));
  };

  const handlePrevStep = () => setStep((current) => Math.max(current - 1, 1));

  const handleReset = () => {
    form.reset();
    setStep(1);
    onClose();
  };

  const handleSubmit = async () => {
    const payload = form.buildPayload();
    if (!payload || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave(payload);
      handleReset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    step,
    progressPercent,
    identificationReady,
    isSubmitting,
    handleNextStep,
    handlePrevStep,
    handleReset,
    handleSubmit
  };
}
