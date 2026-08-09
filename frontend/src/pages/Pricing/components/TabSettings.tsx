import { CheckCircle, Layers, Percent, Save, Sliders, TriangleAlert } from 'lucide-react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import { TEXTS } from '../../../i18n/index.ts';
import { ERP_THEME } from '../../../theme/presets.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import { usePricingSettings } from '../hooks/usePricingSettings.ts';

interface TabSettingsProps {
  onSaved?: () => Promise<void> | void;
}

function clampMargin(value: number): number {
  return Math.min(
    APP_CONFIG.pricing.limits.maxMarginPercent,
    Math.max(APP_CONFIG.pricing.limits.minMarginPercent, value)
  );
}

export function TabSettings({ onSaved }: TabSettingsProps) {
  const pricing = usePricingSettings(onSaved);

  if (pricing.loading || !pricing.settings) {
    return <div className={ERP_THEME.pricing.settings.loading}>{TEXTS.pricing.settings.loading}</div>;
  }

  const settings = pricing.settings;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await pricing.save();
  };

  return (
    <form onSubmit={handleSubmit} className={ERP_THEME.pricing.settings.form} data-ui-key={UI_KEYS.pricing.settingsTab}>
      <div className={ERP_THEME.pricing.settings.section}>
        <h4 className={ERP_THEME.pricing.settings.sectionTitle} data-ui-key={UI_KEYS.pricing.settingsOperationalTitle}>
          <Sliders className="w-3.5 h-3.5 text-indigo-500" /> {TEXTS.pricing.settings.operationalLimits}
        </h4>
        <div className="max-w-xs">
          <label className={ERP_THEME.pricing.settings.label}>{TEXTS.pricing.settings.maxProductionCap}</label>
          <input
            type="number"
            required
            min={APP_CONFIG.pricing.limits.minProductionCap}
            value={settings.maxProductionCap || ''}
            onChange={(event) => pricing.updateField(
              'maxProductionCap',
              Math.max(APP_CONFIG.pricing.limits.minProductionCap, Number(event.target.value))
            )}
            placeholder={TEXTS.pricing.settings.maxProductionPlaceholder}
            className={ERP_THEME.pricing.settings.input}
            data-ui-key={UI_KEYS.pricing.maxProductionCap}
          />
        </div>
      </div>

      <div className={ERP_THEME.pricing.settings.section}>
        <h4 className={ERP_THEME.pricing.settings.sectionTitle} data-ui-key={UI_KEYS.pricing.settingsMarginsTitle}>
          <Layers className="w-3.5 h-3.5 text-emerald-500" /> {TEXTS.pricing.settings.abcMargins}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['A', 'B', 'C'] as const).map((category) => {
            const field = `marginCategory${category}` as const;
            return (
              <div key={category} className="relative">
                <label className={ERP_THEME.pricing.settings.label}>{TEXTS.pricing.settings.marginCategory(category)}</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={APP_CONFIG.pricing.limits.minMarginPercent}
                    max={APP_CONFIG.pricing.limits.maxMarginPercent}
                    value={settings[field] || ''}
                    onChange={(event) => pricing.updateField(field, clampMargin(Number(event.target.value)))}
                    className={ERP_THEME.pricing.settings.marginInput}
                    data-ui-key={UI_KEYS.pricing[`marginCategory${category}`]}
                  />
                  <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={ERP_THEME.pricing.settings.footer}>
        <div className="min-h-5 flex-1">
          {pricing.saveState === 'success' && (
            <span className={ERP_THEME.pricing.settings.successMessage}><CheckCircle className="w-3.5 h-3.5" /> {TEXTS.pricing.settings.saveSuccess}</span>
          )}
          {pricing.saveState === 'error' && (
            <span className={ERP_THEME.pricing.settings.errorMessage}><TriangleAlert className="w-3.5 h-3.5" /> {TEXTS.pricing.settings.saveError}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={pricing.isSaving}
          className={ERP_THEME.pricing.settings.saveButton}
          data-ui-key={UI_KEYS.pricing.settingsSubmit}
        >
          {pricing.isSaving ? <CheckCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{pricing.isSaving ? TEXTS.common.status.saving : TEXTS.pricing.settings.saveAction}</span>
        </button>
      </div>
    </form>
  );
}
