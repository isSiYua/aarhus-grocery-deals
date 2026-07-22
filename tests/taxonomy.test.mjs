import test from 'node:test';
import assert from 'node:assert/strict';
import { explainInChinese } from '../scripts/lib/explain-zh.mjs';
import { danishProductNameZh, specificDanishDescription } from '../scripts/lib/product-name-zh.mjs';
import { AARHUS_CATEGORIES, AARHUS_COMPARISON_GROUPS, classifyOffer, refineAarhusComparisonGroup } from '../scripts/lib/taxonomy.mjs';

test('places lower-priority flyer categories after everyday shopping categories', () => {
  assert.deepEqual(AARHUS_CATEGORIES.slice(-10).map(category => category.id), [
    'clothing_footwear_accessories', 'clothing_children', 'clothing_mixed',
    'leisure_toys_play', 'leisure_stationery_learning', 'leisure_cycling',
    'leisure_sports_outdoors', 'leisure_other', 'tobacco_nicotine', 'other_offers',
  ]);
});

test('keeps both zero-sugar and ordinary soda', () => {
  assert.deepEqual(classifyOffer({ heading:'Coca-Cola Zero 6 x 1,5 L' }), { categoryId:'soft_drinks', comparisonGroup:'zero_soda' });
  assert.deepEqual(classifyOffer({ heading:'Pepsi Max 1,5 L' }), { categoryId:'soft_drinks', comparisonGroup:'drink_soda' });
});

test('groups comparable chicken thighs', () => {
  const result = classifyOffer({ heading:'Kyllingeoverlår uden ben' });
  assert.deepEqual(result, { categoryId:'chicken', comparisonGroup:'chicken_thigh' });
});

test('keeps prepared chicken and formed beef products out of raw meat aisles', () => {
  const expected = new Map([
    ['SOL&MAR Kyllingevinger', ['prepared_poultry', 'prepared_chicken_wings_seasoned']],
    ['ROSE Buffalo Wings', ['prepared_poultry', 'prepared_chicken_wings_seasoned']],
    ['ROSE Hotwings', ['prepared_poultry', 'prepared_chicken_wings_seasoned']],
    ['Morliny classic eller crispy hot wings', ['prepared_poultry', 'prepared_chicken_wings_mixed_offer']],
    ['Løgismose marineret kyllingebryst', ['prepared_poultry', 'prepared_chicken_breast_marinated']],
    ['MADVÆRKET Burgerbøffer af oksekød', ['prepared_beef_lamb', 'prepared_beef_burgers']],
  ]);
  for (const [heading, [categoryId, comparisonGroup]] of expected) {
    assert.deepEqual(classifyOffer({ heading }), { categoryId, comparisonGroup }, heading);
  }
  assert.equal(AARHUS_COMPARISON_GROUPS.prepared_chicken_wings_mixed_offer.comparable, false);
});

test('keeps clearly marinated or cooked pork, beef, and lamb out of fresh meat aisles', () => {
  const expected = new Map([
    ['Velsmag marineret kotelet', ['prepared_pork', 'prepared_pork_marinated']],
    ['Pulled pork', ['prepared_pork', 'prepared_pork_cooked']],
    ['Tulip pulled pork eller spareribs', ['prepared_pork', 'prepared_pork_mixed_offer']],
    ['Marinerede flanksteak med chimichurri', ['prepared_beef_lamb', 'prepared_beef_marinated']],
    ['Coop marineret lammeculotte', ['prepared_beef_lamb', 'prepared_lamb_marinated']],
  ]);
  for (const [heading, [categoryId, comparisonGroup]] of expected) {
    const result = classifyOffer({ heading });
    assert.equal(result.categoryId, categoryId, heading);
    assert.equal(result.comparisonGroup, comparisonGroup, heading);
  }
});

test('uses product form before incidental meat, fish, fruit, and paper words', () => {
  assert.deepEqual(classifyOffer({ heading:'REMA 1000 Fiskefars' }), { categoryId:'seafood', comparisonGroup:'fish_mince' });
  assert.deepEqual(classifyOffer({ heading:'Ribena solbær' }), { categoryId:'juice_drinks', comparisonGroup:'drink_concentrate' });
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
  assert.deepEqual(classifyOffer({ heading:'Royal eller Heineken øl 6 x 33 cl' }), { categoryId:'alcohol_beer', comparisonGroup:'alcohol_beer' });
  assert.deepEqual(classifyOffer({ heading:'Capri-Sun 10 x 20 cl' }), { categoryId:'other_drinks', comparisonGroup:'drink_other' });
  assert.deepEqual(classifyOffer({ heading:'T-shirt 2 stk.' }), { categoryId:'clothing_adult', comparisonGroup:'clothing_adult_tops' });
  assert.deepEqual(classifyOffer({ heading:'Ukendt tilbud 500 g' }), { categoryId:'other_offers', comparisonGroup:'other_offer' });
});

test('classifies durable and pet products before incidental grocery words', () => {
  const expected = new Map([
    ['LED pære classic 60W E27 Warm Glow', ['electronics_other', 'electronics_lighting']],
    ['PHILIPS Brødrister', ['home_appliances', 'home_appliances']],
    ['LIVARNO Skoreol', ['home_storage', 'home_storage']],
    ['SILVERCREST Gryde, kasserolle eller mælkegryde af stål', ['kitchenware', 'home_cookware']],
    ['Godbidder t. kat m. laks', ['pet', 'pet_cat']],
    ['Andekødsstrimler t. hund eller Kyllingestrimler', ['pet', 'pet_dog']],
  ]);
  for (const [heading, [categoryId, comparisonGroup]] of expected) {
    assert.deepEqual(classifyOffer({ heading, description: '1 stk' }), { categoryId, comparisonGroup }, heading);
  }
});

test('handles newly reviewed Wolt and mixed-choice product identities before ingredients', () => {
  assert.deepEqual(classifyOffer({ heading: 'Bananer 5 stk.', description: '5 stk' }), { categoryId: 'fruit', comparisonGroup: 'bananas' });
  assert.deepEqual(classifyOffer({ heading: 'Burger Boost original eller smoky twist', description: '4 stk' }), { categoryId: 'prepared_beef_lamb', comparisonGroup: 'beef_burgers' });
  assert.deepEqual(classifyOffer({ heading: 'VITA D’OR Solsikke- eller rapsolie', description: '1 l' }), { categoryId: 'cooking_oils', comparisonGroup: 'oil_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: '3 FRIKADELLER, 3 FISKEFILET ELLER 3 SKIVER KAMSTEG', description: '' }), { categoryId: 'prepared_meat_mixed', comparisonGroup: 'mixed_grocery_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Mutti tomater eller pizzasauce', description: '' }), { categoryId: 'pantry', comparisonGroup: 'mixed_grocery_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Nektariner, ferskner, blommer eller abrikoser', description: '' }), { categoryId: 'fruit', comparisonGroup: 'mixed_stone_fruit' });
  assert.deepEqual(classifyOffer({ heading: 'OMHU MARINEREDE GRILLSPYD AF FRILANDSLAMMEKØD', description: '' }), { categoryId: 'prepared_beef_lamb', comparisonGroup: 'prepared_lamb_marinated' });
  assert.deepEqual(classifyOffer({ heading: 'Dansk kalve flanksteak', description: 'Alm. el. marinerede' }), { categoryId: 'prepared_beef_lamb', comparisonGroup: 'prepared_beef_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Danske svinekoteletter', description: 'Alm. el. marinerede' }), { categoryId: 'prepared_pork', comparisonGroup: 'prepared_pork_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'SAGRA/BUTCHERS Butterfly- eller yellow poussin', description: 'Marineret eller frilands' }), { categoryId: 'prepared_poultry', comparisonGroup: 'prepared_poultry_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Pakkemarked - lige klar til grillen' }), { categoryId: 'prepared_meat_mixed', comparisonGroup: 'prepared_mixed_meat' });
  assert.deepEqual(classifyOffer({ heading: 'SOL&MAR Blæksprutteringe eller chorizo-kroketter' }), { categoryId: 'frozen_other', comparisonGroup: 'mixed_grocery_offer' });
  assert.deepEqual(classifyOffer({ heading: 'MADVÆRKET Kyllingebrystfilet eller -lårmix', description: 'Med BBQ' }), { categoryId: 'prepared_poultry', comparisonGroup: 'prepared_poultry_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'MCENNEDY Spareribs', description: 'Hot eller BBQ' }), { categoryId: 'prepared_pork', comparisonGroup: 'prepared_pork_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'OMHU CULOTTE AF FRILANDSLAMMEKØD', description: 'Med eller uden marinade af hvidløg og rosmarin' }), { categoryId: 'prepared_meat_mixed', comparisonGroup: 'prepared_mixed_meat' });
  assert.deepEqual(classifyOffer({ heading: 'Godt papir' }), { categoryId: 'paper_products', comparisonGroup: 'paper_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Lambi Classic papir' }), { categoryId: 'paper_products', comparisonGroup: 'paper_mixed_offer' });
  assert.deepEqual(classifyOffer({ heading: 'Danskvand m. elektrolytter & ægte frugt eller', description: '330 ml' }), { categoryId: 'soft_drinks', comparisonGroup: 'drink_water' });
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
  assert.deepEqual(classifyOffer({ heading:'Acer bærbar skærm' }), { categoryId:'electronics_computing', comparisonGroup:'electronics_monitor' });
  assert.deepEqual(classifyOffer({ heading:'Prosonic soundbar' }), { categoryId:'electronics_tv_audio', comparisonGroup:'electronics_audio' });
});

test('product identity beats incidental charger, phone, and alcohol brand words', () => {
  assert.deepEqual(classifyOffer({
    heading: 'Børne gamerstol',
    description: 'RGB-lyset kræver strøm via usb-kabel eller powerbank',
  }), { categoryId: 'home_furniture', comparisonGroup: 'home_furniture' });
  assert.deepEqual(classifyOffer({
    heading: 'Acer PM1 Series 15,6” bærbar touch skærm',
    description: 'USB-C til computer, smartphone eller tablet',
  }), { categoryId: 'electronics_computing', comparisonGroup: 'electronics_monitor' });
  assert.deepEqual(classifyOffer({ heading: 'Targus 2-i-1 stylus pen' }), {
    categoryId: 'electronics_computing', comparisonGroup: 'electronics_computer_accessory',
  });
  assert.deepEqual(classifyOffer({ heading: 'Coca-Cola, Fanta, Tuborg Squash eller Schweppes' }), {
    categoryId: 'soft_drinks', comparisonGroup: 'drink_soda',
  });
  assert.deepEqual(classifyOffer({ heading: 'Baileys is eller Triple Chocolate' }), {
    categoryId: 'ice_cream', comparisonGroup: 'ice_cream',
  });
  assert.deepEqual(classifyOffer({ heading: 'SILVERCREST Elkedel eller smoothie maker' }), {
    categoryId: 'home_appliances', comparisonGroup: 'home_appliances',
  });
  assert.deepEqual(classifyOffer({ heading: 'Nye lammefjords-kartofler' }), {
    categoryId: 'vegetables', comparisonGroup: 'potatoes_fresh',
  });
  assert.deepEqual(classifyOffer({ heading: 'Depend neglefil eller Kiss naturlige vipper' }), {
    categoryId: 'personal_oral_beauty', comparisonGroup: 'personal_makeup',
  });
  assert.deepEqual(classifyOffer({ heading: 'Murph proteinbar med kreatin' }), {
    categoryId: 'personal_health', comparisonGroup: 'supplement_sports_snack',
  });
  assert.deepEqual(classifyOffer({ heading: 'Surdejspizza prosciutto eller diavola' }), {
    categoryId: 'pizza_dumplings', comparisonGroup: 'pizza_snacks',
  });
  assert.deepEqual(classifyOffer({ heading: 'Realme C100 5G 128GB' }), {
    categoryId: 'electronics_mobile', comparisonGroup: 'electronics_mobile',
  });
  assert.equal(danishProductNameZh('Samsung Galaxy A11+ Android tablet', 'electronics_mobile'), '平板电脑');
  assert.equal(danishProductNameZh('HP stationær PC', 'electronics_computer'), '台式电脑');
});

test('named drinks, wines, supplements, meals, and electronics receive item-specific Chinese text', () => {
  assert.match(danishProductNameZh('Faxe Kondi eller Pepsi Max sodavand', 'drink_soda'), /无糖可乐.*柠檬青柠|柠檬青柠.*无糖可乐/);
  assert.match(specificDanishDescription('Faxe Kondi eller Pepsi Max sodavand', '', 'drink_soda'), /柠檬青柠味/);
  assert.match(specificDanishDescription('🇪🇸 Rueda Verdejo 11%', '750 ml', 'alcohol_wine_white'), /柠檬.*草本香/);
  assert.match(specificDanishDescription('Jack Daniels 40%', '700 ml', 'alcohol_spirits'), /焦糖.*香草.*橡木/);
  assert.match(specificDanishDescription('SOL&MAR Gazpacho', '1 l', 'ready_meal'), /冷番茄蔬菜汤/);
  assert.match(specificDanishDescription('Murph whey med kreatin', 'Vanilla eller cocoa', 'supplements'), /香草或可可/);
  assert.match(danishProductNameZh('Targus computertaske 15.6”', 'electronics_computer_accessory'), /笔记本电脑包/);
  assert.match(danishProductNameZh('Depend neglefil eller Kiss naturlige vipper', 'personal_makeup'), /美甲锉.*假睫毛/);
  assert.match(specificDanishDescription('Murph proteinbar med kreatin', '', 'supplement_sports_snack'), /肌酸.*蛋白质/);
  assert.match(specificDanishDescription('Breezer, Somersby, Schweppes tonic el. Red Bull energidrik', '', 'other_offer'), /预调酒.*苹果酒.*汤力水.*能量饮料/);
  assert.match(danishProductNameZh('Pudebamse / Bamse', 'leisure_toys'), /毛绒/);
  assert.match(specificDanishDescription('Pudebamse / Bamse', '60 cm. 80 cm.', 'leisure_toys'), /毛绒玩具.*不是被子或枕芯/);
  assert.match(danishProductNameZh('Boost-my-bag nøglering', 'leisure_other'), /钥匙扣/);
  assert.match(specificDanishDescription('Boost-my-bag nøglering', '', 'leisure_other'), /挂在书包.*不是书包本体/);
  assert.match(danishProductNameZh('Pokémon mini taske*', 'leisure_bags'), /宝可梦.*迷你随身包/);
  assert.match(specificDanishDescription('Pokémon mini taske*', '10,5 x 8,5 cm.', 'leisure_bags'), /硬币.*钥匙.*耳机/);
  assert.match(specificDanishDescription('San Felice Campogiovanni Brunello', 'Italien. Rødvin.', 'alcohol_wine_red'), /酸樱桃.*烟草.*单宁/);
  assert.match(specificDanishDescription('Spiritusmarked', 'Absolut Vodka, Beefeater Gin eller Havana Club rom.', 'alcohol_spirits'), /Absolut.*伏特加.*金酒.*朗姆酒/);
});

test('keeps ice cream, child clothing, bikes and chargers in their real product groups', () => {
  assert.deepEqual(classifyOffer({ heading:'Magnum, Minecraft eller Solero iskasse' }), {
    categoryId:'ice_cream', comparisonGroup:'ice_cream',
  });
  assert.deepEqual(classifyOffer({ heading:'Bluse', description:'Str. 134-170 cm, 100% bomuld' }), {
    categoryId:'clothing_children', comparisonGroup:'clothing_children_tops',
  });
  assert.deepEqual(classifyOffer({ heading:'T-shirt*', description:'Bomuld. Str. 98/104-122/128.' }), {
    categoryId:'clothing_children', comparisonGroup:'clothing_children_tops',
  });
  assert.deepEqual(classifyOffer({ heading:'Sneakers', description:'Str. 28-35' }), {
    categoryId:'clothing_children', comparisonGroup:'clothing_children_footwear',
  });
  assert.deepEqual(classifyOffer({ heading:'Adidas Tiro bukser', description:'Str. S-2XL' }), {
    categoryId:'clothing_adult', comparisonGroup:'clothing_adult_bottoms',
  });
  assert.deepEqual(classifyOffer({ heading:'LUPILU Sweattrøje eller -bukser', description:'98/104-122/128. Frit valg.' }), {
    categoryId:'clothing_mixed', comparisonGroup:'clothing_mixed_offer',
  });
  assert.deepEqual(classifyOffer({ heading:'Sweatshirt eller -bukser', description:'S-2XL. Frit valg.' }), {
    categoryId:'clothing_mixed', comparisonGroup:'clothing_mixed_offer',
  });
  assert.deepEqual(classifyOffer({ heading:'E-Modern 7-U', description:'28” hjul. Shimano 7 indvendige gear. Aluminiumstel.' }), {
    categoryId:'leisure_cycling', comparisonGroup:'leisure_bicycles',
  });
  assert.deepEqual(classifyOffer({ heading:'WP21 lader til elbil' }), {
    categoryId:'electronics_mobile', comparisonGroup:'electronics_charging',
  });
});

test('separates cooked chicken, canned fish and exact raw chicken forms', () => {
  assert.deepEqual(classifyOffer({ heading:'Rose kyllingetopping' }), {
    categoryId:'prepared_poultry', comparisonGroup:'prepared_chicken_cooked',
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
    categoryId:'prepared_pork', comparisonGroup:'prepared_pork_marinated',
  });
  assert.deepEqual(classifyOffer({ heading:'Salling eller Michelle Kristensen færdigret i glas' }), {
    categoryId:'ready_meals', comparisonGroup:'ready_meal',
  });
  assert.deepEqual(classifyOffer({ heading:'Flerfarvet krysantemum i skål' }), {
    categoryId:'flowers_plants', comparisonGroup:'flower_bouquet',
  });
  assert.deepEqual(classifyOffer({ heading:'Salling glas blender' }), {
    categoryId:'home_appliances', comparisonGroup:'home_appliances',
  });
  assert.deepEqual(classifyOffer({ heading:'SILVERCREST Bestikbakke' }), {
    categoryId:'home_storage', comparisonGroup:'home_storage',
  });
  assert.deepEqual(classifyOffer({ heading:'Dåselåg med sugerør' }), {
    categoryId:'kitchenware', comparisonGroup:'home_tableware',
  });
  assert.deepEqual(classifyOffer({ heading:'Steamcleaner' }), {
    categoryId:'home_appliances', comparisonGroup:'home_appliances',
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

  assert.match(danishProductNameZh('ESMARA KIDS Croptop', 'clothing_children_tops', '2-pak.'), /儿童短款背心/);
  assert.match(danishProductNameZh('ESMARA KIDS Stroptop', 'clothing_children_tops', '2-pak.'), /儿童细肩带背心/);
  assert.match(specificDanishDescription('Steamcleaner', '', 'home_appliances'), /4 bar/);
  assert.match(specificDanishDescription('Steamcleaner', '', 'home_appliances'), /1500 W/);

  assert.equal(danishProductNameZh('ESMARA KIDS Croptop', 'clothing_children_underwear', '2-pak.'), '儿童短款背心');
  assert.equal(danishProductNameZh('Ballerina til børn', 'clothing_children_footwear', '22-27.'), '儿童芭蕾平底鞋');
  assert.equal(danishProductNameZh('Colgate tandpasta', 'personal_oral_care', '75 ml'), '牙膏');
  assert.equal(danishProductNameZh('Oral-B Eltandbørste', 'personal_appliances', 'Model: Pro 1'), '电动牙刷');
  assert.equal(danishProductNameZh('dreame Hårtørrer', 'personal_appliances', '4 temperaturindstillinger'), '吹风机');
  assert.equal(danishProductNameZh('Friends Body 3-pak', 'clothing_children_underwear', 'Str. 50/56-86/92'), '儿童婴幼儿连体衣');
  assert.equal(danishProductNameZh('Gum soft picks pro', 'personal_oral_care', '60 stk.'), '齿间清洁棒');
  assert.equal(danishProductNameZh('Jean Marie Garnier Bag-in-Box', 'alcohol_wine_red', '3 liter rødvin'), '红葡萄酒');
  assert.doesNotMatch(danishProductNameZh('Bukser', 'clothing_adult_bottoms', 'S-2XL'), /Bukser|（/);
});

test('splits personal care and child clothing by actual use', () => {
  assert.deepEqual(classifyOffer({ heading:'Colgate tandpasta' }), {
    categoryId:'personal_oral_beauty', comparisonGroup:'personal_oral_care',
  });
  assert.deepEqual(classifyOffer({ heading:'Oral-B Eltandbørste' }), {
    categoryId:'personal_oral_beauty', comparisonGroup:'personal_appliances',
  });
  assert.deepEqual(classifyOffer({ heading:'Garnier Micellar water eller ansigtscreme' }), {
    categoryId:'personal_hair_body', comparisonGroup:'personal_skin_care',
  });
  assert.deepEqual(classifyOffer({ heading:'Ballerina til børn' }), {
    categoryId:'clothing_children', comparisonGroup:'clothing_children_footwear',
  });
  assert.deepEqual(classifyOffer({ heading:'Gum soft picks pro' }), {
    categoryId:'personal_oral_beauty', comparisonGroup:'personal_oral_care',
  });
  assert.deepEqual(classifyOffer({ heading:'Insektstik-healer' }), {
    categoryId:'personal_health', comparisonGroup:'personal_health_devices',
  });
  assert.deepEqual(classifyOffer({ heading:'Foldbar strandmåtte med ryglæn' }), {
    categoryId:'leisure_sports_outdoors', comparisonGroup:'leisure_camping',
  });
  assert.equal(danishProductNameZh('Foldbar strandmåtte med ryglæn', 'leisure_camping'), '带靠背折叠沙滩垫');
});

test('rescues clearly identifiable products from the generic other-offers bucket', () => {
  const expected = new Map([
    ['Brother mekanisk symaskine', ['home_appliances', 'home_appliances']],
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
  assert.deepEqual(classifyOffer({ heading:'AEG Ovn' }), { categoryId:'home_appliances', comparisonGroup:'home_appliances' });
  assert.deepEqual(classifyOffer({ heading:'AEG Vaskemaskine' }), { categoryId:'home_appliances', comparisonGroup:'home_appliances' });
  assert.equal(classifyOffer({ heading:'Grøn honningmelon Piel de Sapo' }).comparisonGroup, 'melon');
  assert.equal(classifyOffer({ heading:'BUTCHER S Oksesteak med peberkant' }).comparisonGroup, 'prepared_beef_marinated');
  assert.equal(classifyOffer({ heading:'Kyllingepopcorn' }).comparisonGroup, 'prepared_chicken_breaded');
  assert.equal(classifyOffer({ heading:'BUKO Flødeost' }).comparisonGroup, 'cheese_spreadable');
  assert.deepEqual(classifyOffer({ heading:'Slikærter', description:'Danske 125 g' }), { categoryId:'vegetables', comparisonGroup:'peas' });
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
  assert.deepEqual(classifyOffer({ heading:'Wilfa kaffemaskine' }), { categoryId:'home_appliances', comparisonGroup:'home_appliances' });
  assert.equal(classifyOffer({ heading:'Træstamme' }).comparisonGroup, 'biscuits');
  assert.equal(classifyOffer({ heading:'Merrild eller Lavazza helbønner' }).comparisonGroup, 'coffee_tea');
  assert.equal(classifyOffer({ heading:'REMA 1000 Vannameirejer eller tunsteak' }).comparisonGroup, 'seafood_mixed_offer');
});

test('splits overloaded parent categories into practical shopping aisles', () => {
  assert.equal(classifyOffer({ heading:'BUKO Flødeost' }).categoryId, 'cheese_soft_fresh');
  assert.equal(classifyOffer({ heading:'Lurpak Smør' }).categoryId, 'butter_spreads');
  assert.equal(classifyOffer({ heading:'Merrild helbønner' }).categoryId, 'coffee_tea');
  assert.equal(classifyOffer({ heading:'Marabou chokolade' }).categoryId, 'chocolate');
  assert.equal(classifyOffer({ heading:'Oreo cookies' }).categoryId, 'biscuits_cakes');
  assert.equal(classifyOffer({ heading:'Bacon i skiver' }).categoryId, 'bacon');
  assert.deepEqual(classifyOffer({ heading:'Florence sofa med chaiselong' }), { categoryId:'home_furniture', comparisonGroup:'home_furniture' });
});

test('splits crowded wine offers by actual wine type', () => {
  assert.deepEqual(classifyOffer({ heading:'San Felice Chianti Classico', description:'Italien. Rødvin. 75 cl.' }), { categoryId:'alcohol_wine_red', comparisonGroup:'alcohol_wine_red' });
  assert.deepEqual(classifyOffer({ heading:'Mâcon Azé', description:'Frankrig. Hvidvin. 75 cl.' }), { categoryId:'alcohol_wine_white', comparisonGroup:'alcohol_wine_white' });
  assert.deepEqual(classifyOffer({ heading:'Joseph Hubster Crémant d’Alsace', description:'Frankrig. Brut. 75 cl.' }), { categoryId:'alcohol_wine_rose_sparkling', comparisonGroup:'alcohol_wine_sparkling' });
  assert.deepEqual(classifyOffer({ heading:'Bag-in-Box marked', description:'Rødvin, hvidvin eller rosé.' }), { categoryId:'alcohol_wine_mixed', comparisonGroup:'alcohol_wine_mixed_offer' });
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

test('product form beats ingredient words for avocado oil and tortilla chips', () => {
  assert.deepEqual(classifyOffer({ heading: 'Soilmates avocadoolie' }), {
    categoryId: 'cooking_oils',
    comparisonGroup: 'oil_other',
  });
  assert.deepEqual(classifyOffer({ heading: 'Tortilla Chips' }), {
    categoryId: 'salty_snacks',
    comparisonGroup: 'chips',
  });
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
