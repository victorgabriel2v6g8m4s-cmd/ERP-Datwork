import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildPipePath,
  createServiceEnvironment,
  createServiceSpecs,
  isAuthorizedControlRequest,
  parseAuthorizedControlRequest,
  readControlOptions,
  resolveContainedFile
} from '../tools/dev-stack.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('local stack starts fixed Node entrypoints without npm or a shell', () => {
  const fixedNode = 'C:\\runtime\\node.exe';
  const [backend, frontend] = createServiceSpecs({ projectRoot, nodeExecPath: fixedNode });

  assert.equal(backend.command, fixedNode);
  assert.match(backend.args[0], /backend[\\/]node_modules[\\/]tsx[\\/]dist[\\/]cli\.mjs$/);
  assert.deepEqual(backend.args.slice(1, 2), ['watch']);
  assert.equal(backend.env.HOST, '127.0.0.1');
  assert.equal(backend.env.NODE_ENV, 'development');
  assert.equal(backend.env.ALLOW_INSECURE_AUTH_BYPASS, 'true');
  assert.equal(frontend.command, fixedNode);
  assert.match(frontend.args[0], /frontend[\\/]node_modules[\\/]vite[\\/]bin[\\/]vite\.js$/);
  assert.deepEqual(frontend.args.slice(-2), ['--host', '127.0.0.1']);
  assert.equal(frontend.env.VITE_API_BASE_URL, 'http://127.0.0.1:3333');
  assert.equal(backend.shell, undefined);
});

test('runtime entry resolution rejects a real file outside the project root', () => {
  const outsideRelativePath = path.relative(projectRoot, process.execPath);
  assert.throws(() => resolveContainedFile(projectRoot, outsideRelativePath), /InvalidRuntimeEntry/);
});

test('control credentials require an ephemeral allowlisted pipe and 256-bit nonce', () => {
  const environment = {
    ERP_LAUNCHER_CONTROL_PIPE: `ERPDatwork-${'a'.repeat(32)}`,
    ERP_LAUNCHER_CONTROL_TOKEN: 'b'.repeat(64)
  };
  assert.deepEqual(readControlOptions(environment), {
    pipeName: environment.ERP_LAUNCHER_CONTROL_PIPE,
    token: environment.ERP_LAUNCHER_CONTROL_TOKEN
  });
  assert.equal(buildPipePath(environment.ERP_LAUNCHER_CONTROL_PIPE, 'win32'), `\\\\.\\pipe\\${environment.ERP_LAUNCHER_CONTROL_PIPE}`);
  assert.equal(readControlOptions({}), null);
  assert.throws(() => readControlOptions({ ERP_LAUNCHER_CONTROL_PIPE: environment.ERP_LAUNCHER_CONTROL_PIPE }), /InvalidControlCredentials/);
  assert.throws(() => readControlOptions({ ...environment, ERP_LAUNCHER_CONTROL_PIPE: 'free-command' }), /InvalidControlCredentials/);
  assert.equal(isAuthorizedControlRequest(`ERP-DATWORK-CONTROL/1 STOP ${environment.ERP_LAUNCHER_CONTROL_TOKEN}\n`, environment.ERP_LAUNCHER_CONTROL_TOKEN), true);
  assert.equal(parseAuthorizedControlRequest(`ERP-DATWORK-CONTROL/1 STATUS ${environment.ERP_LAUNCHER_CONTROL_TOKEN}\n`, environment.ERP_LAUNCHER_CONTROL_TOKEN), 'STATUS');
  assert.equal(isAuthorizedControlRequest(`STOP ${environment.ERP_LAUNCHER_CONTROL_TOKEN}\n`, environment.ERP_LAUNCHER_CONTROL_TOKEN), false);
  assert.equal(isAuthorizedControlRequest(`ERP-DATWORK-CONTROL/2 STOP ${environment.ERP_LAUNCHER_CONTROL_TOKEN}\n`, environment.ERP_LAUNCHER_CONTROL_TOKEN), false);
});

test('control credentials are removed before backend and frontend inherit the environment', () => {
  const serviceEnvironment = createServiceEnvironment({
    SystemRoot: 'C:\\Windows',
    TEMP: 'C:\\Temp',
    Path: 'C:\\attacker',
    NODE_OPTIONS: '--require C:\\attacker.js',
    NODE_PATH: 'C:\\attacker-modules',
    NODE_EXTRA_CA_CERTS: 'C:\\attacker.pem',
    npm_config_registry: 'https://attacker.invalid',
    DATABASE_URL: 'secret',
    ERP_LAUNCHER_CONTROL_PIPE: `ERPDatwork-${'a'.repeat(32)}`,
    ERP_LAUNCHER_CONTROL_TOKEN: 'b'.repeat(64)
  }, { NODE_ENV: 'development' });
  assert.deepEqual(serviceEnvironment, {
    SystemRoot: 'C:\\Windows',
    TEMP: 'C:\\Temp',
    NODE_ENV: 'development'
  });
  assert.throws(() => createServiceEnvironment({}, { NODE_OPTIONS: '--inspect' }), /InvalidServiceEnvironment/);
});
