// Post-build: scripts/inject-dist.mjs (tokens + form origin in CSP) and
// scripts/csp-hashes.mjs (inline-script hashes). Runs against a fake dist.
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runScript } from './helpers.mjs';

const INLINE = 'window.__x=1;';
const HANDLER = "this.media='all'";
const CSP =
  "Content-Security-Policy: default-src 'self'; connect-src 'self' https://cloudflareinsights.com; frame-ancestors 'none'";

const sha = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;

let dir, dist;
const read = (f) => readFileSync(join(dist, f), 'utf8');
const csp = () => /Content-Security-Policy: ([^\n]*)/.exec(read('_headers'))[1];
const run = (name, env = {}) => runScript(name, [], { cwd: dir, env: { NYX_DIST: dist, ...env } });

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'nyx-dist-'));
  dist = join(dir, 'out');
  mkdirSync(join(dist, 'privacy'), { recursive: true });
  writeFileSync(
    join(dist, 'index.html'),
    `<html><head>
<link rel="stylesheet" href="s.css" media="print" onload="${HANDLER}">
<script type="application/ld+json">{"url":"%NYX_SITE_URL%/","telephone":"%NYX_PHONE%"}</script>
<script>${INLINE}</script>
<script src="main.js" type="module"></script>
</head><body></body></html>`,
  );
  writeFileSync(join(dist, 'privacy/index.html'), '<html><script>var p=2;</script></html>');
  writeFileSync(join(dist, 'robots.txt'), 'Sitemap: %NYX_SITE_URL%/sitemap.xml\n');
  writeFileSync(join(dist, 'sitemap.xml'), '<loc>%NYX_SITE_URL%/</loc>');
  writeFileSync(join(dist, 'main.js'), 'console.log("%NYX_SITE_URL%")');
  writeFileSync(join(dist, '_headers'), `/*\n  ${CSP}\n  X-Content-Type-Options: nosniff\n`);
});

describe('inject-dist.mjs', () => {
  const env = { NYX_SITE_URL: 'https://nyxclub.in', NYX_PHONE: '+919820012345' };

  test('fills %NYX_*% tokens in HTML, robots.txt and sitemap.xml', () => {
    const r = run('inject-dist.mjs', env);
    assert.equal(r.status, 0, r.stderr);
    assert.match(
      read('index.html'),
      /"url":"https:\/\/nyxclub\.in\/","telephone":"\+919820012345"/,
    );
    assert.equal(read('robots.txt'), 'Sitemap: https://nyxclub.in/sitemap.xml\n');
    assert.equal(read('sitemap.xml'), '<loc>https://nyxclub.in/</loc>');
    assert.doesNotMatch(read('index.html'), /%NYX_/);
  });

  test('does not touch JavaScript bundles', () => {
    run('inject-dist.mjs', env);
    assert.equal(read('main.js'), 'console.log("%NYX_SITE_URL%")');
  });

  test('adds the form endpoint origin (not the path) to connect-src', () => {
    run('inject-dist.mjs', { ...env, NYX_TOUR_ENDPOINT: 'https://forms.nyxclub.in/v1/tour?x=1' });
    assert.match(
      csp(),
      /connect-src 'self' https:\/\/cloudflareinsights\.com https:\/\/forms\.nyxclub\.in;/,
    );
    assert.doesNotMatch(csp(), /\/v1\/tour/);
  });

  test('is idempotent: running twice does not duplicate the origin', () => {
    const e = { ...env, NYX_TOUR_ENDPOINT: 'https://forms.nyxclub.in/tour' };
    run('inject-dist.mjs', e);
    run('inject-dist.mjs', e);
    assert.equal(csp().match(/forms\.nyxclub\.in/g).length, 1);
  });

  test('leaves connect-src alone when no endpoint is configured', () => {
    run('inject-dist.mjs', env);
    assert.match(csp(), /connect-src 'self' https:\/\/cloudflareinsights\.com;/);
  });

  test('fails clearly when the build output is missing', () => {
    const r = runScript('inject-dist.mjs', [], { cwd: dir, env: { NYX_DIST: join(dir, 'nope') } });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /not found; run the build first/);
  });
});

describe('csp-hashes.mjs', () => {
  test('hashes every executable inline script across all pages', () => {
    const r = run('csp-hashes.mjs');
    assert.equal(r.status, 0, r.stderr);
    assert.ok(csp().includes(sha(INLINE)), 'index inline script');
    assert.ok(csp().includes(sha('var p=2;')), 'nested route inline script');
  });

  test('does not hash JSON-LD or external scripts', () => {
    run('csp-hashes.mjs');
    const ld = '{"url":"%NYX_SITE_URL%/","telephone":"%NYX_PHONE%"}';
    assert.ok(!csp().includes(sha(ld)));
    assert.equal((csp().match(/'sha256-/g) ?? []).length, 3, '2 scripts + 1 handler');
  });

  test("hashes inline event handlers behind 'unsafe-hashes'", () => {
    run('csp-hashes.mjs');
    assert.match(csp(), /'unsafe-hashes'/);
    assert.ok(csp().includes(sha(HANDLER)));
  });

  test("never allows 'unsafe-inline' scripts and keeps the other directives", () => {
    run('csp-hashes.mjs');
    assert.doesNotMatch(csp(), /script-src[^;]*'unsafe-inline'/);
    assert.match(csp(), /frame-ancestors 'none'/);
    assert.match(csp(), /script-src 'self' /);
    assert.match(csp(), /https:\/\/challenges\.cloudflare\.com/);
    assert.match(read('_headers'), /X-Content-Type-Options: nosniff/);
  });

  test('is idempotent: a second run replaces script-src instead of appending', () => {
    run('csp-hashes.mjs');
    run('csp-hashes.mjs');
    assert.equal(csp().match(/script-src/g).length, 1);
  });

  test('produces hashes a browser would accept after tokens are filled (order: inject, then hash)', () => {
    writeFileSync(join(dist, 'index.html'), `<script>var u="%NYX_SITE_URL%";</script>`);
    run('inject-dist.mjs', { NYX_SITE_URL: 'https://nyxclub.in' });
    run('csp-hashes.mjs');
    assert.ok(csp().includes(sha('var u="https://nyxclub.in";')));
  });
});
