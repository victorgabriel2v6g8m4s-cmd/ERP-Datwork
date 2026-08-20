import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const agentsDirectory = new URL('../.codex/agents/', import.meta.url);
const expectedAgents = [
  'api',
  'architecture',
  'database',
  'development',
  'documentation',
  'integrations',
  'observability',
  'performance',
  'security',
  'testing',
  'uiux'
];

test('all specialized agents enforce the policy preflight and scoped permissions', async () => {
  const files = (await readdir(agentsDirectory))
    .filter((file) => file.endsWith('.toml'))
    .map((file) => file.replace(/\.toml$/, ''))
    .sort();
  assert.deepEqual(files, expectedAgents);

  for (const agent of expectedAgents) {
    const content = await readFile(new URL(`${agent}.toml`, agentsDirectory), 'utf8');
    assert.match(content, new RegExp(`name = "${agent}"`));
    assert.match(content, /npm run policy:preflight/);
    assert.match(content, /REGRAS\.md/);
    assert.match(content, /AGENTS\.md/);

    if (agent === 'development' || agent === 'documentation') {
      assert.match(content, /sandbox_mode = "workspace-write"/);
    } else {
      assert.match(content, /sandbox_mode = "read-only"/);
      assert.match(content, /Não altere código/);
      assert.match(content, /arquivos/);
    }
  }
});

test('documentation is writable only for markdown and development is the code owner', async () => {
  const development = await readFile(new URL('development.toml', agentsDirectory), 'utf8');
  const documentation = await readFile(new URL('documentation.toml', agentsDirectory), 'utf8');

  assert.match(development, /único perfil que altera código/i);
  assert.match(documentation, /somente documentação Markdown/);
  assert.match(documentation, /nunca altere código/);
});
