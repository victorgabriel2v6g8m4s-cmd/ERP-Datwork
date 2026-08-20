import { useEffect, useMemo, useState } from 'react';
import { SYSTEM_TEXTS } from '../../../i18n/system.ts';
import { SYSTEM_THEME } from '../../../theme/system.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import type { VisualEditorMode, VisualOverride, VisualPageId, VisualSurface } from '../contracts/visualEditor.types.ts';
import { getPageSurfaces, isVisualPageId, VISUAL_PAGES } from '../registry/visualEditor.registry.ts';
import { AdvancedPropertyEditor } from './AdvancedPropertyEditor.tsx';
import { OverrideList } from './OverrideList.tsx';
import { SimpleSurfaceEditor } from './SimpleSurfaceEditor.tsx';
import { ColorPairEditor } from './ColorPairEditor.tsx';
import type { DraftColorPairInput } from '../hooks/draftHistory.ts';

interface EditorControlsProps {
  pageId: VisualPageId;
  mode: VisualEditorMode;
  overrides: VisualOverride[];
  onPageChange: (pageId: VisualPageId) => void;
  onModeChange: (mode: VisualEditorMode) => void;
  onApply: (override: VisualOverride) => void;
  onApplyColorPair: (pair: DraftColorPairInput) => void;
  onRemove: (override: VisualOverride) => void;
}

const MODES: readonly VisualEditorMode[] = ['simple', 'advanced', 'lab'];

export function EditorControls(props: EditorControlsProps) {
  const surfaces = useMemo(() => getPageSurfaces(props.pageId), [props.pageId]);
  const [selectedUiKey, setSelectedUiKey] = useState<string>(surfaces[0]?.uiKey ?? '');
  const selectedSurface: VisualSurface | undefined = surfaces.find((surface) => surface.uiKey === selectedUiKey) ?? surfaces[0];

  useEffect(() => setSelectedUiKey(surfaces[0]?.uiKey ?? ''), [surfaces]);

  return (
    <aside className={`${SYSTEM_THEME.visualEditor.panel} space-y-4`} data-ui-key={UI_KEYS.visualEditor.controls}>
      <div>
        <label className={SYSTEM_THEME.visualEditor.label} htmlFor="visual-editor-page">{SYSTEM_TEXTS.visualEditor.pageLabel}</label>
        <select
          id="visual-editor-page"
          className={SYSTEM_THEME.visualEditor.input}
          value={props.pageId}
          onChange={(event) => {
            if (isVisualPageId(event.target.value)) props.onPageChange(event.target.value);
          }}
        >
          {VISUAL_PAGES.map((page) => <option key={page.id} value={page.id}>{page.label}</option>)}
        </select>
      </div>

      <fieldset>
        <legend className={SYSTEM_THEME.visualEditor.label}>{SYSTEM_TEXTS.visualEditor.modeLabel}</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className={`${SYSTEM_THEME.visualEditor.tab} ${props.mode === mode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
              onClick={() => props.onModeChange(mode)}
              aria-pressed={props.mode === mode}
            >
              {mode === 'simple' ? SYSTEM_TEXTS.visualEditor.simpleMode : mode === 'advanced' ? SYSTEM_TEXTS.visualEditor.advancedMode : SYSTEM_TEXTS.visualEditor.labMode}
            </button>
          ))}
        </div>
      </fieldset>

      {props.mode !== 'lab' && (
        <div data-ui-key={UI_KEYS.visualEditor.propertyEditor} className="space-y-4">
          {selectedSurface ? (
            <>
              <div>
                <label className={SYSTEM_THEME.visualEditor.label} htmlFor="visual-editor-surface">{SYSTEM_TEXTS.visualEditor.surfaceLabel}</label>
                <select
                  id="visual-editor-surface"
                  className={SYSTEM_THEME.visualEditor.input}
                  value={selectedSurface.uiKey}
                  onChange={(event) => setSelectedUiKey(event.target.value)}
                >
                  {surfaces.map((surface) => <option key={surface.uiKey} value={surface.uiKey}>{surface.label}</option>)}
                </select>
              </div>
              {selectedSurface.properties.includes('color') && selectedSurface.properties.includes('backgroundColor') && (
                <ColorPairEditor surface={selectedSurface} overrides={props.overrides} onApply={props.onApplyColorPair} />
              )}
              {props.mode === 'simple' ? (
                <SimpleSurfaceEditor surface={selectedSurface} overrides={props.overrides} onChange={props.onApply} onRemove={props.onRemove} />
              ) : (
                <AdvancedPropertyEditor surface={selectedSurface} onApply={props.onApply} />
              )}
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-400">{SYSTEM_TEXTS.visualEditor.emptySurfaces}</p>
          )}
        </div>
      )}

      <div className="border-t border-slate-800 pt-4">
        <h2 className="mb-3 text-xs font-black text-slate-200">{SYSTEM_TEXTS.visualEditor.overrideCount(props.overrides.length)}</h2>
        <OverrideList overrides={props.overrides} onRemove={props.onRemove} />
      </div>
    </aside>
  );
}
