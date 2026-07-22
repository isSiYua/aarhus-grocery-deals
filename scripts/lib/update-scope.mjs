export function parseUpdateStoreIds(rawValue, availableStoreIds) {
  const available = new Set(availableStoreIds);
  const requested = String(rawValue || '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);
  if (!requested.length) return new Set(availableStoreIds);

  const unique = [...new Set(requested)];
  const unknown = unique.filter(storeId => !available.has(storeId));
  if (unknown.length) {
    throw new Error(`Unknown store id(s): ${unknown.join(', ')}. Available: ${availableStoreIds.join(', ')}`);
  }
  return new Set(unique);
}
