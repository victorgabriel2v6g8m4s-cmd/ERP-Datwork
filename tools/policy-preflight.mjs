import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, '..');
const LOCK_PATH = path.join(PROJECT_ROOT, '.codex', 'policy-lock.json');

function sha256(filePath) {
  const normalizedText = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  return createHash('sha256').update(normalizedText, 'utf8').digest('hex');
}

function readArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) continue;
    values.set(argument.slice(2), argv[index + 1]);
    index += 1;
  }
  return {
    agent: values.get('agent')?.trim(),
    scope: values.get('scope')?.trim()
  };
}

function assertInsideProject(candidatePath) {
  const relative = path.relative(PROJECT_ROOT, candidatePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('PolicyScopeOutsideProject');
  }
}

function resolveScopeDirectory(scope) {
  const resolved = path.resolve(PROJECT_ROOT, scope);
  assertInsideProject(resolved);

  let candidate = resolved;
  while (!existsSync(candidate)) {
    const parent = path.dirname(candidate);
    if (parent === candidate) throw new Error('PolicyScopeNotResolvable');
    candidate = parent;
    assertInsideProject(candidate);
  }
  return statSync(candidate).isDirectory() ? candidate : path.dirname(candidate);
}

function findApplicableAgentFiles(scopeDirectory) {
  const directories = [];
  let current = scopeDirectory;
  while (true) {
    directories.push(current);
    if (current === PROJECT_ROOT) break;
    current = path.dirname(current);
    assertInsideProject(current);
  }

  return directories
    .reverse()
    .map((directory) => path.join(directory, 'AGENTS.md'))
    .filter(existsSync);
}

export function runPreflight(argv = process.argv.slice(2)) {
  const { agent, scope } = readArguments(argv);
  if (!agent || !scope) throw new Error('Usage: --agent <id> --scope <project-path>');

  const lock = JSON.parse(readFileSync(LOCK_PATH, 'utf8'));
  const rulesPath = path.resolve(PROJECT_ROOT, lock.rules.path);
  assertInsideProject(rulesPath);
  const rulesHash = sha256(rulesPath);
  if (rulesHash !== lock.rules.sha256) {
    throw new Error(`PolicyHashMismatch:${lock.rules.path}`);
  }

  const scopeDirectory = resolveScopeDirectory(scope);
  const sources = [rulesPath, ...findApplicableAgentFiles(scopeDirectory)];
  const uniqueSources = [...new Set(sources)];

  console.log(`POLICY_OK version=${lock.version} agent=${agent}`);
  for (const source of uniqueSources) {
    const relative = path.relative(PROJECT_ROOT, source).replaceAll('\\', '/');
    console.log(`SOURCE ${sha256(source).slice(0, 16)} ${relative}`);
  }
  return { version: lock.version, sources: uniqueSources };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    runPreflight();
  } catch (error) {
    console.error(`POLICY_ERROR ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
