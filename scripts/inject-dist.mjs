// Post-build: fill %NYX_*% tokens in static files (index.html JSON-LD,
// robots.txt, sitemap.xml) and add the form endpoint's origin to the CSP.
// Runs before csp-hashes.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { distDir, walk } from './dist.mjs';
import { loadConfig } from './env.mjs';

const out = distDir('env');
const c = loadConfig();
const tokens = {
  '%NYX_SITE_URL%': c.siteUrl,
  '%NYX_PHONE%': c.contact.phone,
};

let changed = 0;
for (const file of walk(out, /\.(html|txt|xml)$/)) {
  const before = readFileSync(file, 'utf8');
  let after = before;
  for (const [k, v] of Object.entries(tokens)) after = after.replaceAll(k, v);
  if (after !== before) {
    writeFileSync(file, after);
    changed++;
  }
}

const headersFile = join(out, '_headers');
if (c.tourEndpoint) {
  const origin = new URL(c.tourEndpoint).origin;
  const headers = readFileSync(headersFile, 'utf8').replace(
    /(Content-Security-Policy: [^\n]*connect-src )([^;]*)/,
    (m, k, v) => (v.includes(origin) ? m : `${k}${v} ${origin}`),
  );
  writeFileSync(headersFile, headers);
}

console.log(`[env] tokens filled in ${changed} file(s)${c.tourEndpoint ? '; form origin added to CSP' : ''}`);
