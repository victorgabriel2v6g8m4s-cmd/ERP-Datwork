import { useRef } from 'react';
import { ArrowLeft, Download, Redo2, RotateCcw, Undo2, Upload } from 'lucide-react';
import { SYSTEM_TEXTS } from '../../../i18n/system.ts';
import { SYSTEM_THEME } from '../../../theme/system.ts';
import type { VisualDraft } from '../contracts/visualEditor.types.ts';
import { importVisualDraftFile, serializeVisualDraft } from '../storage/visualEditor.storage.ts';

interface EditorToolbarProps {
  draft: VisualDraft;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onImport: (draft: VisualDraft | null) => void;
}

export function EditorToolbar(props: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buttonClass = SYSTEM_THEME.visualEditor.button;

  const exportDraft = () => {
    const serialized = serializeVisualDraft(props.draft);
    if (!serialized) return;
    const url = URL.createObjectURL(new Blob([serialized], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'erp-datwork-visual-draft.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importDraft = async (file: File | undefined) => {
    try {
      props.onImport(await importVisualDraftFile(file));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={buttonClass} onClick={props.onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />{SYSTEM_TEXTS.visualEditor.backHome}
      </button>
      <button type="button" className={buttonClass} onClick={props.onUndo} disabled={!props.canUndo} aria-label={SYSTEM_TEXTS.visualEditor.undo}>
        <Undo2 className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" className={buttonClass} onClick={props.onRedo} disabled={!props.canRedo} aria-label={SYSTEM_TEXTS.visualEditor.redo}>
        <Redo2 className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" className={buttonClass} onClick={props.onReset}>
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />{SYSTEM_TEXTS.visualEditor.reset}
      </button>
      <button type="button" className={buttonClass} onClick={() => fileInputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" aria-hidden="true" />{SYSTEM_TEXTS.visualEditor.importDraft}
      </button>
      <button type="button" className={buttonClass} onClick={exportDraft}>
        <Download className="mr-2 h-4 w-4" aria-hidden="true" />{SYSTEM_TEXTS.visualEditor.exportDraft}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => void importDraft(event.target.files?.[0])}
        aria-label={SYSTEM_TEXTS.visualEditor.importDraft}
      />
    </div>
  );
}
