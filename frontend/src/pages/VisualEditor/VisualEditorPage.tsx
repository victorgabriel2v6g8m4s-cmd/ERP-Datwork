import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../config/routes.config.ts';
import { SYSTEM_TEXTS } from '../../i18n/system.ts';
import { SYSTEM_THEME } from '../../theme/system.ts';
import { UI_KEYS } from '../../ui/keys.ts';
import { EditorControls } from './components/EditorControls.tsx';
import { EditorToolbar } from './components/EditorToolbar.tsx';
import { IsolatedCodeLab } from './components/IsolatedCodeLab.tsx';
import type { VisualDraft, VisualEditorMode, VisualViewportId } from './contracts/visualEditor.types.ts';
import { useVisualEditorDraft } from './hooks/useVisualEditorDraft.ts';
import { PreviewPane } from './preview/PreviewPane.tsx';
import { getVisualPage } from './registry/visualEditor.registry.ts';
import type { DraftMutationResult } from './hooks/draftHistory.ts';

interface EditorFeedback { message: string; tone: 'success' | 'error' }

export function VisualEditorPage() {
  const navigate = useNavigate();
  const editor = useVisualEditorDraft();
  const [mode, setMode] = useState<VisualEditorMode>('simple');
  const [viewport, setViewport] = useState<VisualViewportId>('desktop');
  const [feedback, setFeedback] = useState<EditorFeedback | null>(null);
  const selectedPage = getVisualPage(editor.draft.selectedPageId);

  const reportMutation = (result: DraftMutationResult, successMessage: string) => {
    if (result.ok) {
      if (result.changed) setFeedback({ message: successMessage, tone: 'success' });
      return;
    }
    setFeedback({
      message: result.reason === 'contrast' ? SYSTEM_TEXTS.visualEditor.contrastError : SYSTEM_TEXTS.visualEditor.invalidOverride,
      tone: 'error'
    });
  };

  const handleImport = (draft: VisualDraft | null) => {
    if (!draft) {
      setFeedback({ message: SYSTEM_TEXTS.visualEditor.importError, tone: 'error' });
      return;
    }
    reportMutation(editor.replace(draft), SYSTEM_TEXTS.visualEditor.importSuccess);
  };

  return (
    <div className={SYSTEM_THEME.visualEditor.shell} data-ui-key={UI_KEYS.visualEditor.page}>
      <header className={SYSTEM_THEME.visualEditor.header} data-ui-key={UI_KEYS.visualEditor.header}>
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-black">{SYSTEM_TEXTS.visualEditor.title}</h1>
            <p className="mt-1 text-xs text-slate-400">{SYSTEM_TEXTS.visualEditor.description}</p>
          </div>
          <EditorToolbar
            draft={editor.draft}
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            onBack={() => navigate(ROUTE_PATHS.home)}
            onUndo={() => reportMutation(editor.undo(), SYSTEM_TEXTS.visualEditor.undoSuccess)}
            onRedo={() => reportMutation(editor.redo(), SYSTEM_TEXTS.visualEditor.redoSuccess)}
            onReset={() => reportMutation(editor.reset(), SYSTEM_TEXTS.visualEditor.resetSuccess)}
            onImport={handleImport}
          />
        </div>
        {feedback && (
          <p
            className={`mx-auto mt-2 max-w-[1800px] text-xs font-bold ${feedback.tone === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}
            role={feedback.tone === 'error' ? 'alert' : 'status'}
            aria-live={feedback.tone === 'error' ? 'assertive' : 'polite'}
            data-ui-key={UI_KEYS.visualEditor.status}
          >
            {feedback.message}
          </p>
        )}
      </header>

      <main className={`${SYSTEM_THEME.visualEditor.workspace} mx-auto max-w-[1800px]`}>
        <EditorControls
          pageId={editor.draft.selectedPageId}
          mode={mode}
          overrides={editor.draft.overrides}
          onPageChange={editor.selectPage}
          onModeChange={setMode}
          onApply={(override) => reportMutation(editor.upsertOverride(override), SYSTEM_TEXTS.visualEditor.appliedSuccess)}
          onApplyColorPair={(pair) => reportMutation(editor.upsertColorPair(pair), SYSTEM_TEXTS.visualEditor.appliedSuccess)}
          onRemove={(override) => reportMutation(editor.removeOverride(override), SYSTEM_TEXTS.visualEditor.removedSuccess)}
        />
        {mode === 'lab' ? (
          <section className={SYSTEM_THEME.visualEditor.panel}>
            <h2 className="mb-3 text-sm font-black">{SYSTEM_TEXTS.visualEditor.labTitle}</h2>
            <IsolatedCodeLab />
          </section>
        ) : (
          <PreviewPane page={selectedPage} overrides={editor.draft.overrides} viewport={viewport} onViewportChange={setViewport} />
        )}
      </main>
    </div>
  );
}
