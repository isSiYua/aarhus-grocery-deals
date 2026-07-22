import fs from 'node:fs/promises';

const mode = process.argv[2];
const allowedModes = new Set(['permission-review', 'live']);

if (!allowedModes.has(mode)) {
  console.error('Usage: node scripts/set-site-mode.mjs <permission-review|live>');
  process.exitCode = 1;
} else {
  const file = new URL('../site-mode.json', import.meta.url);
  await fs.writeFile(file, `${JSON.stringify({ mode }, null, 2)}\n`);
  console.log(`Site mode set to ${mode}. Commit and deploy site-mode.json to publish this mode.`);
}
