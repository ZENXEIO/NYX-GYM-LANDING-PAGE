// Build-time config: scripts/env.mjs + scripts/set-env.mjs.
// Run with: npm run test:scripts
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { productionProblems } from '../env.mjs';
import { runScript } from './helpers.mjs';

const good = {
  siteUrl: 'https://nyxclub.in',
  tourEndpoint: 'https://forms.nyxclub.in/tour',
  turnstileSiteKey: '0x4AAAAAAA',
  cfAnalyticsToken: 'abc',
  contact: {
    phone: '+919820012345',
    phoneDisplay: '+91 98200 12345',
    email: 'hello@nyxclub.in',
    instagram: 'https://instagram.com/nyxclub',
  },
};
const withOver = (over = {}, contact = {}) => ({
  ...good,
  ...over,
  contact: { ...good.contact, ...contact },
});

describe('productionProblems', () => {
  test('a fully configured site has no problems', () => {
    assert.deepEqual(productionProblems(good), []);
  });

  const cases = [
    ['an http site URL', withOver({ siteUrl: 'http://nyxclub.in' }), /https URL/],
    ['the placeholder domain', withOver({ siteUrl: 'https://nyx.example' }), /placeholder domain/],
    ['a localhost site URL', withOver({ siteUrl: 'https://localhost:4200' }), /placeholder domain/],
    ['a malformed site URL', withOver({ siteUrl: 'nyxclub' }), /https URL/],
    ['no form endpoint', withOver({ tourEndpoint: '' }), /NYX_TOUR_ENDPOINT is empty/],
    ['an http form endpoint', withOver({ tourEndpoint: 'http://x.in/t' }), /must be an https URL/],
    ['no Turnstile key', withOver({ turnstileSiteKey: '' }), /no bot protection/],
    ['the placeholder phone', withOver({}, { phone: '+910000000000' }), /NYX_PHONE/],
    ['a landline', withOver({}, { phone: '+912224567890' }), /NYX_PHONE/],
    ['a phone without +91', withOver({}, { phone: '9820012345' }), /NYX_PHONE/],
    ['the placeholder email', withOver({}, { email: 'hello@nyx.example' }), /NYX_EMAIL/],
    [
      'bare instagram.com',
      withOver({}, { instagram: 'https://instagram.com/' }),
      /NYX_INSTAGRAM_URL/,
    ],
    [
      'bare www.instagram.com',
      withOver({}, { instagram: 'https://www.instagram.com' }),
      /NYX_INSTAGRAM_URL/,
    ],
  ];
  for (const [name, config, message] of cases) {
    test(`flags ${name}`, () => {
      const problems = productionProblems(config);
      assert.equal(problems.length, 1, problems.join('\n'));
      assert.match(problems[0], message);
    });
  }

  test('analytics is optional', () => {
    assert.deepEqual(productionProblems(withOver({ cfAnalyticsToken: '' })), []);
  });
});

describe('set-env.mjs', () => {
  const sandbox = () => mkdtempSync(join(tmpdir(), 'nyx-env-'));
  const envFile = (dir) => join(dir, 'src/environments/environment.ts');
  const devFile = (dir) => join(dir, 'src/environments/environment.development.ts');
  const parse = (file) =>
    JSON.parse(
      readFileSync(file, 'utf8')
        .replace(/^[\s\S]*?export const environment = /, '')
        .replace(/;\s*$/, ''),
    );

  test('generates both environment files from .env', () => {
    const dir = sandbox();
    writeFileSync(
      join(dir, '.env'),
      'NYX_SITE_URL=https://nyxclub.in/\nNYX_PHONE=+91 98200-12345\nNYX_TOUR_ENDPOINT=https://f.in/t\n',
    );
    const r = runScript('set-env.mjs', [], { cwd: dir });
    assert.equal(r.status, 0, r.stderr);

    const prod = parse(envFile(dir));
    assert.equal(prod.production, true);
    assert.equal(prod.siteUrl, 'https://nyxclub.in', 'trailing slash removed');
    assert.equal(prod.contact.phone, '+919820012345', 'spaces and hyphens removed');
    assert.equal(prod.tourEndpoint, 'https://f.in/t');

    const dev = parse(devFile(dir));
    assert.equal(dev.production, false);
    assert.equal(dev.siteUrl, 'http://localhost:4200');
  });

  test('host environment variables override .env', () => {
    const dir = sandbox();
    writeFileSync(join(dir, '.env'), 'NYX_SITE_URL=https://from-file.in\n');
    const r = runScript('set-env.mjs', [], {
      cwd: dir,
      env: { NYX_SITE_URL: 'https://from-host.in' },
    });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(parse(envFile(dir)).siteUrl, 'https://from-host.in');
  });

  test('works with no .env at all, using safe defaults', () => {
    const dir = sandbox();
    const r = runScript('set-env.mjs', [], { cwd: dir });
    assert.equal(r.status, 0, r.stderr);
    const prod = parse(envFile(dir));
    assert.equal(prod.siteUrl, 'https://nyx.example');
    assert.equal(prod.tourEndpoint, '');
  });

  test('only writes the documented public keys, never other .env values', () => {
    const dir = sandbox();
    writeFileSync(join(dir, '.env'), 'NYX_TURNSTILE_SECRET=shh\nDATABASE_URL=postgres://x\n');
    runScript('set-env.mjs', [], { cwd: dir });
    const out = readFileSync(envFile(dir), 'utf8');
    assert.doesNotMatch(out, /shh|postgres/);
    assert.deepEqual(Object.keys(parse(envFile(dir))).sort(), [
      'cfAnalyticsToken',
      'contact',
      'production',
      'siteUrl',
      'tourEndpoint',
      'turnstileSiteKey',
    ]);
  });

  test('--production only warns about placeholders on a local build', () => {
    const dir = sandbox();
    const r = runScript('set-env.mjs', ['--production'], { cwd: dir });
    assert.equal(r.status, 0);
    assert.match(r.stderr, /WARNING/);
    assert.ok(existsSync(envFile(dir)));
  });

  test('--production fails the build on placeholders in CI', () => {
    const dir = sandbox();
    const r = runScript('set-env.mjs', ['--production'], { cwd: dir, env: { CI: 'true' } });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /ERROR: NYX_SITE_URL is still a placeholder domain/);
    assert.match(r.stderr, /ERROR: NYX_TOUR_ENDPOINT is empty/);
  });

  test('--production fails with NYX_STRICT=true too', () => {
    const dir = sandbox();
    const r = runScript('set-env.mjs', ['--production'], { cwd: dir, env: { NYX_STRICT: 'true' } });
    assert.equal(r.status, 1);
  });

  test('--production passes in CI when everything is real', () => {
    const dir = sandbox();
    writeFileSync(
      join(dir, '.env'),
      [
        'NYX_SITE_URL=https://nyxclub.in',
        'NYX_TOUR_ENDPOINT=https://forms.nyxclub.in/tour',
        'NYX_TURNSTILE_SITE_KEY=0x4AAA',
        'NYX_PHONE=+919820012345',
        'NYX_EMAIL=hello@nyxclub.in',
        'NYX_INSTAGRAM_URL=https://instagram.com/nyxclub',
      ].join('\n'),
    );
    const r = runScript('set-env.mjs', ['--production'], { cwd: dir, env: { CI: 'true' } });
    assert.equal(r.status, 0, r.stderr);
    assert.doesNotMatch(r.stderr, /ERROR|WARNING/);
  });
});
