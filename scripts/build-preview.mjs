import fs from 'node:fs/promises';
const [html, css, app, data, atlantaData] = await Promise.all([
  fs.readFile(new URL('../index.html', import.meta.url), 'utf8'),
  fs.readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  fs.readFile(new URL('../app.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('../data/current_offers.json', import.meta.url), 'utf8'),
  fs.readFile(new URL('../data/atlanta_offers.json', import.meta.url), 'utf8'),
]);
let out = html
  .replace(/<link rel="stylesheet" href="styles\.css(?:\?[^"#]*)?">/, `<style>${css}</style>`)
  .replace(/<script type="module" src="app\.js(?:\?[^"#]*)?"><\/script>/, `<script>globalThis.__GROCERY_DATA__=${data};globalThis.__ATLANTA_DATA__=${atlantaData};</script><script>${app}</script>`);
if (!out.includes('globalThis.__GROCERY_DATA__') || !out.includes('<style>:root')) {
  throw new Error('Preview build did not inline the versioned app and stylesheet assets');
}
await fs.writeFile(new URL('../preview.html', import.meta.url), out);
console.log('Built preview.html');
