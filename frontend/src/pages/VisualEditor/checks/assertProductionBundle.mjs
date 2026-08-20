import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const frontendRoot = new URL('../../../../', import.meta.url);
const distRoot = new URL('dist/', frontendRoot);
const appSource = await readFile(new URL('src/App.tsx', frontendRoot), 'utf8');
const homeSource = await readFile(new URL('src/pages/Home/HomePage.tsx', frontendRoot), 'utf8');
const assetNames = await readdir(new URL('assets/', distRoot));
const javascriptNames = assetNames.filter((name) => name.endsWith('.js'));
assert.ok(javascriptNames.length > 0, 'Production build has no JavaScript artifacts.');

const productionJavascript = (await Promise.all(
  javascriptNames.map((name) => readFile(new URL(`assets/${name}`, distRoot), 'utf8'))
)).join('\n');

const forbiddenRuntimeMarkers = [
  'erp-datwork.visual-editor',
  'preview-ready',
  'erp-visual-editor-preview-overrides',
  'Operação bloqueada pelo laboratório',
  "navigate-to 'none'"
];

for (const marker of forbiddenRuntimeMarkers) {
  assert.equal(productionJavascript.includes(marker), false, `Development-only marker leaked into production: ${marker}`);
}
assert.equal(assetNames.some((name) => /visual.?editor/i.test(name)), false, 'VisualEditor chunk exists in production.');
assert.match(appSource, /const VisualEditorPage = import\.meta\.env\.DEV/);
assert.match(appSource, /VisualEditorPage \? <VisualEditorPage \/> : <Navigate to=\{ROUTE_PATHS\.home\} replace \/>/);
assert.match(homeSource, /FEATURE_FLAGS\.visualEditor && !isSearching/);

process.stdout.write(`VISUAL_EDITOR_PRODUCTION_BUNDLE_OK assets=${javascriptNames.length}\n`);
