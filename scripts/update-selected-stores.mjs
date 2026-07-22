const requested = process.argv.slice(2).join(',').trim();
if (!requested) {
  throw new Error('Usage: npm run update:stores -- rema,lidl');
}

process.env.AARHUS_UPDATE_STORES = requested;
await import('./update-data.mjs');
await import('./update-product-identities.mjs');
await import('./prepare-fallback-data.mjs');
