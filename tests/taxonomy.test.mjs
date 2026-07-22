import test from 'node:test';
import assert from 'node:assert/strict';
import { explainInChinese } from '../scripts/lib/explain-zh.mjs';
import { danishProductNameZh, specificDanishDescription } from '../scripts/lib/product-name-zh.mjs';
import { AARHUS_CATEGORIES, AARHUS_COMPARISON_GROUPS, classifyOffer, refineAarhusComparisonGroup } from '../scripts/lib/taxonomy.mjs';

test('places lower-priority flyer categories after everyday shopping categories', () => {
  assert.deepEqual(AARHUS_CATEGORIES.slice(-10).map(category => category.id), [
    'drinks', 'alcohol', 'pet', 'flowers_plants', 'home_kitchen',
    'electronics', 'clothing', 'leisure', 'tobacco_nicotine', 'other_offers',
  ]);
});

test('keeps both zero-sugar and ordinary soda', () => {
  assert.deepEqual(classifyOffer({ heading:'Coca-Cola Zero 6 x 1,5 L' }), { categoryId:'drinks', comparisonGroup:'zero_soda' });
  assert.deepEqual(classifyOffer({ heading:'Pepsi Max 1,5 L' }), { categoryId:'drinks', comparisonGroup:'drink_soda' });
});

test('groups comparable chicken thighs', () => {
  const result = classifyOffer({ heading:'Kyllingeoverlår uden ben' });
  assert.deepEqual(result, { categoryId:'chicken', comparisonGroup:'chicken_thigh' });
});

test('keeps prepared chicken and formed beef products out of raw meat aisles', () => {
  const expected = new Map([
    ['SOL&MAR Kyllingevinger', ['prepared_meat', 'prepared_chicken_wings_seasoned']],
    ['ROSE Buffalo Wings', ['prepared_meat', 'prepared_chicken_wings_seasoned']],
    ['ROSE Hotwings', ['prepared_meat', 'prepared_chicken_wings_seasoned']],
    ['Morliny classic eller crispy hot wings', ['prepared_meat', 'prepared_chicken_wings_mixed_offer']],
    ['Løgismose marineret kyllingebryst', ['prepared_meat', 'prepared_chicken_breast_marinated']],
    ['MADVÆRKET Burgerbøffer af oksekød', ['prepared_meat', 'prepared_beef_burgers']],
  ]);
  for (const [heading, [categoryId, comparisonGroup]] of expected) {
    assert.deepEqual(classifyOffer({ heading }), { categoryId, comparisonGroup }, heading);
  }
  assert.equal(AARHUS_COMPARISON_GROUPS.prepared_chicken_wings_mixed_offer.comparable, false);
});

test('keeps clearly marinated or cooked pork, beef, and lamb out of fresh meat aisles', () => {
  const expected = new Map([
    ['Velsmag marineret kotelet', 'prepared_pork_marinated'],
    ['Pulled pork', 'prepared_pork_cooked'],
    ['Tulip pulled pork eller spareribs', 'prepared_pork_mixed_offer'],
    ['Marinerede flanksteak med chimichurri', 'prepared_beef_marinated'],
    ['Coop marineret lammeculotte', 'prepared_lamb_marinated'],
  ]);
  for (const [heading, comparisonGroup] of expected) {
    const result = classifyOffer({ heading });
    assert.equal(result.categoryId, 'prepared_meat', heading);
    assert.equal(result.comparisonGroup, comparisonGroup, heading);
  }
});

test('uses product form before incidental meat, fish, fruit, and paper words', () => {
  assert.deepEqual(classifyOffer({ heading:'REMA 1000 Fiskefars' }), { categoryId:'seafood', comparisonGroup:'fish_mince' });
  assert.deepEqual(classifyOffer({ heading:'Ribena solbær' }), { categoryId:'drinks', comparisonGroup:'drink_concentrate' });
  assert.deepEqual(classifyOffer({ heading:'LUPILU Vådservietter' }), { categoryId:'paper_products', comparisonGroup:'paper_wet_wipes' });
  assert.deepEqual(classifyOffer({ heading:'REMA 1000 Lommeletter eller ansigtsservietter' }), { categoryId:'paper_products', comparisonGroup:'paper_facial' });
  assert.equal(classifyOffer({ heading:'Hatting Burgerboller eller hotdogbrød' }).categoryId, 'bread_bakery');
});

test('separates turkey species, body parts, mince, and processed products', () => {
  const expected = new Map([
    ['Kalkunbrystfilet', 'turkey_breast'],
    ['Kalkunschnitzler af brystfilet', 'turkey_breast'],
    ['Kalkunstrimler af brystfilet', 'turkey_breast'],
    ['Kalkununderlår', 'turkey_thigh'],
    ['Hakket kalkunkød', 'turkey_minced'],
    ['GRILLMESTER Kalkunhakkebøffer', 'prepared_turkey'],
    ['Cordon bleu af kalkun', 'prepared_turkey'],
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
    ['REMA 1000 Dansk grisemørbrad eller ovnklar ribbensteg', 'prepared_pork_mixed_offer'],
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
    categoryId:'household_paper', comparisonGroup:'trash_bags',
  });
  assert.deepEqual(classifyOffer({ heading:'Änglamark skumklude eller babypads' }), {
    categoryId:'baby', comparisonGroup:'baby_care',
  });
  assert.deepEqual(classifyOffer({ heading:'Husholdningsmarked', description:'opvaskebørste og fryseposer' }), {
    categoryId:'household_cleaning', comparisonGroup:'cleaning',
  });
});

test('only actual mushrooms enter the mushroom comparison group', () => {
  assert.deepEqual(classifyOffer({ heading:'Coop hvide champignoner 350 g' }), {
    categoryId:'vegetables', comparisonGroup:'mushrooms',
  });
  assert.notEqual(classifyOffer({ heading:'Husholdningsmarked med rengøringssvampe og kost' })?.comparisonGroup, 'mushrooms');
});

test('classifies non-food and formerly excluded flyer products', () => {
  assert.deepEqual(classifyOffer({ heading:'Royal eller Heineken øl 6 x 33 cl' }), { categoryId:'alcohol', comparisonGroup:'alcohol_beer' });
  assert.deepEqual(classifyOffer({ heading:'Capri-Sun 10 x 20 cl' }), { categoryId:'drinks', comparisonGroup:'drink_other' });
  assert.deepEqual(classifyOffer({ heading:'T-shirt 2 stk.' }), { categoryId:'clothing', comparisonGroup:'clothing_adult_tops' });
  assert.deepEqual(classifyOffer({ heading:'Ukendt tilbud 500 g' }), { categoryId:'other_offers', comparisonGroup:'other_offer' });
});

test('classifies durable and pet products before incidental grocery words', () => {
  const expected = new Map([
    ['LED pære classic 60W E27 Warm Glow', ['electronics', 'electronics_lighting']],
    ['PHILIPS Brødrister', ['home_kitchen', 'home_appliances']],
    ['LIVARNO Skoreol', ['home_kitchen', 'home_storage']],
    ['SILVERCREST Gryde, kasserolle eller mælkegryde af stål', ['home_kitchen', 'home_cookware']],
    ['Godbidder t. kat m. laks', ['pet', 'pet_cat']],
    ['Andekødsstrimler t. hund eller Kyllingestrimler', ['pet', 'pet_dog']],
  ]);
  for (const [heading, [categoryId, comparisonGroup]] of expected) {
    assert.deepEqual(classifyOffer({ heading, description: '1 stk' }), { categoryId, comparisonGroup }, heading);
  }
});

test('handles newly reviewed Wolt and mixed-choice product identities before ingredients', () => {
  assert.deepEqual(classifyOffer({ heading: 'Bananer 5 stk.', description: '5 stk' }), { categoryId: 'fruit', comparisonGroup: 'bananas' });
  assert.deepEqual(classifyOffer({ heading: 'Burger Boost original eller smoky twist', description: '4 stk' }), { categoryId: 'prepared_meat', comparisonGroup: 'beef_burgers' });
  assert.deepEqual(classifyOffer({ heading: 'VITA D’OR Solsikke- eller rapsolie', description: '1 l' }), { categoryId: 'cooking_oils', comparisonGroup: 'oil_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: '3 FRIKADELLER, 3 FISKEFILET ELLER 3 SKIVER KAMSTEG', description: '' }), { categoryId: 'prepared_meat', comparisonGroup: 'mixed_grocery_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Mutti tomater eller pizzasauce', description: '' }), { categoryId: 'pantry', comparisonGroup: 'mixed_grocery_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Nektariner, ferskner, blommer eller abrikoser', description: '' }), { categoryId: 'fruit', comparisonGroup: 'mixed_stone_fruit' });
  assert.deepEqual(classifyOffer({ heading: 'OMHU MARINEREDE GRILLSPYD AF FRILANDSLAMMEKØD', description: '' }), { categoryId: 'prepared_meat', comparisonGroup: 'prepared_lamb_marinated' });
  assert.deepEqual(classifyOffer({ heading: 'Dansk kalve flanksteak', description: 'Alm. el. marinerede' }), { categoryId: 'prepared_meat', comparisonGroup: 'prepared_beef_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Danske svinekoteletter', description: 'Alm. el. marinerede' }), { categoryId: 'prepared_meat', comparisonGroup: 'prepared_pork_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'SAGRA/BUTCHERS Butterfly- eller yellow poussin', description: 'Marineret eller frilands' }), { categoryId: 'prepared_meat', comparisonGroup: 'prepared_poultry_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Pakkemarked - lige klar til grillen' }), { categoryId: 'prepared_meat', comparisonGroup: 'prepared_mixed_meat' });
  assert.deepEqual(classifyOffer({ heading: 'SOL&MAR Blæksprutteringe eller chorizo-kroketter' }), { categoryId: 'frozen_ready', comparisonGroup: 'mixed_grocery_offer' });
  assert.deepEqual(classifyOffer({ heading: 'MADVÆRKET Kyllingebrystfilet eller -lårmix', description: 'Med BBQ' }), { categoryId: 'prepared_meat', comparisonGroup: 'prepared_poultry_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'MCENNEDY Spareribs', description: 'Hot eller BBQ' }), { categoryId: 'prepared_meat', comparisonGroup: 'prepared_pork_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'OMHU CULOTTE AF FRILANDSLAMMEKØD', description: 'Med eller uden marinade af hvidløg og rosmarin' }), { categoryId: 'prepared_meat', comparisonGroup: 'prepared_mixed_meat' });
  assert.deepEqual(classifyOffer({ heading: 'Godt papir' }), { categoryId: 'paper_products', comparisonGroup: 'paper_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Lambi Classic papir' }), { categoryId: 'paper_products', comparisonGroup: 'paper_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Danskvand m. elektrolytter & ægte frugt eller', description: '330 ml' }), { categoryId: 'drinks', comparisonGroup: 'drink_water' });
});

test('splits breakfast and real pantry goods into specific groups', () => {
  assert.equal(classifyOffer({ heading:'Müsli med nødder 750 g' }).comparisonGroup, 'cereal');
  assert.equal(classifyOffer({ heading:'Hakkede tomater på dåse 400 g' }).comparisonGroup, 'canned_tomatoes');
  assert.equal(classifyOffer({ heading:'Olivenolie 1 L' }).comparisonGroup, 'oil_olive');
});

test('every comparison group has a useful Chinese explanation', () => {
  for (const comparisonGroup of Object.keys(AARHUS_COMPARISON_GROUPS)) {
    const explanation = explainInChinese({ heading:'测试商品' }, { comparisonGroup });
    assert.ok(explanation.length >= 18, `${comparisonGroup} explanation is too short`);
  }
});

test('product form wins over ingredient and flavour words', () => {
  assert.deepEqual(classifyOffer({ heading:'GELATELLI Jordbær- eller vaniljeis' }), {
    categoryId:'ice_cream', comparisonGroup:'ice_cream',
  });
  assert.equal(classifyOffer({ heading:'Bifa sandwich kiks med jordbær' }).comparisonGroup, 'biscuits');
  assert.equal(classifyOffer({ heading:'ALESTO Bananchips' }).comparisonGroup, 'chips');
  assert.equal(classifyOffer({ heading:'Frysetørrede hindbær' }).comparisonGroup, 'dried_fruit');
  assert.equal(classifyOffer({ heading:'Tomatsauce med basilikum' }).comparisonGroup, 'sauce_tomato');
  assert.equal(classifyOffer({ heading:'Nutella, Dumle karamel eller Marianne' }).comparisonGroup, 'spreads_jam');
  assert.equal(classifyOffer({ heading:'Danone Actimel eller yoghurt' }).comparisonGroup, 'yoghurt');
  assert.equal(classifyOffer({ heading:'Pizzamel 1 kg' }).comparisonGroup, 'flour_baking');
  assert.equal(classifyOffer({ heading:'Saltede karamelvafler' }).comparisonGroup, 'biscuits');
  assert.equal(classifyOffer({ heading:'Chili chips' }).comparisonGroup, 'chips');
  assert.deepEqual(classifyOffer({ heading:'Acer bærbar skærm' }), { categoryId:'electronics', comparisonGroup:'electronics_computer' });
  assert.deepEqual(classifyOffer({ heading:'Prosonic soundbar' }), { categoryId:'electronics', comparisonGroup:'electronics_audio' });
});

test('keeps ice cream, child clothing, bikes and chargers in their real product groups', () => {
  assert.deepEqual(classifyOffer({ heading:'Magnum, Minecraft eller Solero iskasse' }), {
    categoryId:'ice_cream', comparisonGroup:'ice_cream',
  });
  assert.deepEqual(classifyOffer({ heading:'Bluse', description:'Str. 134-170 cm, 100% bomuld' }), {
    categoryId:'clothing', comparisonGroup:'clothing_children_tops',
  });
  assert.deepEqual(classifyOffer({ heading:'T-shirt*', description:'Bomuld. Str. 98/104-122/128.' }), {
    categoryId:'clothing', comparisonGroup:'clothing_children_tops',
  });
  assert.deepEqual(classifyOffer({ heading:'Sneakers', description:'Str. 28-35' }), {
    categoryId:'clothing', comparisonGroup:'clothing_children_footwear',
  });
  assert.deepEqual(classifyOffer({ heading:'Adidas Tiro bukser', description:'Str. S-2XL' }), {
    categoryId:'clothing', comparisonGroup:'clothing_adult_bottoms',
  });
  assert.deepEqual(classifyOffer({ heading:'LUPILU Sweattrøje eller -bukser', description:'98/104-122/128. Frit valg.' }), {
    categoryId:'clothing', comparisonGroup:'clothing_mixed_offer',
  });
  assert.deepEqual(classifyOffer({ heading:'Sweatshirt eller -bukser', description:'S-2XL. Frit valg.' }), {
    categoryId:'clothing', comparisonGroup:'clothing_mixed_offer',
  });
  assert.deepEqual(classifyOffer({ heading:'E-Modern 7-U', description:'28” hjul. Shimano 7 indvendige gear. Aluminiumstel.' }), {
    categoryId:'leisure', comparisonGroup:'leisure_bicycles',
  });
  assert.deepEqual(classifyOffer({ heading:'WP21 lader til elbil' }), {
    categoryId:'electronics', comparisonGroup:'electronics_charging',
  });
});

test('separates cooked chicken, canned fish and exact raw chicken forms', () => {
  assert.deepEqual(classifyOffer({ heading:'Rose kyllingetopping' }), {
    categoryId:'prepared_meat', comparisonGroup:'prepared_chicken_cooked',
  });
  assert.deepEqual(classifyOffer({ heading:'Rahbek indbagt fisk' }), {
    categoryId:'seafood', comparisonGroup:'seafood_breaded',
  });
  assert.deepEqual(classifyOffer({ heading:'Glyngøre tun i vand el. olie' }), {
    categoryId:'seafood', comparisonGroup:'seafood_tuna_canned',
  });
  assert.deepEqual(classifyOffer({ heading:'Gestus Sild' }), {
    categoryId:'seafood', comparisonGroup:'seafood_herring_pickled',
  });
  assert.deepEqual(classifyOffer({ heading:'Hakket dansk kylling' }), {
    categoryId:'minced_meat', comparisonGroup:'chicken_minced',
  });
  assert.deepEqual(classifyOffer({ heading:'Himmerland Brystfilet af Dansk Kylling' }), {
    categoryId:'chicken', comparisonGroup:'chicken_breast',
  });
  assert.deepEqual(classifyOffer({ heading:'HIMMERLAND UNDERLÅR AF DANSK KYLLING' }), {
    categoryId:'chicken', comparisonGroup:'chicken_thigh',
  });
});

test('keeps food, flowers and appliances ahead of incidental container words', () => {
  assert.deepEqual(classifyOffer({ heading:'Grillspyd med Gris og Grøntsager' }), {
    categoryId:'prepared_meat', comparisonGroup:'prepared_pork_marinated',
  });
  assert.deepEqual(classifyOffer({ heading:'Salling eller Michelle Kristensen færdigret i glas' }), {
    categoryId:'frozen_ready', comparisonGroup:'ready_meal',
  });
  assert.deepEqual(classifyOffer({ heading:'Flerfarvet krysantemum i skål' }), {
    categoryId:'flowers_plants', comparisonGroup:'flower_bouquet',
  });
  assert.deepEqual(classifyOffer({ heading:'Salling glas blender' }), {
    categoryId:'home_kitchen', comparisonGroup:'home_appliances',
  });
  assert.deepEqual(classifyOffer({ heading:'SILVERCREST Bestikbakke' }), {
    categoryId:'home_kitchen', comparisonGroup:'home_storage',
  });
});

test('writes item-specific Chinese explanations with useful flyer facts', () => {
  const childName = danishProductNameZh('Bluse med korte ærmer', 'clothing_children_tops', 'Str. 134-170 cm. 100% bomuld.');
  const childDescription = specificDanishDescription('Bluse med korte ærmer', 'Str. 134-170 cm. 100% bomuld.', 'clothing_children_tops');
  assert.match(childName, /儿童.*上衣|儿童.*衬衫/);
  assert.match(childDescription, /134–170 cm 身高码/);
  assert.match(childDescription, /100% 棉/);
  assert.doesNotMatch(childDescription, /请确认|以原名为准/);

  const adultDescription = specificDanishDescription('Bukser', 'Normal talje. Wide fit. Normal længde. S-2XL.', 'clothing_adult_bottoms');
  assert.match(adultDescription, /尺码 S–2XL/);
  assert.doesNotMatch(adultDescription, /尺码 (?:S|L)。/);

  const vacuumDescription = specificDanishDescription('iRobot Robotstøvsuger', 'Støvsuger og mopper gulvet.', 'home_appliances');
  assert.match(vacuumDescription, /扫拖或扫地机器人/);
  assert.doesNotMatch(vacuumDescription, /家用小电器|购买前请确认/);

  const tvDescription = specificDanishDescription('Hisense 55” 4K Smart TV', '55” QLED. HDMI ARC.', 'electronics_tv');
  assert.match(tvDescription, /电视/);
  assert.match(tvDescription, /55 英寸屏幕/);
  assert.match(tvDescription, /HDMI ARC/);

  const bikeDescription = specificDanishDescription('E-Modern 7-U elcykel', '28” hjul. Shimano 7 indvendige gear. Aluminiumstel.', 'leisure_bicycles');
  assert.match(bikeDescription, /电助力自行车/);
  assert.match(bikeDescription, /28 英寸车轮/);
  assert.match(bikeDescription, /Shimano 7 速内变速/);
  assert.match(bikeDescription, /铝合金车架/);
});

test('rescues clearly identifiable products from the generic other-offers bucket', () => {
  const expected = new Map([
    ['Brother mekanisk symaskine', ['home_kitchen', 'home_appliances']],
    ['Danske radiser', ['vegetables', 'root_vegetables']],
    ['Økologisk rucola', ['vegetables', 'leafy_green']],
    ['Onsdagssnegl', ['bread_bakery', 'bread']],
    ['Ristet sesamolie', ['cooking_oils', 'oil_other']],
  ]);
  for (const [heading, [categoryId, comparisonGroup]] of expected) {
    assert.deepEqual(classifyOffer({ heading }), { categoryId, comparisonGroup }, heading);
  }
});

test('uses product identity rather than flavour words or brand fragments', () => {
  assert.deepEqual(classifyOffer({ heading:'AEG Ovn' }), { categoryId:'home_kitchen', comparisonGroup:'home_appliances' });
  assert.deepEqual(classifyOffer({ heading:'AEG Vaskemaskine' }), { categoryId:'home_kitchen', comparisonGroup:'home_appliances' });
  assert.equal(classifyOffer({ heading:'Grøn honningmelon Piel de Sapo' }).comparisonGroup, 'melon');
  assert.equal(classifyOffer({ heading:'BUTCHER S Oksesteak med peberkant' }).comparisonGroup, 'prepared_beef_marinated');
  assert.equal(classifyOffer({ heading:'Kyllingepopcorn' }).comparisonGroup, 'prepared_chicken_breaded');
  assert.equal(classifyOffer({ heading:'BUKO Flødeost' }).comparisonGroup, 'cheese_spreadable');
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
  assert.equal(classifyOffer({ heading:'HARVEST BASKET Pommes frites' }).comparisonGroup, 'potato_fries');
  assert.equal(classifyOffer({ heading:'Peka flødekartofler' }).comparisonGroup, 'potato_gratin');
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
  assert.equal(classifyOffer({ heading:'Lambi Premium toiletpapir' }).comparisonGroup, 'paper_toilet');
  assert.deepEqual(classifyOffer({ heading:'Wilfa kaffemaskine' }), { categoryId:'home_kitchen', comparisonGroup:'home_appliances' });
  assert.equal(classifyOffer({ heading:'Træstamme' }).comparisonGroup, 'biscuits');
  assert.equal(classifyOffer({ heading:'Merrild eller Lavazza helbønner' }).comparisonGroup, 'coffee_tea');
  assert.equal(classifyOffer({ heading:'REMA 1000 Vannameirejer eller tunsteak' }).comparisonGroup, 'seafood_mixed_offer');
});

test('splits overloaded parent categories into practical shopping aisles', () => {
  assert.equal(classifyOffer({ heading:'BUKO Flødeost' }).categoryId, 'cheese');
  assert.equal(classifyOffer({ heading:'Lurpak Smør' }).categoryId, 'butter_spreads');
  assert.equal(classifyOffer({ heading:'Merrild helbønner' }).categoryId, 'coffee_tea');
  assert.equal(classifyOffer({ heading:'Marabou chokolade' }).categoryId, 'candy_chocolate');
  assert.equal(classifyOffer({ heading:'Oreo cookies' }).categoryId, 'biscuits_cakes');
  assert.equal(classifyOffer({ heading:'Bacon i skiver' }).categoryId, 'bacon');
});

test('separates liver pate, bacon, sausages, sauces, oils, paper and potato forms', () => {
  const expected = new Map([
    ['Stryhns leverpostej', ['liver_pate', 'liver_pate']],
    ['Tulip bacon i skiver', ['bacon', 'bacon_sliced']],
    ['Xtra bacontern', ['bacon', 'bacon_pieces']],
    ['Bacon & cheddar griller', ['sausages', 'sausage_bacon']],
    ['Kyllingepølser', ['sausages', 'sausage_chicken']],
    ['Frankfurter', ['sausages', 'sausage_frankfurter']],
    ['Ketchup', ['sauces_condiments', 'sauce_ketchup']],
    ['Mayonnaise', ['sauces_condiments', 'sauce_mayonnaise']],
    ['Rapsolie', ['cooking_oils', 'oil_rapeseed']],
    ['Køkkenrulle', ['paper_products', 'paper_kitchen']],
    ['Lommetørklæder', ['paper_products', 'paper_facial']],
    ['Kartoffelrösti', ['potato_products', 'potato_hash_browns']],
  ]);
  for (const [heading, [categoryId, comparisonGroup]] of expected) {
    assert.deepEqual(classifyOffer({ heading }), { categoryId, comparisonGroup }, heading);
  }
  assert.notEqual(classifyOffer({ heading:'Pommes frites' }).comparisonGroup, classifyOffer({ heading:'Kartoffelrösti' }).comparisonGroup);
  assert.equal(classifyOffer({ heading:'K-SALAT Mayonnaise eller remoulade' }).comparisonGroup, 'sauce_mixed_offer');
  assert.equal(classifyOffer({ heading:'Kikkoman soya sauce' }).comparisonGroup, 'sauce_soy');
  assert.equal(classifyOffer({ heading:'Toiletpapir eller køkkenrulle' }).comparisonGroup, 'paper_mixed_offer');
  assert.equal(classifyOffer({ heading:'Rullepølse, hamburgerryg eller sennepsskinke' }).comparisonGroup, 'deli_mixed_offer');
  assert.equal(classifyOffer({ heading:'Tomatpuré eller pastasauce' }).comparisonGroup, 'mixed_grocery_offer');
  assert.equal(refineAarhusComparisonGroup('bacon_other', 'Tulip bacon 300 g. Skiver eller tern'), 'bacon_mixed_offer');
  assert.equal(refineAarhusComparisonGroup('sausage_other', 'Steff Houlberg pølser. Hotdog- eller grillpølser'), 'sausage_mixed_offer');
});

test('automatically separates mince, yoghurt, cold dairy, and cheese forms', () => {
  for (const heading of ['Hakket kyllingekød', 'Hakket kalkunkød', 'Hakket grisekød', 'Hakket oksekød', 'Hakket grise- og oksekød']) {
    assert.equal(classifyOffer({ heading }).categoryId, 'minced_meat', heading);
  }
  assert.equal(classifyOffer({ heading:'Skyr med vanilje' }).categoryId, 'yoghurt');
  assert.equal(classifyOffer({ heading:'Piskefløde 38%' }).categoryId, 'cream_cold_dairy');
  assert.equal(classifyOffer({ heading:'Klovborg Danbo skiveost' }).comparisonGroup, 'cheese_sliced');
  assert.equal(classifyOffer({ heading:'Karolines Køkken revet ost' }).comparisonGroup, 'cheese_grated');
  assert.equal(classifyOffer({ heading:'Milbona Mozzarella' }).comparisonGroup, 'cheese_mozzarella_burrata');
  assert.equal(classifyOffer({ heading:'Milbona Græsk feta' }).comparisonGroup, 'cheese_feta_white');
});

test('puts every offer with a purchasable ribeye choice in the ribeye aisle', () => {
  for (const heading of [
    "BUTCHER'S Rumpsteak eller entrecote",
    'REMA 1000 SUPREME Striploin, ribeye eller rumpsteak',
    'REMA 1000 SUPREME Striploin eller ribeye roast',
  ]) {
    assert.equal(classifyOffer({ heading }).comparisonGroup, 'beef_ribeye', heading);
  }
});
