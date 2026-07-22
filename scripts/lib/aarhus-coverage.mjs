const AARHUS_POSTCODES = new Set([
  '8000', '8200', '8210', '8220', '8230', '8240', '8250', '8260', '8270',
  '8300', '8320', '8330', '8340', '8355', '8361', '8380', '8381', '8462',
  '8471', '8520', '8530', '8541',
]);

export function isAarhusStore(raw) {
  return AARHUS_POSTCODES.has(String(raw?.zip_code || '').trim());
}

export function publicStoreRecord(raw, dealerName) {
  const latitude = Number(raw?.latitude);
  const longitude = Number(raw?.longitude);
  if (!raw?.id || !isAarhusStore(raw) || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const street = String(raw.street || '').trim();
  const city = String(raw.city || '').trim();
  const zipCode = String(raw.zip_code || '').trim();
  const address = [street, [zipCode, city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const name = String(raw.name || '').trim() || [dealerName, city].filter(Boolean).join(' ');
  return { id: String(raw.id), name, address, street, city, zipCode, latitude, longitude };
}

export function isAarhusRelevantOffer(raw, storeId, localStoreIds = new Set()) {
  const sourceStoreId = String(raw?.store_id || '').trim();
  if (sourceStoreId) return localStoreIds.has(sourceStoreId);
  if (storeId !== 'loevbjerg') return true;
  const text = `${raw?.heading || ''}\n${raw?.description || ''}`;
  const storeSpecific = /\bja\s*tak\b|afhent(?:es|ning)|lagerport|skriv\s+ja\s+tak|vi\s+ses\s+i\s+l[øo]vbjerg/i.test(text);
  if (!storeSpecific) return true;
  return /\b(?:aarhus|[åa]rhus|tr[øo]jborg|tranbjerg)\b/i.test(text);
}
