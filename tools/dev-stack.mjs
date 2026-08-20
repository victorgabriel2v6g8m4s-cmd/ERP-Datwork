import { spawn } from 'node:child_process';
import { timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOOPBACK_HOST = '127.0.0.1';
const BACKEND_PORT = '3333';
const CONTROL_PIPE_PATTERN = /^ERPDatwork-[a-f0-9]{32}$/;
const CONTROL_TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const WINDOWS_ENV_ALLOWLIST = [
  'SystemRoot', 'WINDIR', 'TEMP', 'TMP'
];
const SERVICE_OVERRIDE_ALLOWLIST = new Set([
  'NODE_ENV', 'HOST', 'PORT', 'ALLOW_INSECURE_AUTH_BYPASS',
  'ALLOWED_ORIGINS', 'VITE_API_BASE_URL'
]);

export function resolveContainedFile(projectRoot, relativePath) {
  const canonicalRoot = fs.realpathSync(projectRoot);
  const candidate = fs.realpathSync(path.resolve(canonicalRoot, relativePath));
  const relative = path.relative(canonicalRoot, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.statSync(candidate).isFile()) {
    throw new Error(`InvalidRuntimeEntry:${relativePath}`);
  }
  return candidate;
}

export function createServiceSpecs({ projectRoot = PROJECT_ROOT, nodeExecPath = process.execPath } = {}) {
  const canonicalRoot = fs.realpathSync(projectRoot);
  const backendRoot = fs.realpathSync(path.join(canonicalRoot, 'backend'));
  const frontendRoot = fs.realpathSync(path.join(canonicalRoot, 'frontend'));
  const tsxCli = resolveContainedFile(canonicalRoot, 'backend/node_modules/tsx/dist/cli.mjs');
  const backendEntry = resolveContainedFile(canonicalRoot, 'backend/src/server.ts');
  const viteCli = resolveContainedFile(canonicalRoot, 'frontend/node_modules/vite/bin/vite.js');

  return [
    {
      name: 'backend',
      command: nodeExecPath,
      args: [tsxCli, 'watch', backendEntry],
      cwd: backendRoot,
      env: {
        NODE_ENV: 'development',
        HOST: LOOPBACK_HOST,
        PORT: BACKEND_PORT,
        ALLOW_INSECURE_AUTH_BYPASS: 'true',
        ALLOWED_ORIGINS: 'http://127.0.0.1:5173,http://localhost:5173'
      }
    },
    {
      name: 'frontend',
      command: nodeExecPath,
      args: [viteCli, '--host', LOOPBACK_HOST],
      cwd: frontendRoot,
      env: {
        VITE_API_BASE_URL: `http://${LOOPBACK_HOST}:${BACKEND_PORT}`
      }
    }
  ];
}

export function readControlOptions(environment = process.env) {
  const pipeName = environment.ERP_LAUNCHER_CONTROL_PIPE;
  const token = environment.ERP_LAUNCHER_CONTROL_TOKEN;
  if (!pipeName && !token) return null;
  if (!CONTROL_PIPE_PATTERN.test(pipeName) || !CONTROL_TOKEN_PATTERN.test(token)) {
    throw new Error('InvalidControlCredentials');
  }
  return { pipeName, token };
}

export function buildPipePath(pipeName, platform = process.platform) {
  if (!CONTROL_PIPE_PATTERN.test(pipeName)) throw new Error('InvalidControlPipe');
  if (platform !== 'win32') throw new Error('ControlPipeOnlySupportedOnWindows');
  return `\\\\.\\pipe\\${pipeName}`;
}

function matchesControlRequest(request, expected) {
  if (typeof request !== 'string') return false;
  const actual = Buffer.from(request, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function parseAuthorizedControlRequest(request, token) {
  if (!CONTROL_TOKEN_PATTERN.test(token) || typeof request !== 'string') return null;
  if (matchesControlRequest(request, `ERP-DATWORK-CONTROL/1 STOP ${token}\n`)) return 'STOP';
  if (matchesControlRequest(request, `ERP-DATWORK-CONTROL/1 STATUS ${token}\n`)) return 'STATUS';
  return null;
}

export function isAuthorizedControlRequest(request, token) {
  return parseAuthorizedControlRequest(request, token) !== null;
}

export function createServiceEnvironment(environment, overrides) {
  const serviceEnvironment = {};
  const sourceKeys = Object.keys(environment);
  for (const allowedKey of WINDOWS_ENV_ALLOWLIST) {
    const sourceKey = sourceKeys.find((key) => key.toLowerCase() === allowedKey.toLowerCase());
    if (sourceKey && typeof environment[sourceKey] === 'string') {
      serviceEnvironment[allowedKey] = environment[sourceKey];
    }
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (!SERVICE_OVERRIDE_ALLOWLIST.has(key) || typeof value !== 'string') {
      throw new Error(`InvalidServiceEnvironment:${key}`);
    }
    serviceEnvironment[key] = value;
  }
  return serviceEnvironment;
}

function createControlServer(options, requestStop) {
  if (!options) return null;
  const server = net.createServer((socket) => {
    socket.setEncoding('utf8');
    socket.setTimeout(1500, () => socket.destroy());
    let request = '';
    socket.on('data', (chunk) => {
      request += chunk;
      if (request.length > 160) return socket.destroy();
      if (!request.endsWith('\n')) return;
      const command = parseAuthorizedControlRequest(request, options.token);
      if (command === 'STOP') {
        socket.end('OK\n', () => requestStop('controle-local', 0));
      } else if (command === 'STATUS') {
        socket.end(`ERP-DATWORK-CONTROL/1 OWNED ${process.pid}\n`);
      } else {
        socket.destroy();
      }
    });
  });
  server.on('error', (error) => {
    console.error(`[dev-stack] Falha no protocolo local: ${error.code ?? error.name}`);
    requestStop('controle-local:erro', 1);
  });
  server.listen(buildPipePath(options.pipeName));
  return server;
}

export function startDevStack({ environment = process.env, projectRoot = PROJECT_ROOT } = {}) {
  const controlOptions = readControlOptions(environment);
  const children = new Map();
  let stopping = false;
  let controlServer;

  function finishIfStopped() {
    if (!stopping || children.size > 0) return;
    if (controlServer) controlServer.close();
  }

  function stop(reason, exitCode = 0) {
    if (stopping) return;
    stopping = true;
    console.log(`[dev-stack] Encerrando ambiente local (${reason})...`);
    process.exitCode = exitCode;
    if (controlServer) controlServer.close();
    for (const child of children.values()) {
      if (!child.killed) child.kill('SIGTERM');
    }
    finishIfStopped();
  }

  controlServer = createControlServer(controlOptions, stop);
  console.log('[dev-stack] ERP Datwork — ambiente local');
  console.log('[dev-stack] Frontend: http://127.0.0.1:5173');
  console.log('[dev-stack] Backend:  http://127.0.0.1:3333');
  console.log('[dev-stack] O bypass de autenticação está restrito ao loopback local.');

  for (const spec of createServiceSpecs({ projectRoot })) {
    const child = spawn(spec.command, spec.args, {
      cwd: spec.cwd,
      env: createServiceEnvironment(environment, spec.env),
      stdio: 'inherit',
      windowsHide: true,
      shell: false
    });
    children.set(spec.name, child);
    child.once('error', (error) => {
      console.error(`[dev-stack] Falha ao iniciar ${spec.name}: ${error.code ?? error.name}`);
      stop(`${spec.name}:erro`, 1);
    });
    child.once('exit', (code, signal) => {
      children.delete(spec.name);
      if (!stopping) {
        const result = signal ? `sinal ${signal}` : `código ${code ?? 1}`;
        console.error(`[dev-stack] ${spec.name} encerrou inesperadamente (${result}).`);
        stop(`${spec.name}:encerrado`, code ?? 1);
      }
      finishIfStopped();
    });
  }

  process.once('SIGINT', () => stop('SIGINT'));
  process.once('SIGTERM', () => stop('SIGTERM'));
  return { stop };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) startDevStack();
