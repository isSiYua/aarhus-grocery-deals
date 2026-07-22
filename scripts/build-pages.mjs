import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output = path.join(root, '.pages-dist');
const modeConfig = JSON.parse(await fs.readFile(path.join(root, 'site-mode.json'), 'utf8'));
const mode = modeConfig.mode;

if (!new Set(['permission-review', 'live']).has(mode)) {
  throw new Error(`Unsupported site mode: ${mode}`);
}

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(path.join(output, 'data'), { recursive: true });

const shellFiles = [
  'app.js',
  'icon.svg',
  'manifest.webmanifest',
  'search-ranking.js',
  'styles.css',
  'sw.js',
];

await Promise.all(shellFiles.map(file => fs.copyFile(path.join(root, file), path.join(output, file))));

let indexHtml = await fs.readFile(path.join(root, 'index.html'), 'utf8');
if (mode === 'permission-review') {
  indexHtml = indexHtml.replace(
    '<meta name="referrer" content="no-referrer">',
    '<meta name="referrer" content="no-referrer">\n  <meta name="robots" content="noindex, nofollow, noarchive">',
  );
  indexHtml = indexHtml.replace(
    "img-src 'self' data: https://image-transformer-api.tjek.com https://f.wishabi.net;",
    "img-src 'self' data:;",
  );
  await fs.writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
}
await fs.writeFile(path.join(output, 'index.html'), indexHtml);

const dataFile = mode === 'permission-review'
  ? 'review_demo.json'
  : 'current_offers.json';
await fs.copyFile(path.join(root, 'data', dataFile), path.join(output, 'data', 'current_offers.json'));

console.log(`Built ${mode} Pages artifact at ${output}`);
