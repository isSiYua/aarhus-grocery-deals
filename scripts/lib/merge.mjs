const SIGNIFICANT_FIELDS = ['price','prePrice','packageText','unitPriceValue','validFrom','validUntil','memberOnly','multiBuy','zhExplanation'];

const changed = (a,b) => SIGNIFICANT_FIELDS.some(key => JSON.stringify(a?.[key] ?? null) !== JSON.stringify(b?.[key] ?? null));

export function mergeIncrementally(previous, freshByStore, storeStatuses, nowIso) {
  const previousMap = new Map((previous.offers || []).map(o => [o.canonicalKey, o]));
  const next = [];
  const history = [...(previous.history || [])];
  const freshKeys = new Set();

  for (const [storeId, offers] of Object.entries(freshByStore)) {
    for (const fresh of offers) {
      freshKeys.add(fresh.canonicalKey);
      const old = previousMap.get(fresh.canonicalKey);
      if (!old) {
        next.push(fresh);
        continue;
      }
      const isChanged = changed(old, fresh);
      if (isChanged) history.push({ ...old, archivedAt: nowIso, replacedBy: fresh.canonicalKey });
      next.push({
        ...old,
        ...fresh,
        discoveredAt: old.discoveredAt || nowIso,
        lastSeenAt: nowIso,
        changeType: isChanged ? (Number.isFinite(old.price) && fresh.price < old.price ? 'price_drop' : 'updated') : null,
        priceDropAmount: Number.isFinite(old.price) && fresh.price < old.price ? `${(old.price - fresh.price).toFixed(2)} DKK` : null,
        status: 'active',
      });
    }
  }

  for (const old of previous.offers || []) {
    if (freshKeys.has(old.canonicalKey)) continue;
    const status = storeStatuses[old.storeId];
    const expired = old.validUntil && new Date(old.validUntil) < new Date(nowIso);
    if (status === 'failed') {
      next.push({ ...old, status: 'unconfirmed' });
    } else {
      // A successful store refresh is authoritative: a missing item is no longer
      // presented as current, even if its previously stated end date is later.
      history.push({ ...old, status: expired ? 'expired' : 'withdrawn', archivedAt: nowIso });
    }
  }

  const deduped = [...new Map(next.map(o => [o.canonicalKey, o])).values()];
  history.sort((a,b) => String(b.archivedAt || '').localeCompare(String(a.archivedAt || '')));
  return { offers: deduped, history: history.slice(0, 3000) };
}
