import { useEffect, useMemo, useState } from 'react';
import { SYSTEM_TEXTS } from '../../../i18n/system.ts';
import { SYSTEM_THEME } from '../../../theme/system.ts';
import { CSS_PROPERTY_DEFINITIONS, isEditableCssProperty } from '../contracts/propertyPolicy.ts';
import type { EditableCssProperty, VisualOverride, VisualSurface } from '../contracts/visualEditor.types.ts';

interface AdvancedPropertyEditorProps {
  surface: VisualSurface;
  onApply: (override: VisualOverride) => void;
}

export function AdvancedPropertyEditor({ surface, onApply }: AdvancedPropertyEditorProps) {
  const availableProperties = useMemo(
    () => surface.properties.filter((item) => item !== 'color' && item !== 'backgroundColor'),
    [surface.properties]
  );
  const [property, setProperty] = useState<EditableCssProperty>(availableProperties[0] ?? 'padding');
  const definition = CSS_PROPERTY_DEFINITIONS[property];
  const [value, setValue] = useState(definition.values[0] ?? '');

  useEffect(() => {
    const nextProperty = availableProperties[0] ?? 'padding';
    setProperty(nextProperty);
    setValue(CSS_PROPERTY_DEFINITIONS[nextProperty].values[0] ?? '');
  }, [availableProperties]);

  const handlePropertyChange = (next: EditableCssProperty) => {
    setProperty(next);
    setValue(CSS_PROPERTY_DEFINITIONS[next].values[0] ?? '');
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 p-3">
      <label className={SYSTEM_THEME.visualEditor.label} htmlFor="visual-editor-property">
        {SYSTEM_TEXTS.visualEditor.propertyLabel}
      </label>
      <select
        id="visual-editor-property"
        className={SYSTEM_THEME.visualEditor.input}
        value={property}
        onChange={(event) => {
          if (isEditableCssProperty(event.target.value)) handlePropertyChange(event.target.value);
        }}
      >
        {availableProperties.map((item) => (
          <option key={item} value={item}>{SYSTEM_TEXTS.visualEditor.properties[item]} — {item}</option>
        ))}
      </select>
      <label className={SYSTEM_THEME.visualEditor.label} htmlFor="visual-editor-value">
        {SYSTEM_TEXTS.visualEditor.valueLabel}
      </label>
      <select
        id="visual-editor-value"
        className={SYSTEM_THEME.visualEditor.input}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        {definition.values.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <button
        type="button"
        className={`${SYSTEM_THEME.visualEditor.primaryButton} w-full`}
        onClick={() => onApply({ uiKey: surface.uiKey, property, value })}
        disabled={!value}
      >
        {SYSTEM_TEXTS.visualEditor.apply}
      </button>
    </div>
  );
}
