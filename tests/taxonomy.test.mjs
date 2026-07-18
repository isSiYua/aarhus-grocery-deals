import test from 'node:test';
import assert from 'node:assert/strict';
import { explainInChinese } from '../scripts/lib/explain-zh.mjs';
import { AARHUS_COMPARISON_GROUPS, classifyOffer } from '../scripts/lib/taxonomy.mjs';

test('keeps Coca-Cola Zero but excludes ordinary soda', () => {
  assert.equal(classifyOffer({ heading:'Coca-Cola Zero 6 x 1,5 L' }).categoryId, 'drinks');
  assert.equal(classifyOffer({ heading:'Pepsi Max 1,5 L' }), null);
});

test('groups comparable chicken thighs', () => {
  const result = classifyOffer({ heading:'Kyllingeoverlår uden ben' });
  assert.deepEqual(result, { categoryId:'chicken', comparisonGroup:'chicken_thigh' });
});

test('keeps household and baby goods out of food categories', () => {
  assert.deepEqual(classifyOffer({ heading:'Skrald-let affaldsposer ekstra stærke med snøreluk' }), {
    categoryId:'household', comparisonGroup:'trash_bags',
  });
  assert.deepEqual(classifyOffer({ heading:'Änglamark skumklude eller babypads' }), {
    categoryId:'baby', comparisonGroup:'baby_care',
  });
  assert.deepEqual(classifyOffer({ heading:'Husholdningsmarked', description:'opvaskebørste og fryseposer' }), {
    categoryId:'household', comparisonGroup:'cleaning',
  });
});

test('only actual mushrooms enter the mushroom comparison group', () => {
  assert.deepEqual(classifyOffer({ heading:'Coop hvide champignoner 350 g' }), {
    categoryId:'vegetables', comparisonGroup:'mushrooms',
  });
  assert.notEqual(classifyOffer({ heading:'Husholdningsmarked med rengøringssvampe og kost' })?.comparisonGroup, 'mushrooms');
});

test('does not treat package units as proof that an item is food', () => {
  assert.equal(classifyOffer({ heading:'Royal eller Heineken øl 6 x 33 cl' }), null);
  assert.equal(classifyOffer({ heading:'Capri-Sun 10 x 20 cl' }), null);
  assert.equal(classifyOffer({ heading:'T-shirt 2 stk.' }), null);
  assert.equal(classifyOffer({ heading:'Ukendt tilbud 500 g' }), null);
});

test('splits breakfast and real pantry goods into specific groups', () => {
  assert.equal(classifyOffer({ heading:'Müsli med nødder 750 g' }).comparisonGroup, 'cereal');
  assert.equal(classifyOffer({ heading:'Hakkede tomater på dåse 400 g' }).comparisonGroup, 'canned');
  assert.equal(classifyOffer({ heading:'Olivenolie 1 L' }).comparisonGroup, 'oil_vinegar');
});

test('every comparison group has a useful Chinese explanation', () => {
  for (const comparisonGroup of Object.keys(AARHUS_COMPARISON_GROUPS)) {
    const explanation = explainInChinese({ heading:'测试商品' }, { comparisonGroup });
    assert.ok(explanation.length >= 18, `${comparisonGroup} explanation is too short`);
  }
});

test('product form wins over ingredient and flavour words', () => {
  assert.deepEqual(classifyOffer({ heading:'GELATELLI Jordbær- eller vaniljeis' }), {
    categoryId:'frozen_ready', comparisonGroup:'ice_cream',
  });
  assert.equal(classifyOffer({ heading:'Bifa sandwich kiks med jordbær' }).comparisonGroup, 'biscuits');
  assert.equal(classifyOffer({ heading:'ALESTO Bananchips' }).comparisonGroup, 'chips');
  assert.equal(classifyOffer({ heading:'Frysetørrede hindbær' }).comparisonGroup, 'dried_fruit');
  assert.equal(classifyOffer({ heading:'Tomatsauce med basilikum' }).comparisonGroup, 'sauces');
  assert.equal(classifyOffer({ heading:'Nutella, Dumle karamel eller Marianne' }).comparisonGroup, 'spreads_jam');
  assert.equal(classifyOffer({ heading:'Danone Actimel eller yoghurt' }).comparisonGroup, 'yoghurt');
  assert.equal(classifyOffer({ heading:'Pizzamel 1 kg' }).comparisonGroup, 'flour_baking');
  assert.equal(classifyOffer({ heading:'Saltede karamelvafler' }).comparisonGroup, 'biscuits');
  assert.equal(classifyOffer({ heading:'Chili chips' }).comparisonGroup, 'chips');
  assert.equal(classifyOffer({ heading:'Acer bærbar skærm' }), null);
  assert.equal(classifyOffer({ heading:'Prosonic soundbar' }), null);
});
