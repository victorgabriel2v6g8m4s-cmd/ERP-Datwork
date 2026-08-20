import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOOPBACK_HOST = '127.0.0.1';
const BACKEND_PORT = '3333';

export function createServiceSpecs(npmExecPath = process.env.npm_execpath) {
  if (!npmExecPath) {
    throw new Error('NpmExecutableUnavailable: inicie com `npm run dev`');
  }
  const npmCommand = process.execPath;
  const npmArgs = [npmExecPath];
  return [
    {
      name: 'backend',
      command: npmCommand,
      args: [...npmArgs, '--prefix', 'backend', 'run', 'dev'],
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
      command: npmCommand,
      args: [...npmArgs, '--prefix', 'frontend', 'run', 'dev', '--', '--host', LOOPBACK_HOST],
      env: {
        VITE_API_BASE_URL: `http://${LOOPBACK_HOST}:${BACKEND_PORT}`
      }
    }
  ];
}

export function startDevStack() {
  const children = new Map();
  let stopping = false;

  function stop(reason, exitCode = 0) {
    if (stopping) return;
    stopping = true;
    console.log(`[dev-stack] Encerrando serviços (${reason})...`);
    for (const child of children.values()) {
      if (!child.killed) child.kill('SIGTERM');
    }
    process.exitCode = exitCode;
  }

  console.log('[dev-stack] ERP Datwork local');
  console.log('[dev-stack] Frontend: http://127.0.0.1:5173');
  console.log('[dev-stack] Backend:  http://127.0.0.1:3333');
  console.log('[dev-stack] O bypass de autenticação está restrito ao loopback local.');

  for (const spec of createServiceSpecs()) {
    const child = spawn(spec.command, spec.args, {
      cwd: PROJECT_ROOT,
      env: { ...process.env, ...spec.env },
      stdio: 'inherit',
      windowsHide: true
    });
    children.set(spec.name, child);
    child.once('error', (error) => {
      console.error(`[dev-stack] Falha ao iniciar ${spec.name}: ${error.message}`);
      stop(`${spec.name}:erro`, 1);
    });
    child.once('exit', (code, signal) => {
      children.delete(spec.name);
      if (!stopping) {
        const result = signal ? `sinal ${signal}` : `código ${code ?? 1}`;
        console.error(`[dev-stack] ${spec.name} encerrou inesperadamente (${result}).`);
        stop(`${spec.name}:encerrado`, code ?? 1);
      }
    });
  }

  process.once('SIGINT', () => stop('SIGINT'));
  process.once('SIGTERM', () => stop('SIGTERM'));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) startDevStack();
