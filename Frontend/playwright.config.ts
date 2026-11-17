import { defineConfig, devices } from '@playwright/test';

/**
 * E2E against the prerendered production build in dist/e2e (npm run e2e:build).
 * Runs on the installed Google Chrome (channel: 'chrome'), so no browser download.
 * Viewports follow CLAUDE.md §14: 375, 768 and 1440px.
 */
const PORT = 4310;
const chrome = { ...devices['Desktop Chrome'], channel: 'chrome' as const };

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 2 : undefined,
  reporter: process.env['CI']
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: {
    timeout: 7_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'en-GB',
    timezoneId: 'Asia/Kolkata',
  },
  projects: [
    {
      name: 'mobile',
      grepInvert: /@visual/,
      use: {
        ...chrome,
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'tablet',
      grepInvert: /@visual|@desktop-only/,
      use: { ...chrome, viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop',
      grepInvert: /@visual/,
      use: { ...chrome, viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'visual',
      grep: /@visual/,
      use: {
        ...chrome,
        viewport: { width: 1440, height: 900 },
        contextOptions: { reducedMotion: 'reduce' },
      },
    },
  ],
  webServer: {
    command: `node node_modules/serve/build/main.js dist/e2e/browser -l ${PORT} --no-clipboard --no-request-logging`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
});
