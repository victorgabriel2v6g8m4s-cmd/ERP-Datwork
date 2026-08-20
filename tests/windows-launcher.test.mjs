import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const launcherRoot = path.join(projectRoot, 'tools', 'windows-launcher');
const read = (relativePath) => fs.readFileSync(path.join(launcherRoot, relativePath), 'utf8');

test('launcher exposes textual states and every required native menu action', () => {
  const state = read('Domain/LauncherState.cs');
  const tray = read('Presentation/TrayApplicationContext.cs');
  const icon = read('Presentation/StatusIconFactory.cs');

  for (const value of ['Offline', 'Starting', 'Online', 'Error']) assert.match(state, new RegExp(`\\b${value}\\b`));
  for (const label of [
    'Status:', 'Ligar', 'Desligar', 'Reiniciar servidor',
    'Abrir ERP no navegador', 'Abrir pasta de logs', 'Sair'
  ]) assert.ok(tray.includes(label), `menu ausente: ${label}`);
  for (const rgb of ['45, 170, 82', '231, 145, 34', '211, 52, 52', '128, 128, 128']) {
    assert.ok(icon.includes(rgb), `cor de estado ausente: ${rgb}`);
  }
  assert.match(tray, /DoubleClick/);
  assert.match(tray, /LauncherState\.Online/);
});

test('owned stack uses direct node process, cooperative versioned control, and PID-only fallback', () => {
  const owned = read('Infrastructure/OwnedStackProcess.cs');
  const stack = fs.readFileSync(path.join(projectRoot, 'tools', 'dev-stack.mjs'), 'utf8');

  assert.match(owned, /UseShellExecute = false/);
  assert.match(owned, /ERP-DATWORK-CONTROL\/1 STOP/);
  const environmentPolicy = read('Infrastructure/ProcessEnvironmentPolicy.cs');
  assert.match(environmentPolicy, /EnvironmentVariables\.Clear\(\)/);
  assert.match(environmentPolicy, /ERP_LAUNCHER_CONTROL_TOKEN/);
  assert.doesNotMatch(environmentPolicy, /"Path"|NODE_OPTIONS|NODE_PATH|npm_/i);
  assert.match(owned, /taskkill\.exe/);
  assert.match(owned, /\/PID /);
  assert.doesNotMatch(owned, /cmd\.exe|powershell\.exe|GetProcessesByName|\/IM /i);
  assert.doesNotMatch(stack, /cmd\.exe|powershell\.exe|npm_execpath|exec\s*\(/i);
  assert.match(stack, /shell: false/);
  assert.match(stack, /WINDOWS_ENV_ALLOWLIST/);
  assert.doesNotMatch(stack.match(/const WINDOWS_ENV_ALLOWLIST = \[[\s\S]*?\];/)[0], /['"]Path['"]/i);
  assert.match(stack, /timingSafeEqual/);
  assert.match(stack, /ERP-DATWORK-CONTROL\/1 STOP/);
});

test('configuration validates ERP identity, fixed script, node.exe and loopback URLs', () => {
  const config = read('Infrastructure/ConfigurationLoader.cs');
  assert.match(config, /ExpectedPackageName = "erp-datwork"/);
  assert.match(config, /"node\.exe"/);
  assert.match(config, /"tools", "dev-stack\.mjs"/);
  assert.match(config, /"127\.0\.0\.1"/);
  assert.match(config, /"\/health"/);
  assert.doesNotMatch(config, /localhost/);
});

test('install and uninstall scripts are user-scoped and reversible without process-name killing', () => {
  const install = read('install.ps1');
  const uninstall = read('uninstall.ps1');
  for (const script of [install, uninstall]) {
    assert.doesNotMatch(script, /HKLM|New-Service|sc\.exe|Get-Process|taskkill/i);
  }
  assert.match(install, /GetFolderPath\("Startup"\)/);
  assert.match(install, /GetFolderPath\("DesktopDirectory"\)/);
  assert.match(install, /ERP Datwork\.lnk/);
  assert.match(install, /ERPDatwork\.ico/);
  assert.match(install, /launcher\.config\.json/);
  assert.match(uninstall, /ERP Datwork\.lnk/);
  assert.match(uninstall, /launcher\.config\.json/);
  assert.match(uninstall, /Remove-Item -LiteralPath/);
  assert.match(uninstall, /ERPDatworkWindowsLauncherExit/);
});

test('build uses the checked-in brand image and root scripts do not install implicitly', () => {
  const build = read('build.ps1');
  const compiledTest = read('test.ps1');
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const gitignore = fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf8');
  assert.match(build, /frontend\\public\\logo\.png/);
  assert.match(build, /Microsoft\.NET\\Framework64\\v4\.0\.30319\\csc\.exe/);
  assert.match(compiledTest, /\[Guid\]::NewGuid\(\)/);
  assert.match(compiledTest, /GetTempPath\(\)/);
  assert.doesNotMatch(compiledTest, /Join-Path \$toolRoot "bin"/);
  assert.equal(packageJson.scripts['launcher:build'].includes('build.ps1'), true);
  assert.equal(packageJson.scripts['launcher:install'].includes('install.ps1'), true);
  assert.equal(packageJson.scripts['launcher:uninstall'].includes('uninstall.ps1'), true);
  assert.match(gitignore, /\.runtime\//);
  assert.match(gitignore, /tools\/windows-launcher\/bin\//);
});
