export function isReviewedAarhusOffer(offer, taxonomy) {
  const fixedTaxonomy = taxonomy.entries?.[offer.descriptionKey];
  return offer.descriptionSource === 'codex_cache'
    && offer.taxonomyReviewStatus === 'reviewed'
    && fixedTaxonomy?.reviewStatus === 'reviewed'
    && fixedTaxonomy.status !== 'excluded';
}

export function isReviewedAtlantaOffer(offer, productKnowledge) {
  const fixed = productKnowledge.entries?.[offer.productKnowledgeKey];
  return offer.descriptionSource === 'codex_product_knowledge'
    && ['reviewed', 'codex_name_and_description_reviewed'].includes(fixed?.reviewStatus)
    && Boolean(fixed?.productNameZh)
    && Boolean(fixed?.descriptionZh);
}

export function retainReviewedOffers(offers, predicate) {
  const retained = [];
  const withheld = [];
  for (const offer of offers) (predicate(offer) ? retained : withheld).push(offer);
  return { retained, withheld };
}
