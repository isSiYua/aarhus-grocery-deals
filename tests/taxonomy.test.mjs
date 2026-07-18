import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyOffer } from '../scripts/lib/taxonomy.mjs';

test('keeps Coca-Cola Zero but excludes ordinary soda', () => {
  assert.equal(classifyOffer({ heading:'Coca-Cola Zero 6 x 1,5 L' }).categoryId, 'drinks');
  assert.equal(classifyOffer({ heading:'Pepsi Max 1,5 L' }), null);
});

test('groups comparable chicken thighs', () => {
  const result = classifyOffer({ heading:'Kyllingeoverlår uden ben' });
  assert.deepEqual(result, { categoryId:'chicken', comparisonGroup:'chicken_thigh' });
});
