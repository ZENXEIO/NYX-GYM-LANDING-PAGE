// Shared helpers for the post-build scripts (inject-dist.mjs, csp-hashes.mjs).
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The prerendered output folder. NYX_DIST overrides it (scripts/e2e-build.mjs
 * builds to dist/e2e; scripts/test/postbuild.test.mjs uses a temp folder).
 * Exits with a clear message when the build has not run.
 */
export function distDir(tag) {
  const out = process.env.NYX_DIST ?? 'dist/nyx/browser';
  if (!existsSync(out)) {
    console.error(`[${tag}] ${out} not found; run the build first.`);
    process.exit(1);
  }
  return out;
}

/** Every file under `dir` (recursive) whose path matches `pattern`. */
export function walk(dir, pattern) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return walk(p, pattern);
    return pattern.test(p) ? [p] : [];
  });
}
