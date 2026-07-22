import fs from 'node:fs/promises';
const [html, css, app, searchRanking, data] = await Promise.all([
  fs.readFile(new URL('../index.html', import.meta.url), 'utf8'),
  fs.readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  fs.readFile(new URL('../app.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('../search-ranking.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'),
]);
const previewApp = `${searchRanking.replace('export function offerSearchScore', 'function offerSearchScore')}\n${app.replace(/^import \{ offerSearchScore \} from '\.\/search-ranking\.js\?v=\d+';\n/, '')}`;
let out = html
  .replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
  .replace(/<link rel="stylesheet" href="styles\.css(?:\?[^"#]*)?">/, `<style>${css}</style>`)
  .replace(/<script type="module" src="app\.js(?:\?[^"#]*)?"><\/script>/, `<script>globalThis.__GROCERY_DATA__=${data};</script><script>${previewApp}</script>`);
if (!out.includes('globalThis.__GROCERY_DATA__') || !out.includes('<style>:root')) {
  throw new Error('Preview build did not inline the versioned app and stylesheet assets');
}
await fs.writeFile(new URL('../preview.html', import.meta.url), out);
console.log('Built preview.html');
