import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const projectUrl = 'http://127.0.0.1:3100/ru';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
// Keep browser-test artifacts separate from the ordinary production build.
const testEnvironment = {
  ...process.env,
  LEAD_E2E_BUILD: '1',
};

function run(command, args, options = {}) {
  const usesCommandShell = process.platform === 'win32' && command.endsWith('.cmd');
  const executable = usesCommandShell
    ? (process.env.ComSpec ?? 'cmd.exe')
    : command;
  const executableArgs = usesCommandShell
    ? ['/d', '/s', '/c', command, ...args]
    : args;
  const result = spawnSync(executable, executableArgs, {
    cwd: process.cwd(),
    env: testEnvironment,
    stdio: 'inherit',
    ...options,
  });

  if (result.error) {
    console.error(result.error.message);
  }

  return result;
}

async function waitForServer(server, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited before becoming ready (${server.exitCode}).`);
    }

    try {
      const response = await fetch(projectUrl);

      if (response.ok) {
        return;
      }
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error('Next.js did not become ready within 60 seconds.');
}

function stopServer(server) {
  if (!server.pid || server.exitCode !== null) {
    return;
  }

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    return;
  }

  server.kill('SIGTERM');
}

// Next also rewrites this ignored declaration even with a separate tsconfig.
// Restore it immediately so E2E types cannot leak into ordinary type checks.
const nextEnvironmentPath = new URL('../next-env.d.ts', import.meta.url);
const originalNextEnvironment = existsSync(nextEnvironmentPath) ? readFileSync(nextEnvironmentPath) : null;
let build;
try {
  build = run(npmCommand, ['run', 'build']);
} finally {
  if (originalNextEnvironment) writeFileSync(nextEnvironmentPath, originalNextEnvironment);
  else rmSync(nextEnvironmentPath, { force: true });
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const server = spawn(
  process.execPath,
  [
    './node_modules/next/dist/bin/next',
    'start',
    '--hostname',
    '127.0.0.1',
    '--port',
    '3100',
  ],
  {
    cwd: process.cwd(),
    env: { ...testEnvironment, NODE_ENV: 'production' },
    stdio: 'inherit',
    windowsHide: true,
  },
);

let exitCode = 1;

try {
  await waitForServer(server);
  const tests = run(process.execPath, ['./node_modules/playwright/cli.js', 'test', '--workers=2']);
  exitCode = tests.status ?? 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
} finally {
  stopServer(server);
}

process.exit(exitCode);
