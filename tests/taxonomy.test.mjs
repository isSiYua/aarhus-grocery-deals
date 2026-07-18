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

test('separates turkey species, body parts, mince, and processed products', () => {
  const expected = new Map([
    ['Kalkunbrystfilet', 'turkey_breast'],
    ['Kalkunschnitzler af brystfilet', 'turkey_breast'],
    ['Kalkunstrimler af brystfilet', 'turkey_breast'],
    ['Kalkununderlår', 'turkey_thigh'],
    ['Hakket kalkunkød', 'turkey_minced'],
    ['GRILLMESTER Kalkunhakkebøffer', 'turkey_processed'],
    ['Cordon bleu af kalkun', 'turkey_processed'],
    ['Kalkunoverlår eller -schnitzel af brystfilet', 'turkey_mixed_offer'],
  ]);
  for (const [heading, comparisonGroup] of expected) {
    assert.equal(classifyOffer({ heading }).comparisonGroup, comparisonGroup, heading);
  }
  assert.equal(AARHUS_COMPARISON_GROUPS.turkey_mixed_offer.comparable, false);
});

test('keeps cross-part and cross-species meat offers out of atomic lowest-price pools', () => {
  const expected = new Map([
    ['Xtra! kyllingelårmix eller Rose hakket kylling 3-7%', 'chicken_mixed_offer'],
    ['Kyllingelår, -spyd eller udbenede kyllingeoverlår', 'chicken_mixed_offer'],
    ['MADVÆRKET Kyllingevinger, -lårfilet, -underlår eller -overlår med ryg', 'chicken_mixed_offer'],
    ['Hakket grise- og kalvekød 8-12% eller hele kyllingelår', 'mixed_meat_offer'],
    ['REMA 1000 Dansk grisemørbrad eller ovnklar ribbensteg', 'pork_mixed_offer'],
    ['PremiuM roastbeef eller steak', 'beef_mixed_offer'],
    ['Coop varmrøget-, røget laks eller rejer', 'seafood_mixed_offer'],
    ['Xtra! tun eller Bonduelle majs', 'mixed_grocery_offer'],
  ]);
  for (const [heading, comparisonGroup] of expected) {
    const result = classifyOffer({ heading });
    assert.equal(result.comparisonGroup, comparisonGroup, heading);
    assert.equal(AARHUS_COMPARISON_GROUPS[comparisonGroup].comparable, false, heading);
  }
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

test('uses product identity rather than flavour words or brand fragments', () => {
  assert.equal(classifyOffer({ heading:'AEG Ovn' }), null);
  assert.equal(classifyOffer({ heading:'AEG Vaskemaskine' }), null);
  assert.equal(classifyOffer({ heading:'Grøn honningmelon Piel de Sapo' }).comparisonGroup, 'melon');
  assert.equal(classifyOffer({ heading:'BUTCHER S Oksesteak med peberkant' }).comparisonGroup, 'beef_steak');
  assert.equal(classifyOffer({ heading:'Kyllingepopcorn' }).comparisonGroup, 'chicken_breaded');
  assert.equal(classifyOffer({ heading:'BUKO Flødeost' }).comparisonGroup, 'cheese');
  assert.equal(classifyOffer({ heading:'HUSK kosttilskud eller mælkesyrebakterier' }).comparisonGroup, 'supplements');
  assert.equal(classifyOffer({ heading:'Nordthy Mini ris- eller majskiks' }).comparisonGroup, 'biscuits');
  assert.equal(classifyOffer({ heading:'Skagenfood koldrøget laks' }).comparisonGroup, 'salmon_smoked');
});

test('keeps size variants together but separates genuinely different potato forms', () => {
  for (const heading of ['Små kartofler', 'Store kartofler', 'Nye danske kartofler', 'Bagekartofler']) {
    assert.deepEqual(classifyOffer({ heading }), {
      categoryId: 'vegetables', comparisonGroup: 'potatoes_fresh',
    });
  }
  assert.equal(classifyOffer({ heading:'CHEF SELECT Kartoffelsalat' }).comparisonGroup, 'potato_salad');
  assert.equal(classifyOffer({ heading:'HARVEST BASKET Pommes frites' }).comparisonGroup, 'potato_sides');
  assert.equal(classifyOffer({ heading:'Peka flødekartofler' }).comparisonGroup, 'potato_sides');
});

test('splits actual species while keeping presentation variants together', () => {
  assert.equal(classifyOffer({ heading:'Purløg' }).comparisonGroup, 'chives');
  assert.equal(classifyOffer({ heading:'Basilikum' }).comparisonGroup, 'basil');
  assert.equal(classifyOffer({ heading:'Økologisk persille' }).comparisonGroup, 'parsley');
  assert.equal(classifyOffer({ heading:'Gulerødder med top' }).comparisonGroup, 'carrots');
  assert.equal(classifyOffer({ heading:'Små gulerødder 500 g' }).comparisonGroup, 'carrots');
  assert.equal(classifyOffer({ heading:'Broccoli' }).comparisonGroup, 'broccoli');
  assert.equal(classifyOffer({ heading:'Blomkål' }).comparisonGroup, 'cauliflower');
  assert.equal(classifyOffer({ heading:'Dansk spidskål' }).comparisonGroup, 'cabbage');
});

test('handles Danish compound words without classifying incidental fragments', () => {
  assert.equal(classifyOffer({ heading:'Lambi Premium toiletpapir' }).comparisonGroup, 'paper');
  assert.equal(classifyOffer({ heading:'Wilfa kaffemaskine' }), null);
  assert.equal(classifyOffer({ heading:'Træstamme' }).comparisonGroup, 'biscuits');
  assert.equal(classifyOffer({ heading:'Merrild eller Lavazza helbønner' }).comparisonGroup, 'coffee_tea');
  assert.equal(classifyOffer({ heading:'REMA 1000 Vannameirejer eller tunsteak' }).comparisonGroup, 'seafood_mixed_offer');
});
