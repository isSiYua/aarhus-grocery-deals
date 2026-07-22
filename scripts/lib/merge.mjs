import { normalizedText } from './taxonomy.mjs';

const SIGNIFICANT_FIELDS = ['price','prePrice','packageText','unitPriceValue','validFrom','validUntil','memberOnly','multiBuy','zhExplanation'];

const changed = (a,b) => SIGNIFICANT_FIELDS.some(key => JSON.stringify(a?.[key] ?? null) !== JSON.stringify(b?.[key] ?? null));

function preserveVerifiedLocationTimestamp(oldLocation, freshLocation) {
  if (!oldLocation || !freshLocation) return freshLocation;
  const stable = location => ({ ...location, verifiedAt: null });
  return JSON.stringify(stable(oldLocation)) === JSON.stringify(stable(freshLocation))
    ? oldLocation
    : freshLocation;
}

// Large dealers can have more offers than Tjek's 1000-row pagination cap.
// The API may then return the same promotion from a different overlapping
// catalogue on consecutive requests, with a different offer ID and image crop.
// Match those aliases by shopper-visible facts so an already reviewed product
// does not flap, while price/date/quantity/content changes remain real updates.
function promotionFingerprint(offer) {
  const values = [
    offer.storeId,
    normalizedText(offer.originalName),
    offer.price,
    offer.prePrice,
    offer.validFrom,
    offer.validUntil,
    offer.memberOnly,
    offer.multiBuy,
  ];
  return JSON.stringify(values.map(value => value ?? null));
}

function deduplicatePromotionAliases(offers, previousMap) {
  const byPromotion = new Map();
  for (const offer of offers) {
    const fingerprint = promotionFingerprint(offer);
    const current = byPromotion.get(fingerprint);
    if (!current
      || previousMap.has(offer.canonicalKey)
      || (!previousMap.has(current.canonicalKey) && String(offer.canonicalKey).localeCompare(String(current.canonicalKey)) < 0)) {
      byPromotion.set(fingerprint, offer);
    }
  }
  return [...byPromotion.values()];
}

export function mergeIncrementally(previous, freshByStore, storeStatuses, nowIso) {
  const previousMap = new Map((previous.offers || []).map(o => [o.canonicalKey, o]));
  const previousByPromotion = new Map();
  for (const offer of previous.offers || []) {
    const fingerprint = promotionFingerprint(offer);
    const bucket = previousByPromotion.get(fingerprint) || [];
    bucket.push(offer);
    previousByPromotion.set(fingerprint, bucket);
  }
  const next = [];
  const history = [...(previous.history || [])];
  const freshKeys = new Set();
  const consumedPreviousKeys = new Set();

  for (const [storeId, offers] of Object.entries(freshByStore)) {
    const sourceUniqueOffers = [...new Map(offers.map(offer => [offer.canonicalKey, offer])).values()];
    const uniqueOffers = deduplicatePromotionAliases(sourceUniqueOffers, previousMap);
    for (const fresh of uniqueOffers) {
      const exactOld = previousMap.get(fresh.canonicalKey);
      const aliasOld = exactOld || (previousByPromotion.get(promotionFingerprint(fresh)) || [])
        .find(candidate => !consumedPreviousKeys.has(candidate.canonicalKey));
      const old = aliasOld || null;
      const retainedKey = old?.canonicalKey || fresh.canonicalKey;
      freshKeys.add(retainedKey);
      if (!old) {
        next.push(fresh);
        continue;
      }
      consumedPreviousKeys.add(old.canonicalKey);
      if (old.canonicalKey !== fresh.canonicalKey) {
        next.push(old);
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
    } else if (status === 'skipped' || status == null || (status === 'partial' && !expired)) {
      // A store-scoped refresh must leave every unselected chain byte-for-byte
      // intact. A source truncated at its pagination cap is also not allowed to
      // withdraw still-valid offers that happened to fall outside that request.
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
