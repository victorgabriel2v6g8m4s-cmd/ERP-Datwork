import { useCallback, useEffect, useState } from 'react';
import { pricingService } from '../services/pricing.service.ts';
import type { PricingSettings, PricingSettingsMutationPayload } from '../types/pricing.types.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

export function usePricingSettings(onSaved?: () => Promise<void> | void) {
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'error'>('idle');

  const load = useCallback(async () => {
    try {
      setSettings(await pricingService.getSettings());
    } catch (error) {
      CustomLogger.error('[Pricing] Failed to load pricing settings', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateField = useCallback(<K extends keyof PricingSettingsMutationPayload>(
    field: K,
    value: PricingSettingsMutationPayload[K]
  ) => {
    setSaveState('idle');
    setSettings((current) => current ? { ...current, [field]: value } : current);
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    if (!settings) return false;

    const payload: PricingSettingsMutationPayload = {
      maxProductionCap: settings.maxProductionCap,
      marginCategoryA: settings.marginCategoryA,
      marginCategoryB: settings.marginCategoryB,
      marginCategoryC: settings.marginCategoryC
    };

    setIsSaving(true);
    setSaveState('idle');
    try {
      const updated = await pricingService.updateSettings(payload);
      setSettings(updated);
      setSaveState('success');
      await onSaved?.();
      return true;
    } catch (error) {
      CustomLogger.error('[Pricing] Failed to persist pricing settings', error);
      setSaveState('error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [onSaved, settings]);

  return { settings, loading, isSaving, saveState, updateField, save, reload: load };
}
