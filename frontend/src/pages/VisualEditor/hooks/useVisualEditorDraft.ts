import { useCallback, useEffect, useRef, useState } from 'react';
import { loadVisualDraft, saveVisualDraft } from '../storage/visualEditor.storage.ts';
import {
  createDraftHistory, redoDraft, removeDraftOverride, replaceDraft, resetDraft, selectDraftPage,
  undoDraft, upsertDraftColorPair, upsertDraftOverride, type DraftHistory, type DraftTransition
} from './draftHistory.ts';

export function useVisualEditorDraft() {
  const [history, setHistory] = useState(() => createDraftHistory(loadVisualDraft(window.localStorage)));
  const historyRef = useRef(history);

  useEffect(() => {
    saveVisualDraft(window.localStorage, history.present);
  }, [history.present]);

  const transition = useCallback((operation: (current: DraftHistory) => DraftTransition) => {
    const outcome = operation(historyRef.current);
    if (outcome.history !== historyRef.current) {
      historyRef.current = outcome.history;
      setHistory(outcome.history);
    }
    return outcome.result;
  }, []);

  return {
    draft: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    selectPage: useCallback((pageId: unknown) => transition((current) => selectDraftPage(current, pageId)), [transition]),
    upsertOverride: useCallback((override: unknown) => transition((current) => upsertDraftOverride(current, override)), [transition]),
    upsertColorPair: useCallback((pair: unknown) => transition((current) => upsertDraftColorPair(current, pair)), [transition]),
    removeOverride: useCallback((override: unknown) => transition((current) => removeDraftOverride(current, override)), [transition]),
    reset: useCallback(() => transition(resetDraft), [transition]),
    replace: useCallback((draft: unknown) => transition((current) => replaceDraft(current, draft)), [transition]),
    undo: useCallback(() => transition(undoDraft), [transition]),
    redo: useCallback(() => transition(redoDraft), [transition])
  };
}
