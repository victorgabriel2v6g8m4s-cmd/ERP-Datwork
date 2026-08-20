import { useEffect, useState } from 'react';
import { SYSTEM_TEXTS } from '../../../i18n/system.ts';
import { SYSTEM_THEME } from '../../../theme/system.ts';
import { CSS_PROPERTY_DEFINITIONS } from '../contracts/propertyPolicy.ts';
import type { VisualOverride, VisualSurface } from '../contracts/visualEditor.types.ts';
import type { DraftColorPairInput } from '../hooks/draftHistory.ts';

interface ColorPairEditorProps {
  surface: VisualSurface;
  overrides: VisualOverride[];
  onApply: (pair: DraftColorPairInput) => void;
}

const DEFAULT_COLOR = '#0f172a';
const DEFAULT_BACKGROUND = '#ffffff';

export function ColorPairEditor({ surface, overrides, onApply }: ColorPairEditorProps) {
  const currentColor = overrides.find((item) => item.uiKey === surface.uiKey && item.property === 'color')?.value ?? DEFAULT_COLOR;
  const currentBackground = overrides.find((item) => item.uiKey === surface.uiKey && item.property === 'backgroundColor')?.value ?? DEFAULT_BACKGROUND;
  const [color, setColor] = useState(currentColor);
  const [backgroundColor, setBackgroundColor] = useState(currentBackground);

  useEffect(() => {
    setColor(currentColor);
    setBackgroundColor(currentBackground);
  }, [currentBackground, currentColor, surface.uiKey]);

  return (
    <fieldset className="space-y-3 rounded-xl border border-slate-800 p-3">
      <legend className="px-2 text-xs font-black text-indigo-300">{SYSTEM_TEXTS.visualEditor.colorPairTitle}</legend>
      <p className="text-xs leading-relaxed text-slate-400">{SYSTEM_TEXTS.visualEditor.colorPairHint}</p>
      <label className="block text-xs font-bold text-slate-300">
        {SYSTEM_TEXTS.visualEditor.properties.color}
        <select className={`${SYSTEM_THEME.visualEditor.input} mt-1.5`} value={color} onChange={(event) => setColor(event.target.value)}>
          {CSS_PROPERTY_DEFINITIONS.color.values.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className="block text-xs font-bold text-slate-300">
        {SYSTEM_TEXTS.visualEditor.properties.backgroundColor}
        <select className={`${SYSTEM_THEME.visualEditor.input} mt-1.5`} value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)}>
          {CSS_PROPERTY_DEFINITIONS.backgroundColor.values.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <button
        type="button"
        className={`${SYSTEM_THEME.visualEditor.primaryButton} w-full`}
        onClick={() => onApply({ uiKey: surface.uiKey, color, backgroundColor })}
      >
        {SYSTEM_TEXTS.visualEditor.applyColorPair}
      </button>
    </fieldset>
  );
}
