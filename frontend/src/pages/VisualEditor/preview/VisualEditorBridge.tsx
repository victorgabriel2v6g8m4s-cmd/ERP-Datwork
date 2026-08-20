import { useEffect } from 'react';
import { VISUAL_EDITOR_CHANNEL, VISUAL_EDITOR_VERSION } from '../contracts/visualEditor.types.ts';
import { parseTrustedBridgeEvent } from '../contracts/visualEditor.validation.ts';
import { getVisualPage } from '../registry/visualEditor.registry.ts';
import { applyVisualOverrideCss } from './visualEditorCss.ts';

export function VisualEditorBridge() {
  useEffect(() => {
    if (!import.meta.env.DEV || window.parent === window) return;
    const expectedOrigin = window.location.origin;
    const parentWindow = window.parent;
    const handleMessage = (event: MessageEvent<unknown>) => {
      const message = parseTrustedBridgeEvent(event, parentWindow, expectedOrigin);
      if (message?.type === 'apply-overrides' && getVisualPage(message.pageId).path === window.location.pathname) {
        applyVisualOverrideCss(document, message.overrides);
      }
    };
    window.addEventListener('message', handleMessage);
    parentWindow.postMessage({
      channel: VISUAL_EDITOR_CHANNEL,
      version: VISUAL_EDITOR_VERSION,
      type: 'preview-ready'
    }, expectedOrigin);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return null;
}
