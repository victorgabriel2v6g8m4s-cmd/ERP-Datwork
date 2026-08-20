import { getVisualSurface, isVisualPageId } from '../registry/visualEditor.registry.ts';
import { isAllowedCssValue, isEditableCssProperty } from './propertyPolicy.ts';
import { findContrastFailure } from './contrastPolicy.ts';
import {
  VISUAL_EDITOR_CHANNEL,
  VISUAL_EDITOR_VERSION,
  type ApplyOverridesMessage,
  type PreviewReadyMessage,
  type VisualDraft,
  type VisualEditorMessage,
  type VisualOverride
} from './visualEditor.types.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseVisualOverride(value: unknown): VisualOverride | null {
  if (!isRecord(value) || typeof value.uiKey !== 'string' || !isEditableCssProperty(value.property)) return null;
  const surface = getVisualSurface(value.uiKey);
  if (!surface || !surface.properties.includes(value.property) || !isAllowedCssValue(value.property, value.value)) return null;
  return { uiKey: surface.uiKey, property: value.property, value: value.value };
}

export function parseVisualOverrides(value: unknown): VisualOverride[] | null {
  if (!Array.isArray(value) || value.length > 200) return null;
  const parsed = value.map(parseVisualOverride);
  if (parsed.some((item) => item === null)) return null;
  const overrides = parsed.filter((item): item is VisualOverride => item !== null);
  const identities = overrides.map((item) => `${item.uiKey}:${item.property}`);
  if (new Set(identities).size !== identities.length || findContrastFailure(overrides)) return null;
  return overrides;
}

export function parseVisualDraft(value: unknown): VisualDraft | null {
  if (!isRecord(value) || value.version !== VISUAL_EDITOR_VERSION || !isVisualPageId(value.selectedPageId)) return null;
  if (typeof value.savedAt !== 'string' || !Number.isFinite(Date.parse(value.savedAt))) return null;
  const overrides = parseVisualOverrides(value.overrides);
  if (!overrides) return null;
  return { version: VISUAL_EDITOR_VERSION, selectedPageId: value.selectedPageId, overrides, savedAt: value.savedAt };
}

export function parseVisualEditorMessage(value: unknown): VisualEditorMessage | null {
  if (!isRecord(value) || value.channel !== VISUAL_EDITOR_CHANNEL || value.version !== VISUAL_EDITOR_VERSION) return null;
  if (value.type === 'preview-ready') {
    return { channel: VISUAL_EDITOR_CHANNEL, version: VISUAL_EDITOR_VERSION, type: 'preview-ready' } satisfies PreviewReadyMessage;
  }
  if (value.type !== 'apply-overrides' || !isVisualPageId(value.pageId)) return null;
  const overrides = parseVisualOverrides(value.overrides);
  if (!overrides) return null;
  if (overrides.some((override) => getVisualSurface(override.uiKey)?.pageId !== value.pageId)) return null;
  return {
    channel: VISUAL_EDITOR_CHANNEL,
    version: VISUAL_EDITOR_VERSION,
    type: 'apply-overrides',
    pageId: value.pageId,
    overrides
  } satisfies ApplyOverridesMessage;
}

export function parseTrustedBridgeEvent(
  event: Pick<MessageEvent<unknown>, 'data' | 'origin' | 'source'>,
  expectedSource: MessageEventSource | null,
  expectedOrigin: string
): VisualEditorMessage | null {
  if (!expectedSource || event.source !== expectedSource || event.origin !== expectedOrigin) return null;
  return parseVisualEditorMessage(event.data);
}
