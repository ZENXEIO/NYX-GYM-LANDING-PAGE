// Post-build: hash every inline <script> and inline event handler in the
// prerendered HTML and write a strict script-src into dist/.../_headers.
// Keeps CSP strict without 'unsafe-inline' (CLAUDE.md §9).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { distDir, walk } from './dist.mjs';

const out = distDir('csp');

const sha = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;
const scripts = new Set();
const handlers = new Set();

for (const file of walk(out, /\.html$/)) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const type = /type="([^"]+)"/i.exec(m[1])?.[1];
    if (type && !/javascript|module/i.test(type)) continue; // e.g. JSON-LD is not executed
    if (m[2].trim()) scripts.add(sha(m[2]));
  }
  for (const m of html.matchAll(/\son[a-z]+="([^"]*)"/gi)) handlers.add(sha(m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'")));
}

const scriptSrc = [
  "script-src 'self'",
  ...scripts,
  ...(handlers.size ? ["'unsafe-hashes'", ...handlers] : []),
  'https://static.cloudflareinsights.com',
  'https://challenges.cloudflare.com',
].join(' ');

const headersFile = join(out, '_headers');
const headers = readFileSync(headersFile, 'utf8').replace(
  /(Content-Security-Policy: )([^\n]*)/,
  (_, k, v) => `${k}${v.replace(/;?\s*script-src[^;]*/, '')}; ${scriptSrc}`,
);
writeFileSync(headersFile, headers);
console.log(`[csp] ${scripts.size} inline script hash(es), ${handlers.size} handler hash(es) written to ${headersFile}`);
