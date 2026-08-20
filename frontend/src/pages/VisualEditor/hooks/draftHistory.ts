import { findContrastFailure } from '../contracts/contrastPolicy.ts';
import { parseVisualDraft, parseVisualOverride } from '../contracts/visualEditor.validation.ts';
import { VISUAL_EDITOR_VERSION, type VisualDraft } from '../contracts/visualEditor.types.ts';
import { isVisualPageId } from '../registry/visualEditor.registry.ts';
import { createEmptyVisualDraft } from '../storage/visualEditor.storage.ts';

export interface DraftHistory {
  past: VisualDraft[];
  present: VisualDraft;
  future: VisualDraft[];
}

export type DraftMutationResult = { ok: true; changed: boolean } | { ok: false; reason: 'invalid' | 'contrast' };
export interface DraftTransition { history: DraftHistory; result: DraftMutationResult }
export interface DraftColorPairInput { uiKey: string; color: string; backgroundColor: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const stamp = (draft: Omit<VisualDraft, 'savedAt' | 'version'>): VisualDraft => ({
  ...draft, version: VISUAL_EDITOR_VERSION, savedAt: new Date().toISOString()
});

const commit = (history: DraftHistory, present: VisualDraft): DraftHistory => ({
  past: [...history.past.slice(-49), history.present], present, future: []
});

export const createDraftHistory = (present = createEmptyVisualDraft()): DraftHistory => ({ past: [], present, future: [] });

export function selectDraftPage(history: DraftHistory, pageId: unknown): DraftTransition {
  if (!isVisualPageId(pageId)) return { history, result: { ok: false, reason: 'invalid' } };
  if (history.present.selectedPageId === pageId) return { history, result: { ok: true, changed: false } };
  return { history: commit(history, stamp({ selectedPageId: pageId, overrides: history.present.overrides })), result: { ok: true, changed: true } };
}

export function upsertDraftOverride(history: DraftHistory, input: unknown): DraftTransition {
  const override = parseVisualOverride(input);
  if (!override) return { history, result: { ok: false, reason: 'invalid' } };
  if (override.property === 'color' || override.property === 'backgroundColor') {
    return { history, result: { ok: false, reason: 'invalid' } };
  }
  const overrides = [
    ...history.present.overrides.filter((item) => item.uiKey !== override.uiKey || item.property !== override.property),
    override
  ];
  if (findContrastFailure(overrides)) return { history, result: { ok: false, reason: 'contrast' } };
  const present = stamp({ selectedPageId: history.present.selectedPageId, overrides });
  return { history: commit(history, present), result: { ok: true, changed: true } };
}

export function upsertDraftColorPair(history: DraftHistory, input: unknown): DraftTransition {
  if (!isRecord(input)) return { history, result: { ok: false, reason: 'invalid' } };
  const candidate = input;
  const color = parseVisualOverride({ uiKey: candidate.uiKey, property: 'color', value: candidate.color });
  const background = parseVisualOverride({ uiKey: candidate.uiKey, property: 'backgroundColor', value: candidate.backgroundColor });
  if (!color || !background || color.uiKey !== background.uiKey) return { history, result: { ok: false, reason: 'invalid' } };
  const overrides = [
    ...history.present.overrides.filter((item) => item.uiKey !== color.uiKey || (item.property !== 'color' && item.property !== 'backgroundColor')),
    color,
    background
  ];
  if (findContrastFailure(overrides)) return { history, result: { ok: false, reason: 'contrast' } };
  const present = stamp({ selectedPageId: history.present.selectedPageId, overrides });
  return { history: commit(history, present), result: { ok: true, changed: true } };
}

export function removeDraftOverride(history: DraftHistory, input: unknown): DraftTransition {
  const override = parseVisualOverride(input);
  if (!override) return { history, result: { ok: false, reason: 'invalid' } };
  const removesColorPair = override.property === 'color' || override.property === 'backgroundColor';
  const overrides = history.present.overrides.filter((item) => item.uiKey !== override.uiKey
    || (removesColorPair ? item.property !== 'color' && item.property !== 'backgroundColor' : item.property !== override.property));
  if (overrides.length === history.present.overrides.length) return { history, result: { ok: true, changed: false } };
  return {
    history: commit(history, stamp({ selectedPageId: history.present.selectedPageId, overrides })),
    result: { ok: true, changed: true }
  };
}

export function replaceDraft(history: DraftHistory, input: unknown): DraftTransition {
  const draft = parseVisualDraft(input);
  if (!draft) return { history, result: { ok: false, reason: 'invalid' } };
  return { history: commit(history, draft), result: { ok: true, changed: true } };
}

export const resetDraft = (history: DraftHistory): DraftTransition => ({ history: commit(history, createEmptyVisualDraft()), result: { ok: true, changed: true } });

export function undoDraft(history: DraftHistory): DraftTransition {
  const previous = history.past.at(-1);
  if (!previous) return { history, result: { ok: true, changed: false } };
  return {
    history: { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] },
    result: { ok: true, changed: true }
  };
}

export function redoDraft(history: DraftHistory): DraftTransition {
  const next = history.future[0];
  if (!next) return { history, result: { ok: true, changed: false } };
  return {
    history: { past: [...history.past, history.present], present: next, future: history.future.slice(1) },
    result: { ok: true, changed: true }
  };
}
