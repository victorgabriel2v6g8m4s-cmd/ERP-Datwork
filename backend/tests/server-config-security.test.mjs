import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const configUrl = new URL('../dist/config/serverConfig.js', import.meta.url).href;

function loadConfig(overrides) {
  return spawnSync(
    process.execPath,
    ['--input-type=module', '--eval', `import ${JSON.stringify(configUrl)}`],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        DATABASE_URL: 'file:./server-config-test.db',
        ...overrides
      }
    }
  );
}

test('development bypass is accepted on an explicit loopback host', () => {
  const result = loadConfig({
    NODE_ENV: 'development',
    HOST: '127.0.0.1',
    ALLOW_INSECURE_AUTH_BYPASS: 'true'
  });

  assert.equal(result.status, 0, result.stderr);
});

test('development bypass fails fast on a non-loopback host', () => {
  const result = loadConfig({
    NODE_ENV: 'development',
    HOST: '0.0.0.0',
    ALLOW_INSECURE_AUTH_BYPASS: 'true'
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /UnsafeAuthBypassConfiguration/);
});

test('development bypass fails fast in production even on loopback', () => {
  const result = loadConfig({
    NODE_ENV: 'production',
    HOST: '127.0.0.1',
    ALLOW_INSECURE_AUTH_BYPASS: 'true'
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /UnsafeAuthBypassConfiguration/);
});

test('production starts fail-closed when the bypass is disabled', () => {
  const result = loadConfig({
    NODE_ENV: 'production',
    HOST: '127.0.0.1',
    ALLOW_INSECURE_AUTH_BYPASS: 'false'
  });

  assert.equal(result.status, 0, result.stderr);
});
