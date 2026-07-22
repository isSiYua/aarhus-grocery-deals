import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

test('product review consumes both description and taxonomy pending queues', async () => {
  const source = await fs.readFile(new URL('../scripts/codex-review-current-products.mjs', import.meta.url), 'utf8');

  assert.match(source, /pendingDescriptionsToReview\.items/);
  assert.match(source, /previousPendingTaxonomy\.items/);
  assert.match(source, /currentCategoryId/);
  assert.match(source, /currentComparisonGroup/);
  assert.match(source, /previous\.descriptionSpecVersion === next\.descriptionSpecVersion/);
  assert.match(source, /descriptionVersion: reviewed\.descriptionSpecVersion/);
});
