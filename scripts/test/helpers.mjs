import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const scripts = join(dirname(fileURLToPath(import.meta.url)), '..');

/** NYX_* and CI variables from the developer's shell must not leak into a test. */
function cleanEnv(extra) {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith('NYX_') || k === 'CI') delete env[k];
  return { ...env, ...extra };
}

/** Run scripts/<name> in its own process with a controlled cwd and environment. */
export function runScript(name, args = [], { cwd, env = {} } = {}) {
  const r = spawnSync(process.execPath, [join(scripts, name), ...args], {
    cwd,
    env: cleanEnv(env),
    encoding: 'utf8',
  });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}
