import type { CssPropertyDefinition, EditableCssProperty } from './visualEditor.types.ts';

const FOREGROUND_COLORS = ['#0f172a', '#334155', '#ffffff', '#4f46e5', '#059669', '#d97706', '#e11d48'] as const;
const BACKGROUND_COLORS = FOREGROUND_COLORS;
const FONT_FAMILIES = [
  'ui-sans-serif, system-ui, sans-serif',
  'ui-serif, Georgia, serif',
  'ui-monospace, SFMono-Regular, monospace'
] as const;

export const CSS_PROPERTY_DEFINITIONS: Record<EditableCssProperty, CssPropertyDefinition> = {
  color: { property: 'color', category: 'color', values: FOREGROUND_COLORS },
  backgroundColor: { property: 'backgroundColor', category: 'color', values: BACKGROUND_COLORS },
  fontFamily: { property: 'fontFamily', category: 'typography', values: FONT_FAMILIES },
  fontSize: { property: 'fontSize', category: 'typography', values: ['12px', '14px', '16px', '18px', '24px', '32px'] },
  fontWeight: { property: 'fontWeight', category: 'typography', values: ['400', '500', '600', '700', '800', '900'] },
  letterSpacing: { property: 'letterSpacing', category: 'typography', values: ['-0.025em', '0', '0.025em', '0.05em', '0.1em'] },
  padding: { property: 'padding', category: 'spacing', values: ['0', '4px', '8px', '12px', '16px', '24px', '32px'] },
  gap: { property: 'gap', category: 'spacing', values: ['0', '4px', '8px', '12px', '16px', '24px', '32px'] },
  borderRadius: { property: 'borderRadius', category: 'shape', values: ['0', '4px', '8px', '12px', '16px', '24px', '9999px'] },
  boxShadow: { property: 'boxShadow', category: 'effect', values: ['none', '0 1px 3px rgb(15 23 42 / 0.12)', '0 10px 30px rgb(15 23 42 / 0.18)'] },
  display: { property: 'display', category: 'layout', values: ['block', 'flex', 'grid'] },
  gridTemplateColumns: { property: 'gridTemplateColumns', category: 'layout', values: ['1fr', 'repeat(2, minmax(0, 1fr))', 'repeat(3, minmax(0, 1fr))'] },
  flexDirection: { property: 'flexDirection', category: 'layout', values: ['row', 'column', 'row-reverse', 'column-reverse'] },
  justifyContent: { property: 'justifyContent', category: 'layout', values: ['start', 'center', 'space-between', 'space-around', 'end'] },
  alignItems: { property: 'alignItems', category: 'layout', values: ['stretch', 'start', 'center', 'end'] },
  width: { property: 'width', category: 'layout', values: ['auto', '100%', '75%', '50%'] },
  maxWidth: { property: 'maxWidth', category: 'layout', values: ['none', '640px', '768px', '1024px', '1280px'] }
};

export function isEditableCssProperty(value: unknown): value is EditableCssProperty {
  return typeof value === 'string' && Object.hasOwn(CSS_PROPERTY_DEFINITIONS, value);
}

export function isAllowedCssValue(property: EditableCssProperty, value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 96) return false;
  if (/[;{}<>\\]|url\s*\(|expression\s*\(|javascript\s*:|@import/i.test(value)) return false;
  return CSS_PROPERTY_DEFINITIONS[property].values.includes(value);
}
