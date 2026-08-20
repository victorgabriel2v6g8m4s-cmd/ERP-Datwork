import assert from 'node:assert/strict';
import test from 'node:test';
import { createServiceSpecs } from '../tools/dev-stack.mjs';

test('local stack binds both services to loopback and scopes the auth bypass to development', () => {
  const npmCli = 'C:\\runtime\\npm-cli.js';
  const [backend, frontend] = createServiceSpecs(npmCli);

  assert.equal(backend.command, process.execPath);
  assert.equal(backend.args[0], npmCli);
  assert.equal(backend.env.HOST, '127.0.0.1');
  assert.equal(backend.env.NODE_ENV, 'development');
  assert.equal(backend.env.ALLOW_INSECURE_AUTH_BYPASS, 'true');
  assert.deepEqual(frontend.args.slice(-2), ['--host', '127.0.0.1']);
  assert.equal(frontend.env.VITE_API_BASE_URL, 'http://127.0.0.1:3333');
});
