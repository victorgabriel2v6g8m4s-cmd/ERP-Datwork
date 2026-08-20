import type { EditableCssProperty, VisualOverride } from '../contracts/visualEditor.types.ts';
import { parseVisualOverrides } from '../contracts/visualEditor.validation.ts';

const CSS_NAMES: Record<EditableCssProperty, string> = {
  color: 'color', backgroundColor: 'background-color', fontFamily: 'font-family', fontSize: 'font-size',
  fontWeight: 'font-weight', letterSpacing: 'letter-spacing', padding: 'padding', gap: 'gap',
  borderRadius: 'border-radius', boxShadow: 'box-shadow', display: 'display',
  gridTemplateColumns: 'grid-template-columns', flexDirection: 'flex-direction', justifyContent: 'justify-content',
  alignItems: 'align-items', width: 'width', maxWidth: 'max-width'
};

export const VISUAL_EDITOR_STYLE_ID = 'erp-visual-editor-preview-overrides';

export function generateVisualOverrideCss(input: unknown): string {
  const overrides = parseVisualOverrides(input);
  if (!overrides) return '';
  const groups = new Map<string, VisualOverride[]>();
  overrides.forEach((override) => groups.set(override.uiKey, [...(groups.get(override.uiKey) ?? []), override]));
  return [...groups.entries()].map(([uiKey, items]) => {
    const declarations = items.map((item) => `${CSS_NAMES[item.property]}:${item.value} !important`).join(';');
    return `[data-ui-key="${uiKey}"]{${declarations}}`;
  }).join('\n');
}

export function applyVisualOverrideCss(documentTarget: Document, input: unknown): boolean {
  const css = generateVisualOverrideCss(input);
  if (!css && Array.isArray(input) && input.length > 0) return false;
  let style = documentTarget.getElementById(VISUAL_EDITOR_STYLE_ID);
  if (!(style instanceof HTMLStyleElement)) {
    style = documentTarget.createElement('style');
    style.id = VISUAL_EDITOR_STYLE_ID;
    documentTarget.head.append(style);
  }
  style.textContent = css;
  return true;
}
