import type { UiKey } from '../../../ui/keys.ts';

export const VISUAL_EDITOR_VERSION = 1 as const;
export const VISUAL_EDITOR_CHANNEL = 'erp-datwork.visual-editor' as const;

export type VisualPageId = 'home' | 'recipes' | 'ingredients' | 'expenses' | 'pricing' | 'agenda';
export type VisualCategory = 'color' | 'typography' | 'spacing' | 'shape' | 'effect' | 'layout';
export type VisualEditorMode = 'simple' | 'advanced' | 'lab';
export type VisualViewportId = 'desktop' | 'tablet' | 'mobile';

export type EditableCssProperty =
  | 'color'
  | 'backgroundColor'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'letterSpacing'
  | 'padding'
  | 'gap'
  | 'borderRadius'
  | 'boxShadow'
  | 'display'
  | 'gridTemplateColumns'
  | 'flexDirection'
  | 'justifyContent'
  | 'alignItems'
  | 'width'
  | 'maxWidth';

export interface VisualOverride {
  uiKey: UiKey;
  property: EditableCssProperty;
  value: string;
}

export interface VisualDraft {
  version: typeof VISUAL_EDITOR_VERSION;
  selectedPageId: VisualPageId;
  overrides: VisualOverride[];
  savedAt: string;
}

export interface VisualSurface {
  uiKey: UiKey;
  pageId: VisualPageId;
  label: string;
  categories: readonly VisualCategory[];
  properties: readonly EditableCssProperty[];
}

export interface VisualPageDefinition {
  id: VisualPageId;
  label: string;
  path: string;
}

export interface CssPropertyDefinition {
  property: EditableCssProperty;
  category: VisualCategory;
  values: readonly string[];
}

export interface ApplyOverridesMessage {
  channel: typeof VISUAL_EDITOR_CHANNEL;
  version: typeof VISUAL_EDITOR_VERSION;
  type: 'apply-overrides';
  pageId: VisualPageId;
  overrides: VisualOverride[];
}

export interface PreviewReadyMessage {
  channel: typeof VISUAL_EDITOR_CHANNEL;
  version: typeof VISUAL_EDITOR_VERSION;
  type: 'preview-ready';
}

export type VisualEditorMessage = ApplyOverridesMessage | PreviewReadyMessage;
