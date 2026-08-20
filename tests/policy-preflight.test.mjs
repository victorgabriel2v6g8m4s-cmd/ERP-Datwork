import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPreflight } from '../tools/policy-preflight.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('preflight validates the locked rules and resolves inherited policies', () => {
  const result = runPreflight(['--agent', 'AG-TESTING', '--scope', 'backend/tests']);
  const relativeSources = result.sources.map((source) => path.relative(projectRoot, source).replaceAll('\\', '/'));

  assert.equal(result.version, '2026-08-20.1');
  assert.deepEqual(relativeSources, [
    'REGRAS.md',
    'AGENTS.md',
    'backend/AGENTS.md',
    'backend/tests/AGENTS.md'
  ]);
});

test('preflight rejects scopes outside the repository', () => {
  assert.throws(
    () => runPreflight(['--agent', 'AG-DEV', '--scope', '..']),
    /PolicyScopeOutsideProject/
  );
});
