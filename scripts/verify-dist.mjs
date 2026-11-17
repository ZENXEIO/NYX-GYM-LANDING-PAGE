// Pre-deploy check: fail if the production output in dist/ is not safe to deploy.
// Runs after `npm run build`. Exits 1 with a list of problems.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const out = 'dist/nyx/browser';
const problems = [];
const fail = (m) => problems.push(m);

if (!existsSync(out)) {
  console.error(`[verify] ${out} not found; run the build first.`);
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = walk(out);
const text = files.filter((f) => /\.(html|js|css|txt|xml|json)$/.test(f) || f.endsWith('_headers'));

// 1. Every prerendered route exists.
for (const route of ['index.html', 'privacy/index.html', 'terms/index.html']) {
  if (!existsSync(join(out, route))) fail(`missing prerendered route: ${route}`);
}

// 2. No placeholder domains, localhost or source maps.
for (const f of text) {
  const s = readFileSync(f, 'utf8');
  if (/nyx\.example/.test(s)) fail(`placeholder domain nyx.example in ${f}`);
  if (/https?:\/\/localhost[:/]/.test(s)) fail(`localhost URL in ${f}`);
  if (/\.js$/.test(f) && /^\/\/# sourceMappingURL=/m.test(s)) fail(`source map reference in ${f}`);
}
for (const f of files) if (f.endsWith('.map')) fail(`source map shipped: ${f}`);

// 3. Nothing from sources/ or env files leaked into the output.
for (const f of files) {
  if (/[\\/]sources[\\/]|[\\/]\.env/.test(f)) fail(`private file in output: ${f}`);
}

// 4. Security headers are present and the CSP is strict.
const headersFile = join(out, '_headers');
if (!existsSync(headersFile)) fail('missing _headers');
else {
  const h = readFileSync(headersFile, 'utf8');
  for (const name of [
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    'Content-Security-Policy',
  ]) {
    if (!h.includes(`${name}:`)) fail(`_headers missing ${name}`);
  }
  const csp = /Content-Security-Policy: ([^\n]*)/.exec(h)?.[1] ?? '';
  if (!/script-src 'self'[^;]*'sha256-/.test(csp)) fail('CSP script-src has no inline-script hashes (csp-hashes.mjs did not run)');
  if (/script-src[^;]*'unsafe-inline'/.test(csp)) fail("CSP script-src allows 'unsafe-inline'");
  if (!/frame-ancestors 'none'/.test(csp)) fail("CSP missing frame-ancestors 'none'");
}

if (problems.length) {
  for (const p of problems) console.error(`[verify] FAIL: ${p}`);
  process.exit(1);
}
console.log(`[verify] dist OK: ${files.length} files checked`);
