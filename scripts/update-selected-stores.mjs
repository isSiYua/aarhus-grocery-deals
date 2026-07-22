const requested = process.argv.slice(2).join(',').trim();
if (requested) process.env.AARHUS_UPDATE_STORES = requested;
else delete process.env.AARHUS_UPDATE_STORES;
await import('./update-data.mjs');
await import('./update-product-identities.mjs');
await import('./prepare-fallback-data.mjs');

const report = globalThis.__AARHUS_UPDATE_REPORT__;
if (report) {
  console.log(report.changedStoreIds.length
    ? `Material offer changes detected for: ${report.changedStoreIds.join(', ')}`
    : 'No material offer changes detected for the checked stores.');
  if (report.unchangedStoreIds.length) console.log(`Unchanged stores: ${report.unchangedStoreIds.join(', ')}`);
  if (report.failedStoreIds.length) console.log(`Failed stores: ${report.failedStoreIds.join(', ')}`);
}
