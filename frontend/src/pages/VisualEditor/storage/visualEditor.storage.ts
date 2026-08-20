import { parseVisualDraft } from '../contracts/visualEditor.validation.ts';
import { VISUAL_EDITOR_VERSION, type VisualDraft } from '../contracts/visualEditor.types.ts';

export const VISUAL_EDITOR_STORAGE_KEY = `erp-datwork.visual-editor.draft.v${VISUAL_EDITOR_VERSION}`;
export const VISUAL_EDITOR_IMPORT_LIMIT_BYTES = 100_000;

export function createEmptyVisualDraft(): VisualDraft {
  return { version: VISUAL_EDITOR_VERSION, selectedPageId: 'home', overrides: [], savedAt: new Date().toISOString() };
}

export function loadVisualDraft(storage: Pick<Storage, 'getItem'>): VisualDraft {
  try {
    const serialized = storage.getItem(VISUAL_EDITOR_STORAGE_KEY);
    if (!serialized) return createEmptyVisualDraft();
    return parseVisualDraft(JSON.parse(serialized)) ?? createEmptyVisualDraft();
  } catch {
    return createEmptyVisualDraft();
  }
}

export function saveVisualDraft(storage: Pick<Storage, 'setItem'>, draft: VisualDraft): boolean {
  const validDraft = parseVisualDraft(draft);
  if (!validDraft) return false;
  try {
    storage.setItem(VISUAL_EDITOR_STORAGE_KEY, JSON.stringify(validDraft));
    return true;
  } catch {
    return false;
  }
}

export function serializeVisualDraft(draft: VisualDraft): string | null {
  const validDraft = parseVisualDraft(draft);
  return validDraft ? JSON.stringify(validDraft, null, 2) : null;
}

export function importVisualDraft(serialized: string): VisualDraft | null {
  if (serialized.length > VISUAL_EDITOR_IMPORT_LIMIT_BYTES) return null;
  try {
    return parseVisualDraft(JSON.parse(serialized));
  } catch {
    return null;
  }
}

export async function importVisualDraftFile(file: Pick<File, 'size' | 'text'> | undefined): Promise<VisualDraft | null> {
  if (!file || file.size > VISUAL_EDITOR_IMPORT_LIMIT_BYTES) return null;
  try {
    return importVisualDraft(await file.text());
  } catch {
    return null;
  }
}
