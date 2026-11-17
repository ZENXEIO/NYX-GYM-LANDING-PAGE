// Asset pipeline (CLAUDE.md §17).
// Reads originals from sources/assets/ and writes responsive WebP files to
// public/images/<name>-<width>.webp, matching the NgOptimizedImage loader in
// src/app/app.config.ts. Also prints tone data used to tune the palette.
//
//   npm run images                 # all files in sources/assets/
//   npm run images -- hero.jpg     # one file
//
// Then set `src: '/images/<name>'` for that image in src/app/content/site.ts.
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const IN = 'sources/assets';
const OUT = 'public/images';
const WIDTHS = [640, 1080, 1600, 2400];
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif', '.heic']);

if (!existsSync(IN)) {
  mkdirSync(IN, { recursive: true });
  console.log(`Created ${IN}/. Put original photos there and run again.`);
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });

const only = process.argv.slice(2);
const files = readdirSync(IN).filter(
  (f) => EXT.has(extname(f).toLowerCase()) && (!only.length || only.includes(f)),
);
if (!files.length) {
  console.log(`No images found in ${IN}/.`);
  process.exit(0);
}

const hex = (r, g, b) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

for (const file of files) {
  const name = basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  const src = sharp(join(IN, file)).rotate(); // respect EXIF orientation
  const meta = await src.metadata();

  for (const w of WIDTHS) {
    await src
      .clone()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: w >= 1600 ? 72 : 76, effort: 5 })
      .toFile(join(OUT, `${name}-${w}.webp`));
  }

  // Tone analysis: deepest shadow (2nd percentile luminance) and mean colour.
  const { data, info } = await src
    .clone()
    .resize(64, 64, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = [];
  for (let i = 0; i < data.length; i += info.channels) px.push([data[i], data[i + 1], data[i + 2]]);
  const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  px.sort((a, b) => lum(a) - lum(b));
  const shadow = px[Math.floor(px.length * 0.02)];
  const highlight = px[Math.floor(px.length * 0.98)];
  const mean = px
    .reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0])
    .map((v) => v / px.length);

  console.log(
    `${file} → /images/${name}  (${meta.width}×${meta.height})` +
      `\n  shadow ${hex(...shadow)}  highlight ${hex(...highlight)}  mean ${hex(...mean)}` +
      (meta.width < 2400 ? `\n  note: narrower than 2400px; larger sizes were not upscaled` : ''),
  );
}
