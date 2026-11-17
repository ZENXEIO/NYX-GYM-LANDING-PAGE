// Production build for the Playwright suite, in its own folder (dist/e2e) so
// it never replaces the real build in dist/nyx.
// The form endpoint points at a host that does not exist (forms.nyx.test);
// every e2e test intercepts it with page.route(), so no request leaves the machine.
import { spawnSync } from 'node:child_process';

export const E2E_ENDPOINT = 'https://forms.nyx.test/tour';
const OUT = 'dist/e2e';

const env = {
  ...process.env,
  NYX_TOUR_ENDPOINT: E2E_ENDPOINT,
  NYX_TURNSTILE_SITE_KEY: '', // Turnstile can't run against a fake domain
  NYX_CF_ANALYTICS_TOKEN: '', // no beacon from test runs
  NYX_DIST: `${OUT}/browser`,
};

const step = (label, args, stepEnv = env) => {
  console.log(`[e2e-build] ${label}`);
  const r = spawnSync(process.execPath, args, { stdio: 'inherit', env: stepEnv });
  if (r.status !== 0) process.exitCode = r.status ?? 1;
  return r.status === 0;
};

const ng = 'node_modules/@angular/cli/bin/ng.js';
try {
  step('environment', ['scripts/set-env.mjs', '--production']) &&
    step('build', [ng, 'build', `--output-path=${OUT}`]) &&
    step('fill tokens', ['scripts/inject-dist.mjs']) &&
    step('csp hashes', ['scripts/csp-hashes.mjs']);
} finally {
  // Put src/environments back to the developer's own .env values.
  const clean = { ...process.env };
  for (const k of Object.keys(env))
    if (k.startsWith('NYX_') && !(k in process.env)) delete clean[k];
  step('restore environment', ['scripts/set-env.mjs'], clean);
}
