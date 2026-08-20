import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw } from 'lucide-react';
import { SYSTEM_TEXTS } from '../../../i18n/system.ts';
import { SYSTEM_THEME } from '../../../theme/system.ts';
import { UI_KEYS } from '../../../ui/keys.ts';
import {
  VISUAL_EDITOR_CHANNEL,
  VISUAL_EDITOR_VERSION,
  type VisualOverride,
  type VisualPageDefinition,
  type VisualViewportId
} from '../contracts/visualEditor.types.ts';
import { parseTrustedBridgeEvent } from '../contracts/visualEditor.validation.ts';
import { getVisualSurface } from '../registry/visualEditor.registry.ts';

const VIEWPORT_WIDTHS: Record<VisualViewportId, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px'
};
const VIEWPORT_IDS: readonly VisualViewportId[] = ['desktop', 'tablet', 'mobile'];
const PREVIEW_READY_TIMEOUT_MS = 5_000;
type PreviewConnectionStatus = 'loading' | 'ready' | 'error';

interface PreviewPaneProps {
  page: VisualPageDefinition;
  overrides: VisualOverride[];
  viewport: VisualViewportId;
  onViewportChange: (viewport: VisualViewportId) => void;
}

export function PreviewPane({ page, overrides, viewport, onViewportChange }: PreviewPaneProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<PreviewConnectionStatus>('loading');
  const [reloadVersion, setReloadVersion] = useState(0);
  const origin = window.location.origin;
  const pageOverrides = useMemo(
    () => overrides.filter((override) => getVisualSurface(override.uiKey)?.pageId === page.id),
    [overrides, page.id]
  );

  const sendOverrides = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({
      channel: VISUAL_EDITOR_CHANNEL,
      version: VISUAL_EDITOR_VERSION,
      type: 'apply-overrides',
      pageId: page.id,
      overrides: pageOverrides
    }, origin);
  }, [origin, page.id, pageOverrides]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      const message = parseTrustedBridgeEvent(event, frameRef.current?.contentWindow ?? null, origin);
      if (message?.type !== 'preview-ready') return;
      setConnectionStatus('ready');
      sendOverrides();
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [origin, sendOverrides]);

  useEffect(() => {
    if (connectionStatus === 'ready') sendOverrides();
  }, [connectionStatus, sendOverrides]);

  useEffect(() => {
    setConnectionStatus('loading');
    const timeout = window.setTimeout(() => setConnectionStatus((current) => current === 'loading' ? 'error' : current), PREVIEW_READY_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [page.id, reloadVersion]);

  return (
    <section className={`${SYSTEM_THEME.visualEditor.panel} min-w-0`} data-ui-key={UI_KEYS.visualEditor.preview}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black">{SYSTEM_TEXTS.visualEditor.previewTitle}</h2>
          <p className="mt-1 text-xs text-slate-400">{page.label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`${SYSTEM_THEME.visualEditor.status} ${connectionStatus === 'ready' ? 'border-emerald-500/40 text-emerald-300' : connectionStatus === 'error' ? 'border-rose-500/40 text-rose-300' : 'border-amber-500/40 text-amber-200'}`}
            role="status"
            aria-live="polite"
          >
            {connectionStatus === 'ready' ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : connectionStatus === 'error' ? <AlertCircle className="h-4 w-4" aria-hidden="true" /> : <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {connectionStatus === 'ready' ? SYSTEM_TEXTS.visualEditor.previewReady : connectionStatus === 'error' ? SYSTEM_TEXTS.visualEditor.previewError : SYSTEM_TEXTS.visualEditor.previewLoading}
          </span>
          {connectionStatus === 'error' && (
            <button type="button" className={SYSTEM_THEME.visualEditor.button} onClick={() => setReloadVersion((current) => current + 1)}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />{SYSTEM_TEXTS.visualEditor.reloadPreview}
            </button>
          )}
          {VIEWPORT_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={`${SYSTEM_THEME.visualEditor.tab} ${viewport === id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
              onClick={() => onViewportChange(id)}
              aria-pressed={viewport === id}
            >
              {SYSTEM_TEXTS.visualEditor.viewports[id]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-auto rounded-xl bg-slate-800 p-3">
        <iframe
          key={`${page.id}:${reloadVersion}`}
          ref={frameRef}
          src={page.path}
          title={`${SYSTEM_TEXTS.visualEditor.previewTitle}: ${page.label}`}
          className={SYSTEM_THEME.visualEditor.previewFrame}
          style={{ width: VIEWPORT_WIDTHS[viewport], marginInline: 'auto' }}
        />
      </div>
    </section>
  );
}
