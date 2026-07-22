const SIGNIFICANT_FIELDS = ['price','prePrice','packageText','unitPriceValue','validFrom','validUntil','memberOnly','multiBuy','zhExplanation'];

const changed = (a,b) => SIGNIFICANT_FIELDS.some(key => JSON.stringify(a?.[key] ?? null) !== JSON.stringify(b?.[key] ?? null));

function preserveVerifiedLocationTimestamp(oldLocation, freshLocation) {
  if (!oldLocation || !freshLocation) return freshLocation;
  const stable = location => ({ ...location, verifiedAt: null });
  return JSON.stringify(stable(oldLocation)) === JSON.stringify(stable(freshLocation))
    ? oldLocation
    : freshLocation;
}

export function mergeIncrementally(previous, freshByStore, storeStatuses, nowIso) {
  const previousMap = new Map((previous.offers || []).map(o => [o.canonicalKey, o]));
  const next = [];
  const history = [...(previous.history || [])];
  const freshKeys = new Set();

  for (const [storeId, offers] of Object.entries(freshByStore)) {
    const uniqueOffers = [...new Map(offers.map(offer => [offer.canonicalKey, offer])).values()];
    for (const fresh of uniqueOffers) {
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
        lastSeenAt: isChanged ? nowIso : (old.lastSeenAt || old.discoveredAt || nowIso),
        sourceLocation: preserveVerifiedLocationTimestamp(old.sourceLocation, fresh.sourceLocation),
        changeType: isChanged
          ? (Number.isFinite(old.price) && fresh.price < old.price ? 'price_drop' : 'updated')
          : (old.changeType || null),
        priceDropAmount: isChanged
          ? (Number.isFinite(old.price) && fresh.price < old.price ? `${(old.price - fresh.price).toFixed(2)} DKK` : null)
          : (old.priceDropAmount || null),
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
    } else if (status === 'skipped' || status == null) {
      // A store-scoped refresh must leave every unselected chain byte-for-byte
      // intact. This is what lets multiple maintainers update different
      // flyers without withdrawing or rewriting one another's data.
      next.push(old);
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
