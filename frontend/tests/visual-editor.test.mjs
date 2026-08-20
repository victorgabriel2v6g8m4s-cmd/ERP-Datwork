import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const { UI_KEYS } = await import('../src/ui/keys.ts');
const { parseVisualDraft, parseVisualEditorMessage, parseTrustedBridgeEvent, parseVisualOverride } =
  await import('../src/pages/VisualEditor/contracts/visualEditor.validation.ts');
const { generateVisualOverrideCss } = await import('../src/pages/VisualEditor/preview/visualEditorCss.ts');
const { importVisualDraft, importVisualDraftFile, loadVisualDraft, saveVisualDraft, serializeVisualDraft } = await import('../src/pages/VisualEditor/storage/visualEditor.storage.ts');
const { calculateContrastRatio, findContrastFailure } = await import('../src/pages/VisualEditor/contracts/contrastPolicy.ts');
const { createDraftHistory, redoDraft, removeDraftOverride, undoDraft, upsertDraftColorPair, upsertDraftOverride } = await import('../src/pages/VisualEditor/hooks/draftHistory.ts');
const { createIsolatedLabDocument, escapeEmbeddedClosingTag, isWithinLabLimits, ISOLATED_LAB_CSP, ISOLATED_LAB_LIMITS } =
  await import('../src/pages/VisualEditor/lab/isolatedLabDocument.ts');

const validOverride = { uiKey: UI_KEYS.recipes.card, property: 'borderRadius', value: '16px' };
const validDraft = {
  version: 1,
  selectedPageId: 'recipes',
  overrides: [validOverride],
  savedAt: '2026-08-20T12:00:00.000Z'
};

test('visual overrides accept only registered surfaces, properties and curated values', () => {
  assert.deepEqual(parseVisualOverride(validOverride), validOverride);
  assert.equal(parseVisualOverride({ ...validOverride, uiKey: 'unknown.surface' }), null);
  assert.equal(parseVisualOverride({ ...validOverride, property: 'position' }), null);
  assert.equal(parseVisualOverride({ ...validOverride, property: 'color' }), null);
  assert.equal(parseVisualOverride({ ...validOverride, value: 'url(https://example.test/a)' }), null);
  assert.equal(parseVisualOverride({ ...validOverride, value: '16px;display:none' }), null);
  assert.equal(parseVisualOverride({ uiKey: UI_KEYS.home.page, property: 'color', value: 'transparent' }), null);
});

test('known foreground/background pairs must meet WCAG AA and unknown pairs fail closed', () => {
  assert.ok(calculateContrastRatio('#0f172a', '#ffffff') >= 4.5);
  assert.ok(calculateContrastRatio('#0f172a', '#334155') < 4.5);
  assert.equal(calculateContrastRatio('#ffffff', 'transparent'), null);
  assert.ok(findContrastFailure([
    { uiKey: UI_KEYS.home.page, property: 'color', value: '#0f172a' },
    { uiKey: UI_KEYS.home.page, property: 'backgroundColor', value: '#334155' }
  ]));
  assert.ok(findContrastFailure([
    { uiKey: UI_KEYS.home.page, property: 'color', value: '#ffffff' },
    { uiKey: UI_KEYS.home.page, property: 'backgroundColor', value: 'transparent' }
  ]));
});

test('color overrides fail closed unless imported as a complete accessible pair', () => {
  const base = { version: 1, selectedPageId: 'home', savedAt: validDraft.savedAt };
  const color = { uiKey: UI_KEYS.home.page, property: 'color', value: '#0f172a' };
  const background = { uiKey: UI_KEYS.home.page, property: 'backgroundColor', value: '#ffffff' };
  assert.equal(parseVisualDraft({ ...base, overrides: [color] }), null);
  assert.equal(parseVisualDraft({ ...base, overrides: [background] }), null);
  assert.equal(parseVisualDraft({ ...base, overrides: [{ ...background, value: 'transparent' }] }), null);
  assert.equal(parseVisualDraft({ ...base, overrides: [color, { ...background, value: '#334155' }] }), null);
  assert.ok(parseVisualDraft({ ...base, overrides: [color, background] }));
});

test('draft import is versioned, bounded and rejects duplicate declarations', () => {
  assert.deepEqual(parseVisualDraft(validDraft), validDraft);
  assert.deepEqual(importVisualDraft(JSON.stringify(validDraft)), validDraft);
  assert.equal(parseVisualDraft({ ...validDraft, version: 2 }), null);
  assert.equal(parseVisualDraft({ ...validDraft, overrides: [validOverride, validOverride] }), null);
  assert.equal(importVisualDraft('{invalid'), null);
  assert.equal(importVisualDraft('x'.repeat(100_001)), null);
  assert.equal(serializeVisualDraft(validDraft)?.includes('"version": 1'), true);
});

test('draft file import converts rejected reads into a controlled invalid result', async () => {
  assert.equal(await importVisualDraftFile({ size: 10, text: async () => { throw new Error('read failed'); } }), null);
  assert.deepEqual(await importVisualDraftFile({ size: 10, text: async () => JSON.stringify(validDraft) }), validDraft);
});

test('draft storage round-trips valid state and history guards invalid and low-contrast races', () => {
  const memory = new Map();
  const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  assert.equal(saveVisualDraft(storage, validDraft), true);
  assert.deepEqual(loadVisualDraft(storage), validDraft);

  let history = createDraftHistory();
  let transition = upsertDraftColorPair(history, { uiKey: UI_KEYS.home.page, color: '#0f172a', backgroundColor: '#ffffff' });
  assert.equal(transition.result.ok, true);
  history = transition.history;
  const colorOverride = history.present.overrides.find((item) => item.property === 'color');
  const removedPair = removeDraftOverride(history, colorOverride);
  assert.equal(removedPair.history.present.overrides.some((item) => item.property === 'color' || item.property === 'backgroundColor'), false);
  transition = upsertDraftColorPair(history, { uiKey: UI_KEYS.home.page, color: '#0f172a', backgroundColor: '#334155' });
  assert.deepEqual(transition.result, { ok: false, reason: 'contrast' });
  assert.equal(transition.history, history);
  assert.deepEqual(upsertDraftOverride(history, { uiKey: UI_KEYS.home.page, property: 'color', value: '#ffffff' }).result, { ok: false, reason: 'invalid' });
  assert.deepEqual(upsertDraftOverride(history, { uiKey: 'race.invalid', property: 'color', value: '#ffffff' }).result, { ok: false, reason: 'invalid' });
  assert.equal(undoDraft(history).result.ok, true);
  const undone = undoDraft(history).history;
  assert.equal(redoDraft(undone).result.ok, true);
});

test('generated CSS targets data-ui-key and never accepts selector or declaration injection', () => {
  assert.equal(
    generateVisualOverrideCss([validOverride]),
    `[data-ui-key="${UI_KEYS.recipes.card}"]{border-radius:16px !important}`
  );
  assert.equal(generateVisualOverrideCss([{ ...validOverride, value: '0};body{display:none' }]), '');
  assert.equal(generateVisualOverrideCss([{ ...validOverride, uiKey: 'body' }]), '');
});

test('preview messages validate schema, channel, version, source and origin', () => {
  const source = {};
  const message = { channel: 'erp-datwork.visual-editor', version: 1, type: 'preview-ready' };
  assert.deepEqual(parseVisualEditorMessage(message), message);
  assert.deepEqual(parseTrustedBridgeEvent({ data: message, source, origin: 'http://localhost:5173' }, source, 'http://localhost:5173'), message);
  assert.equal(parseTrustedBridgeEvent({ data: message, source: {}, origin: 'http://localhost:5173' }, source, 'http://localhost:5173'), null);
  assert.equal(parseTrustedBridgeEvent({ data: message, source, origin: 'https://evil.test' }, source, 'http://localhost:5173'), null);
  assert.equal(parseVisualEditorMessage({ ...message, version: 2 }), null);
  assert.equal(parseVisualEditorMessage({
    channel: 'erp-datwork.visual-editor', version: 1, type: 'apply-overrides', pageId: 'agenda', overrides: [validOverride]
  }), null);
  assert.equal(parseVisualEditorMessage({
    channel: 'erp-datwork.visual-editor', version: 1, type: 'apply-overrides', pageId: 'recipes', overrides: [validOverride]
  })?.type, 'apply-overrides');
});

test('arbitrary code laboratory is opaque, non-networked and escapes embedded closing tags', async () => {
  const document = createIsolatedLabDocument({
    html: '<main>teste</main>',
    css: 'body{color:red}</style><script>alert(1)</script>',
    javascript: "document.body.textContent='ok';</script><script>alert(1)"
  });
  assert.match(ISOLATED_LAB_CSP, /default-src 'none'/);
  assert.match(ISOLATED_LAB_CSP, /connect-src 'none'/);
  assert.match(ISOLATED_LAB_CSP, /form-action 'none'/);
  assert.match(ISOLATED_LAB_CSP, /navigate-to 'none'/);
  assert.match(document, /Object\.defineProperties\(window/);
  assert.match(document, /sendBeacon/);
  assert.match(document, /addEventListener\('submit'/);
  assert.equal(isWithinLabLimits({ html: 'x'.repeat(ISOLATED_LAB_LIMITS.html + 1), css: '', javascript: '' }), false);
  assert.equal(escapeEmbeddedClosingTag('</script>', 'script'), '<\\/script>');
  assert.doesNotMatch(document, /<\/style><script>alert\(1\)/);

  const labSource = await readFile(new URL('../src/pages/VisualEditor/components/IsolatedCodeLab.tsx', import.meta.url), 'utf8');
  assert.match(labSource, /sandbox="allow-scripts"/);
  assert.match(labSource, /referrerPolicy="no-referrer"/);
  assert.match(labSource, /labExecute/);
  assert.match(labSource, /setExecuted/);
  assert.match(labSource, /createIsolatedLabDocument\(executed\)/);
  assert.doesNotMatch(labSource, /createIsolatedLabDocument\(draft\)/);
  assert.match(labSource, /maxLength=\{ISOLATED_LAB_LIMITS\[field\]\}/);
  assert.doesNotMatch(labSource, /allow-same-origin|allow-forms|allow-popups/);
  assert.doesNotMatch(labSource, /dangerouslySetInnerHTML/);
});

test('editor route and Home entry are development-only and the preview bridge checks both directions', async () => {
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const home = await readFile(new URL('../src/pages/Home/HomePage.tsx', import.meta.url), 'utf8');
  const preview = await readFile(new URL('../src/pages/VisualEditor/preview/PreviewPane.tsx', import.meta.url), 'utf8');
  const bridge = await readFile(new URL('../src/pages/VisualEditor/preview/VisualEditorBridge.tsx', import.meta.url), 'utf8');
  const page = await readFile(new URL('../src/pages/VisualEditor/VisualEditorPage.tsx', import.meta.url), 'utf8');
  const toolbar = await readFile(new URL('../src/pages/VisualEditor/components/EditorToolbar.tsx', import.meta.url), 'utf8');
  const productionCheck = await readFile(new URL('../src/pages/VisualEditor/checks/assertProductionBundle.mjs', import.meta.url), 'utf8');
  const colorPair = await readFile(new URL('../src/pages/VisualEditor/components/ColorPairEditor.tsx', import.meta.url), 'utf8');
  assert.match(app, /const VisualEditorPage = import\.meta\.env\.DEV/);
  assert.match(app, /VisualEditorPage \? <VisualEditorPage \/> : <Navigate to=\{ROUTE_PATHS\.home\} replace \/>/);
  assert.match(home, /FEATURE_FLAGS\.visualEditor && !isSearching/);
  assert.match(preview, /parseTrustedBridgeEvent/);
  assert.match(bridge, /parseTrustedBridgeEvent/);
  assert.match(page, /aria-live=\{feedback\.tone === 'error' \? 'assertive' : 'polite'\}/);
  assert.match(page, /contrastError/);
  assert.match(toolbar, /finally \{/);
  assert.match(productionCheck, /VISUAL_EDITOR_PRODUCTION_BUNDLE_OK/);
  assert.match(productionCheck, /forbiddenRuntimeMarkers/);
  assert.match(colorPair, /<fieldset/);
  assert.match(colorPair, /applyColorPair/);
  assert.match(colorPair, /onApply\(\{ uiKey: surface\.uiKey, color, backgroundColor \}\)/);
  assert.doesNotMatch(`${app}\n${home}\n${preview}\n${bridge}`, /:\s*any\b|as\s+any\b|\bconsole\./);
});
