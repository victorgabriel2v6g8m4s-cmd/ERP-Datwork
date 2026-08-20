import { useMemo, useState } from 'react';
import { Play, RefreshCw, RotateCcw, ShieldAlert } from 'lucide-react';
import { SYSTEM_TEXTS } from '../../../i18n/system.ts';
import { SYSTEM_THEME } from '../../../theme/system.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import {
  createIsolatedLabDocument, isWithinLabLimits, ISOLATED_LAB_DEFAULT_SOURCE, ISOLATED_LAB_LIMITS,
  type IsolatedLabSource
} from '../lab/isolatedLabDocument.ts';

type LabStatus = 'idle' | 'running' | 'ready' | 'error' | 'limit-error';

export function IsolatedCodeLab() {
  const [draft, setDraft] = useState<IsolatedLabSource>(ISOLATED_LAB_DEFAULT_SOURCE);
  const [executed, setExecuted] = useState<IsolatedLabSource>(ISOLATED_LAB_DEFAULT_SOURCE);
  const [frameVersion, setFrameVersion] = useState(0);
  const [status, setStatus] = useState<LabStatus>('running');
  const sourceDocument = useMemo(() => createIsolatedLabDocument(executed), [executed]);

  const updateField = (field: keyof IsolatedLabSource, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setStatus('idle');
  };

  const execute = () => {
    if (!isWithinLabLimits(draft)) {
      setStatus('limit-error');
      return;
    }
    setExecuted({ ...draft });
    setFrameVersion((current) => current + 1);
    setStatus('running');
  };

  const restore = () => {
    setDraft(ISOLATED_LAB_DEFAULT_SOURCE);
    setExecuted(ISOLATED_LAB_DEFAULT_SOURCE);
    setFrameVersion((current) => current + 1);
    setStatus('running');
  };

  const statusText = status === 'idle' ? SYSTEM_TEXTS.visualEditor.labIdle
    : status === 'running' ? SYSTEM_TEXTS.visualEditor.labRunning
      : status === 'ready' ? SYSTEM_TEXTS.visualEditor.labReady
        : status === 'limit-error' ? SYSTEM_TEXTS.visualEditor.labLimitError
          : SYSTEM_TEXTS.visualEditor.labError;

  return (
    <section className="space-y-4" data-ui-key={UI_KEYS.visualEditor.laboratory}>
      <div className={SYSTEM_THEME.visualEditor.warning} role="alert">
        <ShieldAlert className="mr-2 inline h-4 w-4" aria-hidden="true" />
        <span className="block">{SYSTEM_TEXTS.visualEditor.labWarning}</span>
        <span className="mt-1 block">{SYSTEM_TEXTS.visualEditor.labCpuWarning}</span>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {([
          ['html', SYSTEM_TEXTS.visualEditor.htmlLabel],
          ['css', SYSTEM_TEXTS.visualEditor.cssLabel],
          ['javascript', SYSTEM_TEXTS.visualEditor.javascriptLabel]
        ] as const).map(([field, label]) => (
          <label key={field} className="text-xs font-bold text-slate-300">
            {label}
            <textarea
              value={draft[field]}
              maxLength={ISOLATED_LAB_LIMITS[field]}
              onChange={(event) => updateField(field, event.target.value)}
              className="mt-2 min-h-44 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/25"
              spellCheck={false}
            />
            <span className="mt-1 block text-right text-[10px] text-slate-400">
              {SYSTEM_TEXTS.visualEditor.characterCount(draft[field].length, ISOLATED_LAB_LIMITS[field])}
            </span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={SYSTEM_THEME.visualEditor.primaryButton} onClick={execute}>
          <Play className="mr-2 h-4 w-4" aria-hidden="true" />{SYSTEM_TEXTS.visualEditor.labExecute}
        </button>
        <button type="button" className={SYSTEM_THEME.visualEditor.button} onClick={restore}>
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />{SYSTEM_TEXTS.visualEditor.labRestore}
        </button>
        <button type="button" className={SYSTEM_THEME.visualEditor.button} onClick={() => {
          setFrameVersion((current) => current + 1);
          setStatus('running');
        }}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />{SYSTEM_TEXTS.visualEditor.labReload}
        </button>
        <span role="status" aria-live="polite" className="text-xs font-bold text-slate-300">{statusText}</span>
      </div>
      <iframe
        key={frameVersion}
        title={SYSTEM_TEXTS.visualEditor.labPreviewTitle}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        srcDoc={sourceDocument}
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('error')}
        className="h-96 w-full rounded-xl border border-slate-700 bg-white"
      />
    </section>
  );
}
