import { SYSTEM_TEXTS } from '../../../i18n/system.ts';
import { SYSTEM_THEME } from '../../../theme/system.ts';
import { CSS_PROPERTY_DEFINITIONS } from '../contracts/propertyPolicy.ts';
import type { VisualOverride, VisualSurface } from '../contracts/visualEditor.types.ts';

interface SimpleSurfaceEditorProps {
  surface: VisualSurface;
  overrides: VisualOverride[];
  onChange: (override: VisualOverride) => void;
  onRemove: (override: VisualOverride) => void;
}

export function SimpleSurfaceEditor({ surface, overrides, onChange, onRemove }: SimpleSurfaceEditorProps) {
  return (
    <div className="space-y-4">
      {surface.categories.filter((category) => category !== 'color').map((category) => {
        const definitions = surface.properties
          .map((property) => CSS_PROPERTY_DEFINITIONS[property])
          .filter((definition) => definition.category === category);
        return (
          <fieldset key={category} className="space-y-3 rounded-xl border border-slate-800 p-3">
            <legend className="px-2 text-xs font-black text-indigo-300">{SYSTEM_TEXTS.visualEditor.categories[category]}</legend>
            {definitions.map((definition) => {
              const current = overrides.find((item) => item.uiKey === surface.uiKey && item.property === definition.property)?.value ?? '';
              return (
                <label key={definition.property} className="block text-xs font-bold text-slate-300">
                  {SYSTEM_TEXTS.visualEditor.properties[definition.property]}
                  <select
                    className={`${SYSTEM_THEME.visualEditor.input} mt-1.5`}
                    value={current}
                    onChange={(event) => {
                      if (event.target.value) {
                        onChange({ uiKey: surface.uiKey, property: definition.property, value: event.target.value });
                      } else {
                        const existing = overrides.find((item) => item.uiKey === surface.uiKey && item.property === definition.property);
                        if (existing) onRemove(existing);
                      }
                    }}
                  >
                    <option value="">{SYSTEM_TEXTS.visualEditor.noOverride}</option>
                    {definition.values.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
              );
            })}
          </fieldset>
        );
      })}
    </div>
  );
}
