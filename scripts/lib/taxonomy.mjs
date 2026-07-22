const norm = value => String(value || '')
  .toLowerCase()
  .replace(/æ/g, 'ae')
  .replace(/ø/g, 'o')
  .replace(/å/g, 'aa')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

export const AARHUS_CATEGORIES = [
  ['vegetables', '🥬', '蔬菜', '蘑菇、番茄、土豆、叶菜等按品种比较。'],
  ['fruit', '🍎', '水果', '按品种、重量或单件价格显示。'],
  ['chicken', '🐔', '鸡肉与其他禽肉', '鸡胸、鸡腿、整鸡和未调味禽肉部位分组比较。'],
  ['minced_meat', '🥟', '肉末与混合肉末', '鸡肉末、火鸡肉末、猪肉末、牛肉末和猪牛混合肉末集中分组比较。'],
  ['pork_fresh', '🐷', '鲜猪肉', '猪里脊、猪排、肋排和整块猪肉分组比较。'],
  ['beef', '🥩', '牛羊肉与牛排', '牛排、整块牛肉、牛肉丁和羊肉分别比较。'],
  ['seafood', '🐟', '鱼虾海鲜', '区分三文鱼、白身鱼、虾和熟制海鲜。'],
  ['prepared_meat', '🍖', '肉类制成品', '调味、熟制、裹粉、肉丸和肉饼按肉种与形态细分。'],
  ['liver_pate', '🍞', '肝酱与肉酱', 'Leverpostej 等肝酱单独展示，不再混入培根或冷切。'],
  ['bacon', '🥓', '培根', '培根片与培根丁分开；培根肠归入香肠。'],
  ['sausages', '🌭', '香肠', '按鸡肉、牛肉、猪肉、培根、法兰克福和其他明确类型细分。'],
  ['deli_meat', '🥪', '冷切与肉片', '火腿、鸡肉片、牛肉片、萨拉米等按肉种和形态分开。'],
  ['eggs_milk', '🥚', '鸡蛋、牛奶与植物饮', '鸡蛋、牛奶、乳饮品和植物奶分组显示。'],
  ['yoghurt', '🥣', '酸奶与 Skyr', '酸奶、Skyr、布丁和发酵乳集中展示。'],
  ['cream_cold_dairy', '🥛', '奶油与其他冷藏乳品', '淡奶油、烹饪奶油和跨乳品任选促销集中展示。'],
  ['cheese', '🧀', '奶酪', '硬质、软质、切片、刨丝和新鲜白奶酪保留原名差异。'],
  ['butter_spreads', '🧈', '黄油与乳脂抹酱', '真黄油和混合抹酱按重量与原名比较。'],
  ['potato_products', '🍟', '土豆制成品', '薯条、薯角、薯饼、焗土豆和土豆沙拉各自比较。'],
  ['bread_bakery', '🍞', '面包与烘焙主食', '黑麦面包、法棍、小面包和其他烘焙主食。'],
  ['rice_pasta', '🍚', '米面、意面与烘焙面粉', '大米、面条、意面、面粉和饼皮分组显示。'],
  ['frozen_ready', '🍕', '冷冻食品与方便餐', '冷冻主食、披萨、饺子和即食餐分组显示。'],
  ['ice_cream', '🍨', '冰淇淋与冰品', '冰淇淋、冰棒和其他冷冻甜品集中展示。'],
  ['breakfast', '🥣', '麦片与早餐抹酱', '麦片、燕麦、果酱、蜂蜜和花生酱。'],
  ['coffee_tea', '☕', '咖啡与茶', '咖啡豆、咖啡粉、速溶咖啡和茶单独展示。'],
  ['sauces_condiments', '🥫', '酱料与佐料', '番茄酱、蛋黄酱、芥末、酱油等各归其类；混合组合不比价。'],
  ['cooking_oils', '🫒', '食用油与醋', '橄榄油、菜籽油、葵花籽油和醋分开比较。'],
  ['canned_pickled', '🫙', '罐头与腌渍食品', '番茄罐头单列；腌黄瓜、橄榄等集中浏览但不跨品种比价。'],
  ['pantry', '🧂', '香料与烹饪食材', '香料、烘焙辅料和其他常温烹饪食材。'],
  ['salty_snacks', '🥨', '咸味零食、坚果与果干', '薯片、爆米花、坚果和果干集中展示。'],
  ['biscuits_cakes', '🍪', '饼干、蛋糕与甜点', '饼干、华夫、蛋糕和小甜点按原商品形态查看。'],
  ['candy_chocolate', '🍫', '糖果与巧克力', '巧克力、糖果、焦糖和甜味棒集中展示。'],
  ['household_cleaning', '🧼', '家庭清洁与洗衣', '清洁剂、洗衣和洗碗用品单独展示。'],
  ['paper_products', '🧻', '生活纸品', '卫生纸、厨房纸、手帕纸、餐巾纸和湿巾各自显示。'],
  ['household_paper', '🗑️', '袋类与厨房耗材', '垃圾袋、保鲜袋和厨房耗材；不会混进食品或生活纸品。'],
  ['baby', '🍼', '婴幼儿用品', '纸尿裤、婴儿棉片和无香护理用品。'],
  ['personal_care', '🧴', '个人护理', '洗发、沐浴、防晒和身体护理用品。'],
  ['drinks', '🥤', '饮料', '普通与无糖汽水、果汁、水、能量饮料和浓缩饮品集中浏览。'],
  ['alcohol', '🍷', '酒类', '啤酒、葡萄酒、烈酒和预调酒；仅供符合丹麦法定购买年龄的成年人。'],
  ['pet', '🐾', '宠物用品', '猫狗食品、零食和日常用品。'],
  ['flowers_plants', '🌿', '鲜花与植物', '花束、盆栽和园艺植物。'],
  ['home_kitchen', '🏠', '家居与厨具', '锅具、收纳、厨房工具、小家电和其他家居用品。'],
  ['electronics', '🔌', '电子电器', '音频、电脑配件、照明和其他电子产品。'],
  ['clothing', '👕', '服饰鞋袜', '成人与儿童服饰、鞋袜和配件。'],
  ['leisure', '🧸', '玩具文具与休闲', '玩具、文具、书刊和休闲用品。'],
  ['tobacco_nicotine', '🚭', '烟草与尼古丁', '烟草或尼古丁产品；仅供符合法律要求的成年人。'],
  ['other_offers', '📦', '其他促销', '无法可靠归入上述类别的促销商品，保留原名供浏览。'],
].map(([id, emoji, nameZh, descriptionZh]) => ({ id, emoji, nameZh, descriptionZh, color: '#315f51' }));

const AARHUS_CATEGORY_SPLITS = {
  pork: {
    sausages: 'sausages_deli', bacon_deli: 'sausages_deli',
    default: 'pork_fresh',
  },
  eggs_dairy: {
    cheese: 'cheese', cheese_fresh: 'cheese', butter: 'butter_spreads',
    yoghurt: 'yoghurt_cream', cream: 'yoghurt_cream', mixed_dairy: 'yoghurt_cream',
    default: 'eggs_milk',
  },
  bread_grains: {
    bread: 'bread_bakery', mixed_bakery: 'bread_bakery',
    default: 'rice_pasta',
  },
  frozen_ready: { ice_cream: 'ice_cream', default: 'frozen_ready' },
  breakfast: { coffee_tea: 'coffee_tea', default: 'breakfast' },
  snacks: {
    biscuits: 'biscuits_cakes', chocolate: 'candy_chocolate',
    default: 'salty_snacks',
  },
  household: { cleaning: 'household_cleaning', default: 'household_paper' },
};

const MINCED_MEAT_GROUPS = new Set(['chicken_minced', 'turkey_minced', 'pork_minced', 'beef_minced', 'mixed_minced']);

const CHEESE_GROUP_PATTERNS = [
  ['cheese_mixed_offer', /skiveost eller .*hytteost|smelteost eller .*dessertost|puck ost eller .*halloumi|blue.*tapas.*skiveost|blaahvid.*gouda.*brie|osteplatte eller/],
  ['cheese_grated', /revet|topping/],
  ['cheese_sliced', /skiveost|smelteost i skiver|ost i skiver/],
  ['cheese_spreadable', /flodeost|smoreost|smorbar ost|rejeost|skinkeost|philadelphia/],
  ['cheese_cottage_ricotta', /hytteost|ricotta|friskost|kaymak/],
  ['cheese_mozzarella_burrata', /mozzarella|burrata/],
  ['cheese_feta_white', /salatost|\bfeta\b|hvid ost/],
  ['cheese_grilling', /halloumi|grillost/],
  ['cheese_soft_mould', /blaaskimmel|blaahvid|\bblue\b|\bbrie\b|camembert|saint morgon|dessertost/],
  ['cheese_aged_hard', /grana|parmigiano|pecorino|manchego|parmesan|hard ost/],
  ['cheese_danish_table', /skaereost|danbo|havarti|gouda|tilsiter|samso|klovborg|riberhus|mammen|ostehaps|fast ost/],
];

export function refineAarhusComparisonGroup(comparisonGroup, originalName = '') {
  const name = norm(originalName);
  const mixedChoice = /eller|marked|mix/.test(name);
  if (comparisonGroup === 'clothing_adult' && /til born|kids|lupilu/.test(name)) return 'clothing_children';
  if (comparisonGroup === 'excluded_drink') {
    if (/energidrik|energy/.test(name)) return 'drink_energy';
    if (/juice|smoothie|nektar/.test(name)) return 'drink_juice';
    if (/danskvand|mineralvand|kildevand/.test(name)) return 'drink_water';
    if (/saft|ribena|opblanding/.test(name)) return 'drink_concentrate';
    return 'drink_soda';
  }
  if (['ice_cream_mixed_offer', 'cleaning_mixed_offer', 'household_mixed_offer', 'personal_care_mixed_offer'].includes(comparisonGroup)) {
    return comparisonGroup;
  }
  // Non-meat product forms must win before incidental words such as hotdog,
  // bacon or Wiener can send bread and pastries into a meat aisle.
  if (/ispind|isvafler|isvaffel/.test(name)) return 'ice_cream';
  if (/hotdogbrod|polsebrod|burgerboller/.test(name)) return 'bread';
  if (/wienerstang|kanelstang/.test(name)) return 'biscuits';
  if (/fransk hotdog/.test(name)) return 'ready_meal';
  if (/ribena|solbaer.*(?:saft|drik)|(?:saft|drik).*solbaer/.test(name)) return 'drink_concentrate';
  if (/nektarin.*fersken.*blomme.*abrikos/.test(name)) return 'mixed_stone_fruit';
  if (/sol mar.*blaeksprutte.*chorizo/.test(name)) return 'mixed_grocery_offer';
  if (/pakkemarked.*klar til grillen/.test(name)) return 'prepared_mixed_meat';
  if (/madvaerket.*kyllingebrystfilet.*laarmix/.test(name)) return 'prepared_poultry_mixed_offer';
  if (/mcennedy.*spareribs/.test(name)) return 'prepared_pork_mixed_offer';
  if (/omhu.*culotte.*frilandslammekod/.test(name)) return 'prepared_mixed_meat';
  if (/godt papir|lambi classic papir/.test(name)) return 'paper_mixed_offer';
  if (/taga.*bacondadler.*fuet|bacondadler.*fuet/.test(name)) return 'prepared_mixed_meat';
  if (/(?:postej|leverpostej).*(?:eller).*medister|medister.*(?:eller).*(?:postej|leverpostej)/.test(name)) return 'prepared_mixed_meat';
  if (/salatbowls|hvidkaalssalat/.test(name)) return 'prepared_salad';
  if (/melonmix|frugtmix|ananas i skiver/.test(name)) return 'prepared_fruit';
  if (/fiskefrikadeller.*eller.*roget makrel|roget makrel.*eller.*fiskefrikadeller/.test(name)) return 'seafood_mixed_offer';
  if (/fiskefars/.test(name)) return 'fish_mince';
  if (/(?:classic|original).*(?:eller).*(?:crispy|breaded).*(?:hot wings|wings)|(?:hot wings|wings).*(?:classic|original).*(?:eller).*(?:crispy|breaded)/.test(name)) return 'prepared_chicken_wings_mixed_offer';
  if (/hot ?wings|buffalo wings|sol mar kyllingevinger|piri.*(?:chicken wings|kyllingevinger)|(?:chicken wings|kyllingevinger).*piri/.test(name)) return 'prepared_chicken_wings_seasoned';
  if (/(?:crispy|breaded|paneret).*(?:hot wings|kyllingevinger|chicken wings)|(?:hot wings|kyllingevinger|chicken wings).*(?:crispy|breaded|paneret)/.test(name)) return 'prepared_chicken_wings_breaded';
  if (/marineret kyllinge?(?:bryst|steak)|kyllingebryst.*(?:bbq|citron|rosmarin)/.test(name)) return 'prepared_chicken_breast_marinated';
  if (/burgerboffer af oksekod|hamburger af oksekod/.test(name)) return 'prepared_beef_burgers';
  if (/poussin.*marineret.*eller|marineret.*eller.*poussin/.test(name)) return 'prepared_poultry_mixed_offer';
  if (/(?:pulled pork|pulled chicken|spareribs|porchetta|roget hamburgerryg|marineret kamfilet).*(?:eller)|(?:eller).*(?:pulled pork|pulled chicken|spareribs|porchetta|roget hamburgerryg|marineret kamfilet)|(?:gris|svin|flaesk|kotelet|kamben|sparerib|ribsteak|kamfilet|skinkeculotte|morbrad).*(?:eller).*(?:marineret|bbq|chimichurri|ovnklar)|(?:marineret|bbq|chimichurri|ovnklar).*(?:eller).*(?:gris|svin|flaesk|kotelet|kamben|sparerib|ribsteak|kamfilet|skinkeculotte|morbrad)/.test(name)) return 'prepared_pork_mixed_offer';
  if (/pulled pork/.test(name)) return 'prepared_pork_cooked';
  if (/rogede? kamben|kamben.*roget/.test(name)) return 'prepared_pork_cooked';
  if (/porchetta|kotelet.*tilsat lage|kotelet.*(?:tomat|ramslog)|marinerede? spareribs/.test(name)) return 'prepared_pork_marinated';
  if (/krydrede kodboller.*eller.*hakket gris|hakket gris.*eller.*krydrede kodboller/.test(name)) return 'prepared_pork_mixed_offer';
  if (/(?:marineret|bbq|barbecue|chimichurri|mesquit|smokey|paprika|lakrids|firepit|gyros|ovnklar).*(?:gris|svin|flaesk|kotelet|kamben|sparerib|ribsteak|kamfilet|skinkeculotte|morbrad)|(?:gris|svin|flaesk|kotelet|kamben|sparerib|ribsteak|kamfilet|skinkeculotte|morbrad).*(?:marineret|bbq|barbecue|chimichurri|mesquit|smokey|paprika|lakrids|firepit|gyros|ovnklar)/.test(name)) return 'prepared_pork_marinated';
  if (/(?:marineret|bbq|hvidlog).*(?:lam|lamm)|(?:lam|lamm).*(?:marineret|bbq|hvidlog)/.test(name)) return 'prepared_lamb_marinated';
  if (/(?:marineret|chimichurri|bbq|hvidlog|peberkant).*(?:okse|kalv|steak|flank|flatsteak|culotte)|(?:okse|kalv|steak|flank|flatsteak|culotte).*(?:marineret|chimichurri|bbq|hvidlog|peberkant)/.test(name)) return 'prepared_beef_marinated';
  if (/vaadservietter|wet wipes/.test(name)) return 'paper_wet_wipes';
  if (/lommeletter|lommetorklaeder|ansigtsservietter|facial tissue|kleenex|puffs/.test(name)) return 'paper_facial';
  // If ribeye/entrecôte is one of the explicitly purchasable choices, the
  // offer is useful in the ribeye aisle and its price is valid for that choice.
  if (comparisonGroup === 'beef_mixed_offer' && /rib ?eye|entrecote/.test(name)) return 'beef_ribeye';
  // Product form takes precedence over a stale broad/fine cache group. These
  // checks intentionally work regardless of the previous taxonomy so a known
  // product is corrected again when it reappears in a later flyer.
  if (/paalaegssalat/.test(name)) return 'deli_spreads';
  if (/(?:chorizo.*eller.*serrano|serrano.*eller.*chorizo)/.test(name)) return 'deli_mixed_offer';
  if (/leverpostej|lever pate|baconleverpostej|\bpostej\b/.test(name)) {
    if (mixedChoice && /bacon|kalkunbacon|paalaeg|skinke|salami/.test(name)) return 'deli_mixed_offer';
    return 'liver_pate';
  }
  if (/bacon/.test(name)) {
    if (/polse|poelse|chorizo|griller|frankfurter|wiener/.test(name)) {
      if (mixedChoice && /(?:bacon.*eller|eller.*bacon)/.test(name)) return 'sausage_mixed_offer';
      return 'sausage_bacon';
    }
    if (mixedChoice && /paalaeg|skinke|salami|leverpostej|postej/.test(name)) return 'deli_mixed_offer';
    if (/(?:skiver.*eller.*tern|tern.*eller.*skiver)/.test(name)) return 'bacon_mixed_offer';
    if (/tern|strimler|stykker/.test(name)) return 'bacon_pieces';
    if (/skiver|skiveskaaret|sliced/.test(name)) return 'bacon_sliced';
    return 'bacon_other';
  }
  if (/(?:hot ?dog.*eller.*grill|grill.*eller.*hot ?dog)/.test(name)) return 'sausage_mixed_offer';
  if (/frankfurter|wiener|hot ?dog/.test(name)) return 'sausage_frankfurter';
  if (/chorizo/.test(name)) return 'sausage_chorizo';
  if (/spegepolse/.test(name)) return 'sausage_other';
  if (/\bpaalaeg\b/.test(name) && !/kalkun|kylling|okse|skinke|hamburgerryg|rullepolse|salami|serrano/.test(name)) return 'deli_mixed_offer';
  if (/^(?:liver_pate|bacon_|sausage_|deli_)/.test(comparisonGroup) && mixedChoice) {
    if (/bacon/.test(name) && /polse|poelse|chorizo|griller/.test(name)) return 'sausage_mixed_offer';
    if (/leverpostej|\bpostej\b|bacon|salami|skinke|hamburgerryg|rullepolse|paalaeg/.test(name)) return 'deli_mixed_offer';
  }
  if (comparisonGroup.startsWith('sauce_') && comparisonGroup !== 'sauce_mixed_offer') {
    const kinds = [/ketchup/, /mayonnaise|mayo/, /remoulade/, /sennep|mustard/, /soja|soya|soy sauce/, /teriyaki/, /barbecue|bbq/, /piri|chili|sriracha/, /pesto/, /dressing/, /hummus|haydari|aioli|dip/]
      .filter(pattern => pattern.test(name)).length;
    if (kinds > 1 || /saucepakke|saucemix|ketchup.*eller.*sauce/.test(name)) return 'sauce_mixed_offer';
  }
  if (comparisonGroup.startsWith('paper_') && comparisonGroup !== 'paper_mixed_offer') {
    const kinds = [/toiletpapir|toilet paper|charmin/, /kokkenrulle|paper towel/, /lommetorklaeder|facial tissue|kleenex|puffs/, /servietter|napkins/, /vaadservietter|wet wipes/]
      .filter(pattern => pattern.test(name)).length;
    if (kinds > 1) return 'paper_mixed_offer';
  }
  if (['bacon_deli', 'sausages', 'chicken_sausages', 'poultry_deli_mixed'].includes(comparisonGroup)) {
    if (/eller|marked|mix/.test(name) && /bacon/.test(name)) return /polse|poelse|chorizo|griller/.test(name) ? 'sausage_mixed_offer' : 'deli_mixed_offer';
    if (/eller|marked|mix/.test(name) && /leverpostej|\bpostej\b/.test(name)) return 'deli_mixed_offer';
    if (/eller|marked|mix/.test(name) && /(leverpostej|\bpostej\b|bacon|salami|skinke|hamburgerryg|rullepolse|paalaeg).*(?:leverpostej|\bpostej\b|bacon|salami|skinke|hamburgerryg|rullepolse|paalaeg)/.test(name)) return 'deli_mixed_offer';
    if (/leverpostej|lever pate|baconleverpostej|\bpostej\b/.test(name)) return 'liver_pate';
    if (/rullepolse|skinke|hamburgerryg|paalaeg|salami|serrano|spegepolse/.test(name)) {
      if (/eller|marked|mix/.test(name)) return 'deli_mixed_offer';
      if (/kalkun|turkey/.test(name)) return 'deli_turkey_sliced';
      if (/kylling|chicken/.test(name)) return 'deli_chicken_sliced';
      if (/okse|beef/.test(name)) return 'deli_beef_sliced';
      if (/salami|serrano|spegepolse/.test(name)) return 'deli_cured_sliced';
      return 'deli_pork_sliced';
    }
    if (/eller|marked|mix/.test(name) && /bacon/.test(name) && /polse|poelse|chorizo|griller/.test(name)) return 'sausage_mixed_offer';
    if (/(?:bacon.*(?:polse|poelse|griller)|(?:polse|poelse|griller).*bacon)/.test(name)) return 'sausage_bacon';
    if (/frankfurter|wiener|hot ?dog/.test(name)) return 'sausage_frankfurter';
    if (/chorizo/.test(name)) return 'sausage_chorizo';
    if (/kylling.*(?:polse|poelse)|(?:polse|poelse).*kylling/.test(name)) return 'sausage_chicken';
    if (/okse.*(?:polse|poelse)|(?:polse|poelse).*okse/.test(name)) return 'sausage_beef';
    if (comparisonGroup === 'sausages' || /polse|poelse|medister|bockwurst|krakauer|krainer|merguez|griller/.test(name)) {
      if (/eller|mix|marked/.test(name)) return 'sausage_mixed_offer';
      if (/medister|svin|gris|bayersk|bratwurst/.test(name)) return 'sausage_pork';
      return 'sausage_other';
    }
    if (/bacon/.test(name)) {
      if (/tern|strimler|stykker/.test(name)) return 'bacon_pieces';
      if (/skiver|skiveskaaret|sliced/.test(name)) return 'bacon_sliced';
      return 'bacon_other';
    }
    if (/kalkun|turkey/.test(name)) return 'deli_turkey_sliced';
    if (/kylling|chicken/.test(name)) return 'deli_chicken_sliced';
    if (/okse|beef/.test(name)) return 'deli_beef_sliced';
    if (/salami|serrano|spegepolse/.test(name)) return 'deli_cured_sliced';
    if (/skinke|hamburgerryg|rullepolse|saltkod/.test(name)) return 'deli_pork_sliced';
    return 'deli_mixed_offer';
  }
  if (comparisonGroup === 'prepared_meatballs') {
    if (/kylling/.test(name)) return 'prepared_chicken_meatballs';
    if (/okse/.test(name)) return 'prepared_beef_meatballs';
    if (/gris|svin/.test(name)) return 'prepared_pork_meatballs';
    return 'prepared_mixed_meat';
  }
  if (comparisonGroup === 'chicken_breaded') return 'prepared_chicken_breaded';
  if (comparisonGroup === 'turkey_processed') return 'prepared_turkey';
  if (comparisonGroup === 'potato_salad') return 'potato_salad';
  if (comparisonGroup === 'potato_sides') {
    if (/pommes frites|french fries|\bfries\b/.test(name)) return 'potato_fries';
    if (/kartoffelbaade|wedges/.test(name)) return 'potato_wedges';
    if (/rosti|hash brown/.test(name)) return 'potato_hash_browns';
    if (/kroket/.test(name)) return 'potato_croquettes';
    if (/gratin|flodekartof/.test(name)) return 'potato_gratin';
    if (/mos|mash/.test(name)) return 'potato_mash';
    return 'potato_mixed_offer';
  }
  if (comparisonGroup === 'sauces' || comparisonGroup === 'sauce_other') {
    const sauceKinds = [/ketchup/, /mayonnaise|mayo/, /remoulade/, /sennep|mustard/, /soja|soya|soy sauce/, /teriyaki/, /barbecue|bbq/, /piri|chili|sriracha/, /pesto/, /dressing/, /hummus|haydari|aioli|dip/]
      .filter(pattern => pattern.test(name)).length;
    if (sauceKinds > 1 || /saucepakke|saucemix|ketchup.*eller.*sauce/.test(name)) return 'sauce_mixed_offer';
    if (/ketchup/.test(name)) return 'sauce_ketchup';
    if (/satay|sate|jordnoddesauce|peanut sauce/.test(name)) return 'sauce_satay';
    if (/pizzasauce/.test(name)) return 'sauce_pizza';
    if (/pastasauce/.test(name)) return 'sauce_pasta';
    if (/tomatsauce|tomato sauce/.test(name)) return 'sauce_tomato';
    if (/mayonnaise|mayo/.test(name)) return 'sauce_mayonnaise';
    if (/remoulade/.test(name)) return 'sauce_remoulade';
    if (/sennep|mustard/.test(name)) return 'sauce_mustard';
    if (/soja|soya|soy sauce/.test(name)) return 'sauce_soy';
    if (/teriyaki/.test(name)) return 'sauce_teriyaki';
    if (/barbecue|bbq/.test(name)) return 'sauce_bbq';
    if (/piri|chili|sriracha|hot sauce/.test(name)) return 'sauce_chili';
    if (/pesto/.test(name)) return 'sauce_pesto';
    if (/dressing/.test(name)) return 'sauce_dressing';
    if (/hummus|haydari|aioli|dip/.test(name)) return 'sauce_dip';
    return 'sauce_other';
  }
  if (comparisonGroup === 'oil_vinegar') {
    if (/olivenolie|olive oil/.test(name)) return 'oil_olive';
    if (/rapsolie|rapeseed|canola/.test(name)) return 'oil_rapeseed';
    if (/solsikkeolie|sunflower/.test(name)) return 'oil_sunflower';
    if (/friture|frying oil/.test(name)) return 'oil_frying';
    if (/eddike|vinegar/.test(name)) return 'vinegar';
    return 'oil_other';
  }
  if (comparisonGroup === 'canned') {
    if (/hakkede tomater|tomatkonserves|canned tomatoes/.test(name)) return 'canned_tomatoes';
    if (/kikaerter|bonner|beans|chickpeas/.test(name)) return 'canned_beans';
    if (/kokosmaelk|coconut milk/.test(name)) return 'canned_coconut_milk';
    return 'canned_other';
  }
  if (comparisonGroup === 'paper') {
    const paperKinds = [/toiletpapir|toilet paper|charmin/, /kokkenrulle|paper towel/, /lommetorklaeder|facial tissue|kleenex|puffs/, /servietter|napkins/, /vaadservietter|wet wipes/]
      .filter(pattern => pattern.test(name)).length;
    if (paperKinds > 1) return 'paper_mixed_offer';
    if (/toiletpapir|toilet paper|charmin/.test(name)) return 'paper_toilet';
    if (/kokkenrulle|paper towel/.test(name)) return 'paper_kitchen';
    if (/lommetorklaeder|facial tissue|kleenex|puffs/.test(name)) return 'paper_facial';
    if (/servietter|napkins/.test(name)) return 'paper_napkins';
    if (/vaadservietter|wet wipes/.test(name)) return 'paper_wet_wipes';
    return 'paper_other';
  }
  if (comparisonGroup === 'pasta_noodles' && /pastasauce/.test(name)) {
    return /eller|marked|majs|kikaert/.test(name) ? 'mixed_grocery_offer' : 'sauce_pasta';
  }
  if (comparisonGroup === 'sauce_pizza' && /(?:tomat|majs|tun).*(?:eller|marked).*pizzasauce/.test(name)) return 'mixed_grocery_offer';
  if (!['cheese', 'cheese_fresh'].includes(comparisonGroup)) return comparisonGroup;
  return CHEESE_GROUP_PATTERNS.find(([, pattern]) => pattern.test(name))?.[0] || 'cheese_other';
}

export function refineAarhusCategory(categoryId, comparisonGroup) {
  if (comparisonGroup.startsWith('drink_') || comparisonGroup === 'zero_soda') return 'drinks';
  if (comparisonGroup.startsWith('alcohol_')) return 'alcohol';
  if (comparisonGroup.startsWith('pet_')) return 'pet';
  if (comparisonGroup.startsWith('flower_') || comparisonGroup === 'plants') return 'flowers_plants';
  if (comparisonGroup.startsWith('home_')) return 'home_kitchen';
  if (comparisonGroup.startsWith('electronics_')) return 'electronics';
  if (comparisonGroup.startsWith('clothing_')) return 'clothing';
  if (comparisonGroup.startsWith('leisure_')) return 'leisure';
  if (comparisonGroup.startsWith('tobacco_')) return 'tobacco_nicotine';
  if (comparisonGroup === 'other_offer') return 'other_offers';
  if (comparisonGroup === 'bread') return 'bread_bakery';
  if (comparisonGroup === 'biscuits') return 'biscuits_cakes';
  if (comparisonGroup === 'ice_cream' || comparisonGroup === 'ice_cream_mixed_offer') return 'ice_cream';
  if (comparisonGroup === 'ready_meal') return 'frozen_ready';
  if (comparisonGroup === 'prepared_salad') return categoryId === 'vegetables' ? 'vegetables' : 'frozen_ready';
  if (comparisonGroup === 'prepared_fruit' || comparisonGroup === 'mixed_fruit') return 'fruit';
  if (comparisonGroup === 'fish_mince' || comparisonGroup.startsWith('seafood_')) return 'seafood';
  if (MINCED_MEAT_GROUPS.has(comparisonGroup)) return 'minced_meat';
  if (comparisonGroup === 'yoghurt') return 'yoghurt';
  if (['cream', 'mixed_dairy'].includes(comparisonGroup)) return 'cream_cold_dairy';
  if (comparisonGroup.startsWith('cheese_')) return 'cheese';
  if (comparisonGroup === 'liver_pate') return 'liver_pate';
  if (comparisonGroup.startsWith('bacon_')) return 'bacon';
  if (comparisonGroup.startsWith('sausage_')) return 'sausages';
  if (comparisonGroup.startsWith('deli_') || ['beef_deli', 'deli_spreads'].includes(comparisonGroup)) return 'deli_meat';
  if (comparisonGroup.startsWith('prepared_') || ['chicken_skewers', 'beef_burgers'].includes(comparisonGroup)) return 'prepared_meat';
  if (comparisonGroup.startsWith('potato_') && comparisonGroup !== 'potatoes_fresh') return 'potato_products';
  if (comparisonGroup.startsWith('sauce_')) return 'sauces_condiments';
  if (comparisonGroup.startsWith('oil_') || comparisonGroup === 'vinegar') return 'cooking_oils';
  if (comparisonGroup.startsWith('canned_') || comparisonGroup === 'pickled_vegetables') return 'canned_pickled';
  if (comparisonGroup.startsWith('paper_')) return 'paper_products';
  const split = AARHUS_CATEGORY_SPLITS[categoryId];
  return split?.[comparisonGroup] || split?.default || categoryId;
}

const classified = (categoryId, comparisonGroup, originalName = '') => {
  const refinedGroup = refineAarhusComparisonGroup(comparisonGroup, originalName);
  return {
    categoryId: refineAarhusCategory(categoryId, refinedGroup),
    comparisonGroup: refinedGroup,
  };
};

const group = (nameZh, noteZh, comparable = true) => ({ nameZh, noteZh, comparable });
export const AARHUS_COMPARISON_GROUPS = {
  chicken_thigh: group('鸡腿肉', '同为鸡腿部位时优先按公斤比较。'),
  chicken_breast: group('鸡胸肉', '鸡胸与鸡里脊保留原名差异。'),
  whole_chicken: group('整鸡', '按公斤比较整只鸡。'),
  chicken_minced: group('鸡肉末', '适合肉丸、饺子馅或炒肉末。'),
  chicken_wings: group('鸡翅', '原味、腌制和裹粉鸡翅分开看口味，但同为鸡翅时优先按公斤比较。'),
  chicken_breaded: group('裹粉鸡块与鸡肉小食', '加工形态不同，只作同页参考，不计算全局最低价。', false),
  chicken_skewers: group('鸡肉串', '鸡肉串按腌料、串数和公斤价格参考。'),
  chicken_sausages: group('鸡肉香肠', '配料和其他可选香肠差异较大，不计算全局最低价。', false),
  chicken_mixed_offer: group('鸡肉多品项任选', '跨鸡胸、鸡腿、鸡翅等部位的任选促销不参与单一部位最低价。', false),
  chicken_other: group('其他鸡肉', '部位不同，不计算全局最低价。', false),
  turkey_breast: group('火鸡胸肉', '火鸡胸、胸肉薄片和胸肉条按公斤比较，不与火鸡腿混比。'),
  turkey_thigh: group('火鸡腿肉', '火鸡大腿和小腿保留带骨差异，不与火鸡胸混比。'),
  turkey_minced: group('火鸡肉末', '火鸡肉末只与同类肉末比较。'),
  turkey_processed: group('火鸡肉饼与加工品', '火鸡肉饼、蓝带肉排等加工形态不同，不计算全局最低价。', false),
  turkey_mixed_offer: group('火鸡多部位任选', '跨火鸡胸、火鸡腿或加工形态的任选促销不计算全局最低价。', false),
  poultry_deli_mixed: group('禽肉冷切多品项任选', '冷切、肝酱和火鸡培根等不同形态不计算全局最低价。', false),
  other_poultry: group('其他禽肉', '童子鸡等与普通鸡肉、火鸡分开显示，不计算全局最低价。', false),
  pork_roast: group('烤猪肉块', '带皮、部位和骨头会影响可比性，不计算全局最低价。', false),
  pork_tenderloin: group('猪里脊与猪菲力', '整条猪里脊按公斤比较，腌制口味保留原名。'),
  pork_ribs: group('猪肋排与猪肋骨', '带骨比例、腌料和熟制状态会影响可比性。'),
  pork_chop: group('猪排与猪肉片', '猪颈排、里脊排和五花肉片部位不同，不计算全局最低价。', false),
  pork_minced: group('猪肉末', '按公斤比较。'),
  liver_pate: group('肝酱', 'Leverpostej 等肝酱只与同类按重量比较。'),
  bacon_sliced: group('培根片', '切片培根按公斤比较；不与培根肠或其他肉片混比。'),
  bacon_pieces: group('培根丁与培根条', '用于炒菜的培根丁、短条按公斤比较。'),
  bacon_other: group('其他培根', '规格或形态不明确，不计算最低价。', false),
  bacon_mixed_offer: group('培根片或培根丁任选', '切片与切丁用途不同，任选促销不计算最低价。', false),
  sausage_frankfurter: group('法兰克福、维也纳与热狗肠', '同类热狗肠按公斤比较。'),
  sausage_chorizo: group('Chorizo 香肠', '西班牙辣味香肠单独比较。'),
  sausage_chicken: group('鸡肉肠', '鸡肉香肠只与鸡肉香肠比较。'),
  sausage_beef: group('牛肉肠', '牛肉香肠只与牛肉香肠比较。'),
  sausage_pork: group('猪肉肠', '明确为猪肉的香肠按公斤比较。'),
  sausage_bacon: group('培根肠', '含培根的香肠归香肠，不与培根片混比。'),
  sausage_other: group('其他香肠', '肉种或形态不明确，不计算最低价。', false),
  sausage_mixed_offer: group('多种香肠任选', '跨香肠类型的组合或任选不计算最低价。', false),
  deli_pork_sliced: group('猪肉冷切与火腿片', '猪肉冷切按重量比较，不与培根片混比。'),
  deli_chicken_sliced: group('鸡肉冷切片', '鸡肉冷切片按重量比较。'),
  deli_turkey_sliced: group('火鸡冷切片', '火鸡冷切片按重量比较。'),
  deli_beef_sliced: group('牛肉冷切片', '牛肉冷切片按重量比较。'),
  deli_cured_sliced: group('萨拉米与风干肉片', '腌制肉片按具体肉种和原名参考。'),
  deli_mixed_offer: group('冷切多品项任选', '不同肉种或形态的冷切组合不计算最低价。', false),
  prepared_chicken_breaded: group('裹粉鸡肉制品', '鸡块、爆米花鸡等按制成形态查看，不跨形态比价。', false),
  prepared_chicken_wings_seasoned: group('调味鸡翅', '已经调味的冷冻鸡翅按公斤比较，不与生鲜原味鸡翅混比。'),
  prepared_chicken_wings_breaded: group('裹粉脆皮鸡翅', '裹粉鸡翅单独比较，不与普通调味鸡翅或生鸡翅混比。'),
  prepared_chicken_wings_mixed_offer: group('原味或脆皮鸡翅任选', '跨普通调味与裹粉脆皮形态，不计算统一最低价。', false),
  prepared_chicken_breast_marinated: group('腌制调味鸡胸', '已经腌制或带明确口味的鸡胸单独比较，不与原味生鸡胸混比。'),
  prepared_beef_burgers: group('牛肉汉堡饼', '成型牛肉汉堡饼按公斤比较，不与牛肉末或整块牛排混比。'),
  prepared_poultry_mixed_offer: group('禽肉生鲜或腌制任选', '跨未调味和腌制禽肉形态，不计算统一最低价。', false),
  prepared_pork_marinated: group('腌制调味猪肉', '已经腌制或带明确口味的猪肉按公斤参考，不与原味生猪肉混比。'),
  prepared_pork_cooked: group('熟制猪肉', 'Pulled pork 等已经慢煮或熟制的猪肉单独比较。'),
  prepared_pork_mixed_offer: group('猪肉制成品多形态任选', '腌制、熟制、烟熏或不同猪肉形态任选，不计算统一最低价。', false),
  prepared_beef_marinated: group('腌制调味牛肉', '已经腌制或带明确口味的牛排和牛肉单独比较。'),
  prepared_beef_mixed_offer: group('原味或腌制牛肉任选', '同一促销包含未调味和腌制牛肉，不计算统一最低价。', false),
  prepared_lamb_marinated: group('腌制调味羊肉', '已经腌制的羊肉单独比较，不与原味生羊肉混比。'),
  prepared_chicken_meatballs: group('鸡肉丸', '鸡肉丸按公斤比较。'),
  prepared_beef_meatballs: group('牛肉丸', '牛肉丸按公斤比较。'),
  prepared_pork_meatballs: group('猪肉丸', '猪肉丸按公斤比较。'),
  prepared_turkey: group('火鸡制成品', '火鸡肉饼和裹馅制品形态不同，不计算最低价。', false),
  prepared_mixed_meat: group('混合肉制成品', '肉种或形态混合，不计算最低价。', false),
  sausages: group('香肠与烤肠', '肉种、烟熏和调味可能不同，不计算全局最低价。', false),
  bacon_deli: group('培根与猪肉熟食', '加工方式和肉品不同，不计算全局最低价。', false),
  prepared_meatballs: group('肉丸与熟制肉饼', '肉丸、肉饼和肉卷形态不同，不计算全局最低价。', false),
  pork_mixed_offer: group('猪肉多品项任选', '跨肉末、猪排、香肠等形态的任选促销不参与单一部位最低价。', false),
  deli_spreads: group('三明治夹馅沙拉与抹酱', '虾肉沙拉、鸡肉沙拉等冷藏抹酱按配料和重量参考，不与肉类冷切混比。'),
  beef_minced: group('牛肉末', '脂肪比例不同会影响口感。'),
  mixed_minced: group('混合肉末', '猪、牛或小牛肉混合比例不同，不计算全局最低价。', false),
  beef_ribeye: group('肋眼与肉眼牛排', 'Ribeye 与 entrecôte 作为相近肋眼部位按公斤比较。'),
  beef_striploin: group('外脊/西冷牛排', 'Striploin 外脊牛排单独按公斤比较。'),
  beef_flat_steak: group('腹肉与薄切牛排', 'Flank/flat steak 单独按公斤比较。'),
  beef_rump_steak: group('牛臀排', 'Rump 与 tyksteg 牛臀部位按公斤比较。'),
  beef_bone_steak: group('带骨牛排', 'T-bone 与 Côte de Boeuf 等带骨牛排按公斤参考。'),
  beef_steak: group('其他牛排', '未明确相同部位的牛排不计算全局最低价。', false),
  beef_burgers: group('牛肉汉堡饼', '按牛肉比例、脂肪比例和公斤价格比较。'),
  beef_diced: group('牛肉丁与牛肉条', '切丁和切条可用于炒菜或炖煮，优先按公斤比较。'),
  beef_roast: group('整块烤牛肉', '臀肉、牛肩、牛臀尖等部位不同，不计算全局最低价。', false),
  beef_deli: group('牛肉熟食', '加工与调味不同。'),
  beef_mixed_offer: group('牛肉多部位任选', '跨牛排、烤肉和其他部位的任选促销不计算全局最低价。', false),
  mixed_meat_offer: group('跨肉种多品项任选', '猪、牛、小牛或鸡肉跨肉种任选，不能参与单一肉种最低价。', false),
  lamb_other: group('羊肉', '羊排、羊肩和羊腿按具体部位参考，不计算跨部位最低价。', false),
  salmon_fresh: group('生鲜三文鱼', '生鲜或冷冻未熟制三文鱼柳按公斤比较。'),
  salmon_smoked: group('烟熏与腌渍三文鱼', '烟熏、热熏和 gravad 腌渍三文鱼与生鲜鱼柳分开比较。'),
  salmon: group('三文鱼（旧分类）', '兼容旧记录，不计算全局最低价。', false),
  shrimp: group('虾', '熟虾与生虾用途不同。'),
  white_fish: group('白身鱼', '不同鱼种保留原名，不计算跨鱼种最低价。', false),
  fish_mince: group('调味鱼肉糜与鱼滑', '鱼肉糜可做鱼丸或鱼饼，不与整片鱼柳比较最低价。'),
  seafood_mixed_offer: group('鱼虾海鲜多品项任选', '不同鱼种、虾或加工海鲜任选，不计算单一商品最低价。', false),
  seafood_other: group('其他海鲜', '贝类和加工海鲜不强行视作同一种，也不计算全局最低价。', false),
  eggs: group('鸡蛋', '优先按每枚价格比较。'),
  milk: group('牛奶与乳饮品', '普通牛奶、可可奶和蛋白饮品不同，不计算全局最低价。', false),
  plant_drinks: group('植物奶', '燕麦饮、豆奶等按升比较，不与牛奶混比。'),
  cream: group('奶油与烹饪奶油', '淡奶油、打发奶油和烹饪奶油按升比较，不与牛奶混比。'),
  mixed_dairy: group('乳制品任选', '跨牛奶、奶油、酸奶或奶酪的任选促销不参与单一乳制品最低价。', false),
  yoghurt: group('酸奶与 Skyr', '酸奶、Skyr、布丁和发酵乳形态不同，不计算全局最低价。', false),
  cheese: group('奶酪', '奶酪种类差异较大，不计算跨品种最低价。', false),
  cheese_grated: group('刨丝奶酪与奶酪碎', '用于焗烤、披萨或意面；优先按公斤比较，并保留奶酪品种。'),
  cheese_sliced: group('切片奶酪', '适合三明治、汉堡或吐司；按重量比较并保留奶酪品种。'),
  cheese_spreadable: group('奶油奶酪与可涂抹奶酪', '适合抹面包、做蘸酱或烘焙；原味和调味款保留原名。'),
  cheese_cottage_ricotta: group('茅屋奶酪、Ricotta 与新鲜凝乳', '含水量和质地不同；可直接吃、拌沙拉或用于烘焙。'),
  cheese_mozzarella_burrata: group('Mozzarella 与 Burrata', '适合沙拉、披萨和焗烤；按净重和具体品种比较。'),
  cheese_feta_white: group('Feta、白奶酪与沙拉奶酪', '盐水白奶酪，适合沙拉、烘焙或配面包；按净重比较。'),
  cheese_grilling: group('Halloumi 与煎烤奶酪', '适合平底锅煎或烧烤；普通硬奶酪不混入此组。'),
  cheese_soft_mould: group('白霉、蓝纹与软质奶酪', '风味和熟成差异较大，不计算跨品种最低价。', false),
  cheese_aged_hard: group('Parmesan、Grana 与熟成硬奶酪', '熟成时间和品种差异较大，优先看具体原名与公斤价。'),
  cheese_danish_table: group('Danbo、Havarti 与丹麦餐桌奶酪', '切块餐桌奶酪按具体品种、熟成度和公斤价参考。'),
  cheese_mixed_offer: group('多种奶酪任选或拼盘', '跨奶酪形态与品种的任选促销不计算最低价。', false),
  cheese_other: group('其他奶酪', '名称未能可靠识别具体奶酪形态时保留在这里，不强行比较最低价。', false),
  butter: group('黄油与抹酱', '真黄油与混合抹酱保留原名。'),
  mushrooms: group('蘑菇', '只收录真正的食用蘑菇。'),
  cauliflower: group('花椰菜', '花椰菜单独按公斤或每颗比较。'),
  broccoli: group('西兰花', '西兰花单独按公斤或每颗比较。'),
  lettuce: group('生菜与沙拉叶', '整颗生菜与袋装沙拉叶保留规格差异。'),
  spinach: group('菠菜', '新鲜菠菜按包装重量比较。'),
  chives: group('细香葱', 'Purløg 单独比较每盆、每把或包装价格。'),
  basil: group('罗勒', 'Basilikum 单独比较每盆、每把或包装价格。'),
  parsley: group('欧芹', 'Persille 单独比较每盆、每把或包装价格。'),
  mixed_fresh_herbs: group('鲜香草任选', '欧芹、罗勒等跨品种任选不参与单一品种最低价。', false),
  fresh_herbs: group('其他鲜香草', '仅用于尚未确认具体品种的鲜香草，不计算全局最低价。', false),
  carrots: group('胡萝卜', '带叶、去叶、大小和包装差异不另拆品种，优先按公斤比较。'),
  root_vegetables: group('其他根茎菜', '甜菜根、芹菜根等按具体品种和公斤价格比较。'),
  peppers: group('甜椒与辣椒', '甜椒和辣椒保留辣度与包装差异。'),
  peas: group('豌豆', '新鲜、冷冻或带荚状态必须分别确认。'),
  corn: group('玉米', '鲜玉米棒与罐装玉米不混为一组。'),
  vegetable_mix: group('蔬菜组合', '多种蔬菜混合包按用途、组成和重量参考。'),
  mixed_produce: group('果蔬任选', '跨品种任选促销不参与单一品种最低价。', false),
  prepared_salad: group('预制沙拉', '已拌制或切配沙拉按配料和包装比较。'),
  potatoes_fresh: group('新鲜土豆', '大、小、新土豆、烤土豆用土豆及不同包装仍属同组，优先按公斤比较。'),
  potato_salad: group('土豆沙拉', '冷藏调味土豆沙拉按重量比较。'),
  potato_sides: group('加工土豆配菜', '薯角、薯饼、焗土豆等按形态和重量参考。'),
  potato_fries: group('薯条', '薯条只与薯条按公斤比较。'),
  potato_wedges: group('薯角', '薯角只与薯角按公斤比较。'),
  potato_hash_browns: group('薯饼与 Rösti', '薯饼不与薯条混比。'),
  potato_croquettes: group('土豆可乐饼', '土豆可乐饼按公斤比较。'),
  potato_gratin: group('焗土豆与奶油土豆', '焗土豆只与同类冷藏或冷冻配菜比较。'),
  potato_mash: group('土豆泥', '土豆泥按重量比较。'),
  potato_mixed_offer: group('其他土豆制成品', '形态不明确或组合装不计算最低价。', false),
  tomatoes: group('番茄', '小番茄与普通番茄保留原名。'),
  cucumber: group('黄瓜', '通常按每根或每公斤比较。'),
  potatoes: group('土豆（旧分类）', '仅兼容旧缓存；新鲜整颗土豆统一归入“新鲜土豆”。'),
  cabbage: group('卷心菜与甘蓝', '尖头甘蓝、白甘蓝等保留具体品种名称。'),
  onion_garlic: group('葱姜蒜与洋葱', '按公斤或每包比较。'),
  leafy_green: group('叶菜', '包装重量和新鲜度很重要。'),
  vegetables_other: group('其他蔬菜', '按原名识别具体品种，不计算跨品种最低价。', false),
  apples_pears: group('苹果与梨', '按公斤比较。'),
  apples: group('苹果', '苹果按品种、等级和公斤价格比较。'),
  pears: group('梨', '梨按品种、等级和公斤价格比较。'),
  strawberries: group('草莓', '草莓按产地、等级和公斤价格比较。'),
  blueberries: group('蓝莓', '蓝莓按包装重量和每公斤价格比较。'),
  other_berries: group('其他莓果', '黑加仑、覆盆子等按具体品种比较。'),
  watermelon: group('西瓜', '整颗、半颗和按公斤出售需区分。'),
  melon: group('甜瓜', '哈密瓜、网纹瓜等按品种和每颗/公斤比较。'),
  grapes: group('葡萄', '按是否无籽、颜色和公斤价格比较。'),
  apricots: group('杏', '杏按包装重量和每公斤价格比较。'),
  plums: group('李子', '李子按品种和每公斤价格比较。'),
  cherries: group('樱桃', '樱桃按产地、包装和每公斤价格比较。'),
  peaches_nectarines: group('桃与油桃', '桃和油桃可同页查看，但保留具体品种。'),
  mixed_stone_fruit: group('核果任选', '桃、李、杏等任选促销不强行视作同一品种。', false),
  pineapple: group('菠萝', '整颗与切片菠萝分开参考。'),
  mango: group('芒果', '芒果按每颗或公斤价格比较。'),
  avocado: group('牛油果', '牛油果按成熟度、每颗或包装比较。'),
  bananas: group('香蕉', '香蕉按每根、每把或公斤价格比较。'),
  prepared_fruit: group('切配水果', '果切和水果拼盘按组成、重量和保鲜期参考。'),
  mixed_fruit: group('水果任选', '多种水果或莓果任选不参与单一品种最低价。', false),
  canned_tomatoes: group('番茄罐头', '切碎、整粒和调味番茄罐头按净重与用途比较。'),
  cheese_fresh: group('新鲜白奶酪', '沙拉奶酪、白奶酪等按盐度和重量参考。'),
  home_goods: group('家居用品', '蜡烛等非食品按用途、数量和规格比较。'),
  kitchen_tools: group('厨房工具', '刀具等耐用品不参与食品单位价比较。'),
  stone_fruit: group('桃、油桃与李子', '按公斤或每件比较。'),
  berries: group('莓果', '小包装优先看每公斤价格。'),
  tropical_fruit: group('热带水果', '牛油果等常按每个出售。'),
  melon_grapes_citrus: group('瓜果、葡萄与柑橘', '按公斤或每件比较。'),
  fruit_other: group('其他水果', '品种和成熟度会影响价格，不计算跨品种最低价。', false),
  bread: group('面包', '黑麦、法棍、小面包和甜酥点用途不同，不计算全局最低价。', false),
  mixed_bakery: group('烘焙多品项任选', '跨面包、蛋糕和饼干的任选促销不参与单一烘焙品最低价。', false),
  rice: group('大米', '大包装通常单位价更低。'),
  pasta_noodles: group('意面、面条与泡面', '产品形态差异较大，不计算全局最低价。', false),
  flour_baking: group('面粉与烘焙主食', '面粉、饼皮和烘焙制品不同，不计算全局最低价。', false),
  pizza_snacks: group('披萨与披萨点心', '口味和大小不同。'),
  dumplings: group('饺子与冷冻点心', '饺子、春卷和冷冻点心形态不同，不计算全局最低价。', false),
  ready_meal: group('方便餐', '不同菜品只按总价和规格参考，不计算全局最低价。', false),
  plant_based_meat: group('植物肉与素香肠', '植物肉制品只与同类参考，不与猪肉或鸡肉混比。'),
  frozen_vegetables: group('冷冻蔬菜', '优先按公斤比较。'),
  ice_cream: group('冰淇淋与冰品', '容量、支数和类型不同。'),
  ice_cream_mixed_offer: group('多种冰淇淋形态任选', '杯装、桶装或小粒冰淇淋的容量和食用形式不同，不计算统一最低价。', false),
  cereal: group('麦片与早餐谷物', '糖分、坚果和水果含量可能不同。'),
  coffee_tea: group('咖啡与茶', '咖啡、茶及冲泡形态不同，不计算全局最低价。', false),
  spreads_jam: group('果酱与抹酱', '甜度、坚果含量和用途不同，不计算全局最低价。', false),
  mixed_grocery_offer: group('跨类别食品任选', '不同食品类别的任选促销不计算全局最低价。', false),
  canned: group('罐头食品', '不同罐头内容差异较大，不计算跨品种最低价。', false),
  sauces: group('酱料', '口味差异大，不计算跨酱料最低价。', false),
  sauce_ketchup: group('番茄酱', '番茄酱按升或公斤比较。'),
  sauce_satay: group('沙茶与 Satay 酱', '花生或沙茶风味酱单独比较。'),
  sauce_pizza: group('披萨酱', '披萨酱单独比较。'),
  sauce_pasta: group('意面酱', '意面酱单独比较。'),
  sauce_tomato: group('番茄调味酱', '普通番茄调味酱单独比较，不与 ketchup 混比。'),
  sauce_mayonnaise: group('蛋黄酱', '蛋黄酱单独比较。'),
  sauce_remoulade: group('Remoulade 酱', '丹麦 remoulade 单独比较。'),
  sauce_mustard: group('芥末酱', '芥末酱单独比较。'),
  sauce_soy: group('酱油', '酱油单独比较。'),
  sauce_teriyaki: group('照烧酱', '照烧酱单独比较。'),
  sauce_bbq: group('烧烤酱', '烧烤酱单独比较。'),
  sauce_chili: group('辣椒酱', '辣椒酱按辣度保留原名。'),
  sauce_pesto: group('Pesto 青酱', 'Pesto 单独比较。'),
  sauce_dressing: group('沙拉酱汁', '沙拉 dressing 按具体口味参考。'),
  sauce_dip: group('蘸酱与抹酱', 'Hummus、haydari 和 aioli 保留具体品种。', false),
  sauce_other: group('其他酱料', '类型不明确，不计算最低价。', false),
  sauce_mixed_offer: group('多种酱料组合', '组合或任选酱料不计算最低价。', false),
  spices: group('香料与调味料', '用途不同，不计算跨香料最低价。', false),
  oil_vinegar: group('食用油与醋', '按升比较，并区分烹调用途。'),
  oil_olive: group('橄榄油', '橄榄油按升比较。'),
  oil_rapeseed: group('菜籽油', '菜籽油按升比较。'),
  oil_sunflower: group('葵花籽油', '葵花籽油按升比较。'),
  oil_frying: group('煎炸用油', '煎炸用油按升比较。'),
  oil_other: group('其他食用油', '油种不明确，不计算最低价。', false),
  oil_mixed_offer: group('多种食用油任选', '葵花籽油、菜籽油等油种任选，不计算统一最低价。', false),
  vinegar: group('醋', '醋按具体品种和容量参考。'),
  canned_beans: group('豆类罐头', '同类豆罐头按净重比较。'),
  canned_coconut_milk: group('椰奶罐头', '椰奶按容量比较。'),
  canned_other: group('其他罐头', '内容物不同，不计算最低价。', false),
  baking_ingredients: group('糖、面粉与烘焙原料', '按公斤比较。'),
  pickled_vegetables: group('腌菜与橄榄', '口味和沥干重量不同，不计算跨品种最低价。', false),
  chips: group('薯片与咸味零食', '多件价会明确标注。'),
  chocolate: group('巧克力与甜食', '巧克力、糖果和甜味棒形态不同，不计算全局最低价。', false),
  biscuits: group('饼干与蛋糕', '饼干、蛋糕和华夫点心形态不同，不计算全局最低价。', false),
  nuts: group('坚果', '优先按公斤比较。'),
  dried_fruit: group('果干与冻干水果', '不与新鲜水果混比，优先按公斤比较。'),
  paper: group('纸品', '优先看每卷或每件。'),
  paper_toilet: group('卫生纸', '卫生纸按卷数、层数和每卷价格参考。'),
  paper_kitchen: group('厨房纸', '厨房纸按卷数和张数参考。'),
  paper_facial: group('手帕纸与面巾纸', '面巾纸按盒数和抽数参考。'),
  paper_napkins: group('餐巾纸', '餐巾纸按张数和规格参考。'),
  paper_wet_wipes: group('湿巾', '湿巾按用途和片数参考。'),
  paper_other: group('其他纸品', '类型不明确，不计算最低价。', false),
  paper_mixed_offer: group('多种生活纸品组合', '卫生纸、厨房纸或面巾纸组合不计算最低价。', false),
  cleaning: group('清洁用品', '区分清洁剂、洗碗和洗衣用品。'),
  cleaning_mixed_offer: group('多种清洁用品任选', '洗衣液、洗衣粉、柔顺剂等用途和计量方式不同，不计算统一最低价。', false),
  household_mixed_offer: group('跨用途日用品任选', '纸品、清洁用品或厨房耗材用途和计量单位不同，不计算统一最低价。', false),
  trash_bags: group('垃圾袋与保鲜袋', '按只数、容量和厚度比较。'),
  kitchen_consumables: group('厨房耗材', '烘焙纸、铝箔等按数量或长度比较。'),
  diapers: group('纸尿裤', '按尺码和每片价格比较。'),
  baby_care: group('婴儿护理', '注意是否无香、适用年龄和包装数量。'),
  baby_food: group('婴幼儿食品', '注意适用月龄、糖分和配料。'),
  hair_body: group('洗发与身体护理', '按容量和用途比较。'),
  personal_care_mixed_offer: group('多种个人护理用品任选', '洗发、护肤、洁面或洗手用品用途不同，不计算统一最低价。', false),
  sun_care: group('防晒用品', '注意 SPF、适用人群和容量。'),
  hygiene: group('卫生护理用品', '按用途、吸收量和包装数量比较。'),
  supplements: group('营养补充剂', '益生菌、纤维等按成分、剂量和包装数量比较，不与乳制品混比。'),
  zero_soda: group('Coca-Cola Zero / Sprite Zero', '仅保留既定无糖饮料范围。'),
  drink_soda: group('汽水与软饮', '普通与无糖汽水按口味、容量和每升价格查看。'),
  drink_juice: group('果汁与果昔', '果汁、果昔和果味饮料按果汁含量、容量和口味查看。'),
  drink_water: group('饮用水与气泡水', '饮用水、矿泉水和气泡水按容量和是否含气查看。'),
  drink_energy: group('能量饮料', '含咖啡因的能量饮料按容量、糖分和咖啡因提示查看。'),
  drink_sports: group('运动饮料与功能饮品', '运动饮料、姜汁 shot 等功能饮品用途和配方不同。', false),
  drink_concentrate: group('浓缩果汁与冲调饮料', '饮用前通常需要兑水，按浓缩比例和容量查看。'),
  drink_other: group('其他非酒精饮料', '类型和配方不同，购买时按原名和包装确认。', false),
  alcohol_beer: group('啤酒', '酒精度、风格和包装规格不同，按实际品牌与包装查看。', false),
  alcohol_wine: group('葡萄酒与起泡酒', '红、白、桃红和起泡酒的葡萄品种、产区与酒精度不同。', false),
  alcohol_spirits: group('烈酒', '威士忌、伏特加、金酒、朗姆等酒种和酒精度不同。', false),
  alcohol_cider_rtd: group('苹果酒与预调酒', '苹果酒、罐装鸡尾酒和预调酒的口味与酒精度不同。', false),
  alcohol_other: group('其他酒类', '酒种未明确时保留原名与包装信息。', false),
  pet_cat: group('猫粮与猫零食', '按猫咪年龄、主粮或零食用途和净重选择。', false),
  pet_dog: group('狗粮与狗零食', '按犬只体型、主粮或零食用途和净重选择。', false),
  pet_other: group('其他宠物用品', '适用动物和用途不同，购买时按包装确认。', false),
  flower_bouquet: group('鲜花与花束', '花材、支数和保鲜期不同。', false),
  plants: group('盆栽与园艺植物', '品种、盆径、养护和室内外用途不同。', false),
  home_appliances: group('家用与厨房小电器', '功能、功率、尺寸和保修条件不同。', false),
  home_cookware: group('锅具与厨房工具', '材质、尺寸、适用炉具和保养方法不同。', false),
  home_storage: group('收纳与容器', '容量、材质、密封方式和用途不同。', false),
  home_decor: group('家居装饰与生活用品', '尺寸、材质和用途不同。', false),
  home_other: group('其他家居用品', '用途和规格不同，购买时按原名确认。', false),
  electronics_audio: group('音频与耳机', '接口、续航、连接方式和保修条件不同。', false),
  electronics_computing: group('电脑与数码配件', '兼容性、接口和规格不同。', false),
  electronics_lighting: group('灯具与电子照明', '灯头、亮度、色温和功率不同。', false),
  electronics_other: group('其他电子电器', '功能、兼容性和安全说明以包装为准。', false),
  clothing_adult: group('成人服饰鞋袜', '尺码、材质和款式不同。', false),
  clothing_children: group('儿童服饰鞋袜', '尺码、年龄段、材质和款式不同。', false),
  clothing_other: group('其他服饰配件', '尺码、材质和用途不同。', false),
  leisure_toys: group('玩具', '适用年龄、配件和安全提示不同。', false),
  leisure_stationery: group('文具与办公用品', '数量、规格和用途不同。', false),
  leisure_books: group('书刊', '语言、主题和版本不同。', false),
  leisure_other: group('其他休闲用品', '用途和规格不同，购买时按原名确认。', false),
  tobacco_cigarettes: group('香烟与烟草', '烟草产品有健康风险，并受年龄限制。', false),
  tobacco_nicotine: group('尼古丁替代与相关产品', '剂量、用途和年龄限制以包装及丹麦规定为准。', false),
  tobacco_other: group('其他烟草或尼古丁产品', '产品类型和法律限制以原包装为准。', false),
  other_offer: group('其他促销商品', '保留无法可靠归类的促销商品，不计算统一最低价。', false),
};

const HEADING_RULES = [
  ['rice_pasta', 'flour_baking', /hvedemel|rugmel|speltmel|specialmel|melblanding|gluten.*mel|bageblanding/],
  ['rice_pasta', 'rice', /\bbulgur\b/],
  ['rice_pasta', 'pasta_noodles', /pastella|giovanni rana|rispapir/],
  ['butter_spreads', 'butter', /kaergaarden|becel|ama madlavning|oma stege|naturli|flydende margarine/],
  ['cheese', 'cheese_aged_hard', /parmigiano reggiano|parmesan|gran gusto/],
  ['cheese', 'cheese_soft_mould', /\bbrie\b|camembert/],
  ['cheese', 'cheese_danish_table', /castello|ostehaps/],
  ['cheese', 'cheese_spreadable', /philadelphia|rygeost/],
  ['cheese', 'cheese_grated', /revet pizzatopping/],
  ['eggs_milk', 'milk', /arla protein|cocio|matilde milkshake|god morgen classic/],
  ['yoghurt', 'yoghurt', /danonino|actimel|risifrutti|yoggi/],
  ['cream_cold_dairy', 'cream', /cremefine|madlavning 4 ?%|mascarpone/],
  ['coffee_tea', 'coffee_tea', /\bbki\b|cafe au lu|cafe noir|gevalia|black coffee|dolce gusto|starbucks|tebreve|kapsler.*chai latte/],
  ['breakfast', 'cereal', /havrefras|bran flakes|ota fiberkost/],
  ['salty_snacks', 'chips', /lay s|pringles|majskager|proteinkugler|protein snack|barebells|nupo|be kind|raw bite|true dates|organic crave/],
  ['candy_chocolate', 'chocolate', /haribo|maoam|ferrero|kaempe skildpadder|lindt|mamba|marshmallows|panda licorice|toffifee|werthers|riesen|toms guld|toms choko|toms go e staenger|sweet corner|sour patch|lakero|stimorol|halls|double salty|sweet salmiak/],
  ['biscuits_cakes', 'biscuits', /karen volf|kammer junkere|gifflar|paagen|wasa runda|knakebrod|vaffelskaale/],
  ['bread_bakery', 'bread', /haandvaerker|rundstykke|faerdigdej|pizzabund|pizzadej|surdejspizza|flutes|sandwichstykke/],
  ['frozen_ready', 'pizza_snacks', /minipizza|pizza prosciutto|pizza diavola/],
  ['frozen_ready', 'dumplings', /foraarsruller|bao buns|dim sum|siao long pao|samosa/],
  ['frozen_ready', 'ready_meal', /middagsretter|knorr retter|snack pot|brunch|sandwich|pho\b|gazpacho|steg selv menu|grillbuffet|one meal|asia box/],
  ['frozen_ready', 'ready_meal', /morgenmenu|hapsermenu|festbuffet|frokostplatte|luksusbuffet|tapasmenu/],
  ['seafood', 'seafood_mixed_offer', /fiskekonservesmarked/],
  ['sauces_condiments', 'sauces', /bahncke|kikkoman ponzu|miracle whip|tex mex|pebermix|dipmix|fruit dips|spreads eller ostetern/],
  ['cooking_oils', 'oil_olive', /ekstra jomfruolie/],
  ['pantry', 'spices', /pankorasp|sesamfro|vanillestang|\bpeber\b/],
  ['canned_pickled', 'pickled_vegetables', /kimchi/],
  ['vegetables', 'leafy_green', /bladselleri|iceberg|gronne asparges|foraarslog|majskolbe/],
  ['fruit', 'peaches_nectarines', /\bferskner\b|stenfrugter/],
  ['chicken', 'whole_chicken', /fransk majskylling/],
  ['minced_meat', 'beef_minced', /friskhakket.*oksekod|hakket dansk.*oksekod/],
  ['minced_meat', 'pork_minced', /hakket dansk.*grisekod/],
  ['pork_fresh', 'pork_tenderloin', /morbrad af.*gris/],
  ['beef', 'beef_roast', /kalvecuvette|cuvette af dansk kalv|oksemorbrad|teres major/],
  ['prepared_meat', 'beef_burgers', /burgerboost/],
  ['prepared_meat', 'prepared_meatballs', /cevapcici|krebinetter/],
  ['prepared_meat', 'prepared_beef_marinated', /marineret tomahawk/],
  ['prepared_meat', 'prepared_pork_marinated', /grillkam|grillben|tykstegsbof af gris/],
  ['prepared_meat', 'prepared_mixed_meat', /grillmarked|grillmix|dansk grillkod|filet a la morbrad|den gronne slagter|fredagstapas|charcuteri|antipasti|kebab|sucuk|slow cooked|yakitori|chicken bites|pizzatopping|topping/],
  ['beef', 'beef_steak', /tykstegsmedaljoner af dansk kalv/],
  ['seafood', 'seafood_other', /\bsild\b/],
  ['household_cleaning', 'cleaning', /opvask|wc rens|maskinopvask|storvask|rengorings|swiffer|vileda|vask\b|haandopvask|stovsugerposer/],
  ['household_cleaning', 'cleaning', /pletrenser|taepperenser|ukrudt|flue.*hvepse|myggelampe|myrebekaempelse|ferroslug|traebeskyttelse/],
  ['personal_care', 'hair_body', /anua|cosrx|biodance|dagcreme|ansigtsmaske|collagen.*cream|master patch|cleansing wipes|hudpleje|personlig pleje|haandcreme|dufte til|haarolie|hair styling|shower cream|palmolive|zendium|jordan|aquafresh|oneblade|skaegtrimmer|trimmer|airstyler|haartorrer|haarklipper|glattejern|bolgejern|remington|flexstyle|renseprodukter|makeup|mellow blur|cheek paint|brow lift|gillette|venus|skraber|vatrondeller|vatpinde|barberblad|bic hybrid|brysttape|insekstik|insektstik|orepropper/],
  ['baby', 'baby_food', /semper klemmeposer/],
  ['personal_care', 'hygiene', /\bbind\b|natbind/],
  ['personal_care', 'supplements', /\b(?:b|c|d3) vitamin\b|magnesium|livol|longo vital|futura|kollagen|collagen powder|creatin|kreatin|proteinpulver|whey|bodylab|fitness pharma|lacto seven|lactrase|natur drogeriet|elektrolytter|murph pwo|optimum nutrition|vita biosa|yummylab collagen|kosttilskud/],
  ['baby', 'baby_care', /babycreme|stofbleer/],
  ['baby', 'diapers', /\b(bleer|buksebleer|diapers)\b/],
  ['baby', 'baby_care', /\b(babypads|babypleje|skumklude|baby wipes|vaadservietter)\b/],
  ['baby', 'baby_food', /\b(babymad|grodpouch)\b/],
  ['personal_care', 'sun_care', /\b(solcreme|solpleje|aftersun|sunscreen|spf)\b/],
  ['personal_care', 'hygiene', /\b(always|tampax|libresse|tena)\b/],
  ['personal_care', 'hair_body', /\b(shampoo|torshampoo|balsam|haarpleje|hudpleje|kropspleje|deodorant|deo|showergel|laebepomade|micellar|ansigtscreme|tandpasta|mundpleje|haandsaebe|barbering|mascara|serum|body)\b/],
  ['personal_care', 'supplements', /kosttilskud|mae?lkesyrebakterier|probiotika|vitaminer|mineraler/],
  ['household', 'trash_bags', /\b(affaldsposer|skraldeposer|fryseposer|snorreposer|klare saekke|genluksposer)\b/],
  ['household', 'paper', /\b(toiletpapir|kokkenrulle|servietter|lommetorklaeder|papir)\b/],
  ['household', 'kitchen_consumables', /\b(bagepapir|alufolie|husholdningsfilm|madpapir|plastruller)\b/],
  ['household', 'cleaning', /\b(husholdningsmarked|at home marked|vaskemiddel|vaskepulver|skyllemiddel|opvask|opvaskemiddel|maskinopvask|rengoring|rodalon|biotex|vanish|omo|klorin|cillit|ajax|domestos|toiletrengoring|skuresvamp|rengoringsmiddel)\b/],
  ['fruit', 'bananas', /\bbananer?\b/],
  ['chicken', 'turkey_mixed_offer', /kalkunoverlaar.*schnitzel.*bryst|schnitzel.*bryst.*kalkunoverlaar/],
  ['chicken', 'turkey_minced', /hakket kalkun/],
  ['chicken', 'turkey_processed', /kalkunhakkebof|cordon bleu.*kalkun/],
  ['chicken', 'turkey_breast', /kalkunbryst|kalkunschnitz|kalkunstrimler/],
  ['chicken', 'turkey_thigh', /kalkunoverlaar|kalkununderlaar/],
  ['chicken', 'poultry_deli_mixed', /kalkunbacon.*(?:paalaeg|postej)|(?:paalaeg|postej).*kalkunbacon/],
  ['chicken', 'other_poultry', /poussin/],
  ['chicken', 'chicken_mixed_offer', /kyllingelaarmix.*hakket kylling|kyllingelaar.*spyd.*overlaar|kyllingevinger.*laarfilet|wings.*nuggets.*spyd/],
  ['beef', 'mixed_meat_offer', /hakket gris.*kalv.*kyllingelaar|kyllingelaar.*hakket gris.*kalv/],
  ['chicken', 'chicken_thigh', /kyllinge?(overlaar|laar|underlaar)|chicken thigh/],
  ['chicken', 'chicken_breast', /kyllingebryst|inderfilet|chicken breast/],
  ['chicken', 'whole_chicken', /hel kylling|grillkylling/],
  ['chicken', 'chicken_minced', /hakket kylling|kyllingefars/],
  ['chicken', 'chicken_other', /\bkylling\b|kyllinge|hotwings|buffalo wings|\bwings\b|cordon bleu/],
  ['pork', 'pork_roast', /flaeskesteg|kamsteg|nakkesteg|ribbensteg|pulled pork|nakkefilet|porchetta/],
  ['pork', 'pork_chop', /kotelet|svinekotelet|grisemorbrad|svinemoerbrad|moerbrad af gris|nakkefilet|frilandsgris|secreto af gris|flaesk i skiver|stegeflaesk|porchetta|kamben/],
  ['pork', 'pork_minced', /hakket gris|hakket svin|grisefars/],
  ['pork', 'sausages', /polse|poelse|grillpolse|grillpoelse|medister|wiener|frankfurter|bockwurst|krakauer|krainer|merguez|chorizo/],
  ['pork', 'bacon_deli', /bacon|skinke|hamburgerryg|leverpostej|postej|paalaeg|salami|serrano|italiensk palaeg|frokost favorit/],
  ['beef', 'mixed_minced', /hakket okse.*gris|hakket gris.*okse|blandet fars/],
  ['beef', 'beef_minced', /hakket okse|oksefars|ground beef|burger boost/],
  ['beef', 'beef_steak', /okseboef|burgerboffer|burgerboef|hamburger af oksekod|rib eye|ribeye|striploin|t bone|cote de boeuf|steak|entrecote|culotte|oksemoerbrad|roastbeef|oksekod i tern|oksekod i strimler|tykstegsboffer|mignon af oksetyksteg|kalvemarked/],
  ['beef', 'beef_deli', /okse.*palaeg|beef.*deli/],
  ['seafood', 'seafood_other', /(?:rejer|vannamei|gambas).*(?:tun|seafood)|(?:tun|seafood).*(?:rejer|vannamei|gambas)/],
  ['seafood', 'salmon_smoked', /(?:koldroget|varmroget|roget|gravad).*laks|laks.*(?:koldroget|varmroget|roget|gravad)/],
  ['seafood', 'salmon_fresh', /laks|salmon/],
  ['seafood', 'shrimp', /rejer|shrimp|prawns/],
  ['seafood', 'white_fish', /torsk|sej|rodspaette|fiskefilet|fiskefars|makrel|sardiner|tun\b|dorade/],
  ['seafood', 'seafood_other', /\bfisk\b|fiskemarked|seafood|skaldyr|muslinger|blaeksprutte/],
  ['eggs_dairy', 'eggs', /\b(?:skrabeaeg|frilandsaeg|okologiske aeg|eggs)\b|\baeg\s*(?:m l|s m|\d+\s*(?:stk|pk))\b/],
  ['eggs_dairy', 'mixed_dairy', /maelk.*(?:flode|skyr|creme fraiche)|(?:flode|skyr|creme fraiche).*maelk/],
  ['eggs_dairy', 'cheese', /\bost\b|skaereost|skiveost|smelteost|friskost|dessertost|grillost|osteplatte|manchego|burrata|blaaskimmelost|smoreost|flodeost|flodehavarti|mozzarella|cheddar|feta|danbo|gouda|havarti|grana padano|parmesan|mexitopping|kaymak/],
  ['eggs_dairy', 'cream', /piskeflode|madlavningsflode|madlavningsjaevner|creme fraiche|fraiche/],
  ['eggs_dairy', 'milk', /kaernemaelk|kakaomaelk|maelk|protein ?drik|proteinshake|milkshakemix/],
  ['eggs_dairy', 'yoghurt', /yoghurt|skyr|kefir|a38|cultura|hytteost|koldskaal|budding|fromage|ricotta|kvarkbar|protein frugtshots/],
  ['eggs_dairy', 'butter', /smor|smorbar|lurpak|bakkedal|margarine|ama flydende/],
  ['pantry', 'canned', /hakkede tomater|kikaerter|bonner|\bdaase\b|tun eller|makrel i tomat|kokosmaelk/],
  ['vegetables', 'mushrooms', /\b(champignon(?:er)?|svampe|shiitake)\b/],
  ['vegetables', 'tomatoes', /tomat/],
  ['vegetables', 'cucumber', /agurk/],
  ['vegetables', 'potatoes_fresh', /kartof/],
  ['vegetables', 'broccoli', /broccoli/],
  ['vegetables', 'cauliflower', /blomkaal/],
  ['vegetables', 'cabbage', /\bkaal\b|spidskaal|hvidkaal|rodkaal|savoykaal/],
  ['vegetables', 'mixed_fresh_herbs', /persille.*eller.*basilikum|basilikum.*eller.*persille/],
  ['vegetables', 'chives', /purlog/],
  ['vegetables', 'basil', /basilikum/],
  ['vegetables', 'parsley', /persille/],
  ['vegetables', 'fresh_herbs', /krydderurter/],
  ['vegetables', 'onion_garlic', /\blog\b|hvidlog|forarslog|ingefaer|purlog/],
  ['vegetables', 'leafy_green', /salat|spinat|pak choi|choy sum/],
  ['vegetables', 'carrots', /gulerod/],
  ['vegetables', 'peas', /\baerter\b/],
  ['vegetables', 'corn', /\bmajs\b(?!\s*kiks)/],
  ['vegetables', 'peppers', /peberfrugt|snackpeber|\brod peber\b/],
  ['vegetables', 'vegetables_other', /groentsag|grontsag|squash|aubergine|porre|bonnespirer/],
  ['fruit', 'apples_pears', /aeble|paere/],
  ['fruit', 'stone_fruit', /fersken|nektarin|blomme|abrikos|kirsebaer|svesker/],
  ['fruit', 'berries', /jordbaer|blaabaer|hindbaer|solbaer/],
  ['fruit', 'tropical_fruit', /mango|avocado|ananas|banan/],
  ['fruit', 'melon', /melon/],
  ['fruit', 'melon_grapes_citrus', /vindruer|druer|appelsin|citron|lime|mandarin/],
  ['fruit', 'fruit_other', /\bfrugt\b/],
  ['bread_grains', 'bread', /rugbrod|brod|boller|rundstykker|baguette|pitabrod|hotdogbrod|fransk hotdog|fladbrod|focaccia|croissant|kanelsnegl|magdalenas|macarons|churros|traestamme/],
  ['bread_grains', 'rice', /\bris\b|jasminris|basmati/],
  ['bread_grains', 'pasta_noodles', /pasta|spaghetti|nudler|noodles|vermicelli|farfalle|gnocchi|fusilli/],
  ['bread_grains', 'flour_baking', /tortilla|wraps|filodej|blinys|pizzamel|\bmel\b/],
  ['frozen_ready', 'pizza_snacks', /\bpizza(?:er)?\b|pizzasnegl|pizza snack/],
  ['frozen_ready', 'dumplings', /dumpling|gyoza|wonton|forarsrulle/],
  ['frozen_ready', 'ice_cream', /ispind|isvafler|isbager|isbaeger|iskasse|ismarked|vaniljeis|mini is|frys selv is|gelato|gelatelli|magnum|\bis\b/],
  ['frozen_ready', 'frozen_vegetables', /frosne groentsager|okologiske groentsager/],
  ['frozen_ready', 'ready_meal', /faerdigret|familieret|familleret|biksemad|lasagne|taerte|suppe|bami goreng|tandoori|falafel|to og server|sushi|paella|gryderet|panini|middagskomponent|dinner kit|pokebowl|noglehulsret|to go marked|frostmarked|asiatisk marked|al fez|blue dragon|go tan|patak/],
  ['breakfast', 'cereal', /musli|mysli|muesli|granola|crusli|cruesli|havregryn|morgenmad|solgryn|\bgrod\b/],
  ['breakfast', 'coffee_tea', /kaffe|nescafe|helbonnemarked|\bte\b/],
  ['breakfast', 'spreads_jam', /marmelade|peanutbutter|nutella|\bhonning\b/],
  ['pantry', 'sauces', /sauce|soja|ketchup|mayonnaise|dressing|remoulade|sennep|pesto|hummus|haydari/],
  ['pantry', 'oil_vinegar', /olivenolie|madolie|rapsolie|eddike|friture olie/],
  ['pantry', 'spices', /krydderi|spidskommen|\bsesam\b|bouillon|fond/],
  ['pantry', 'baking_ingredients', /sukker|bagepulver|vaniljesukker|maizena/],
  ['pantry', 'pickled_vegetables', /syltede|oliven|sauerkraut|ajvar|pindur/],
  ['snacks', 'chips', /chips|doritos|bugles|pretzels|popcorn|flaeskesvaer|majssnack|snacks\b|snack sticks/],
  ['snacks', 'nuts', /mandler|valnodder|nodder|nodd|peanuts|rosiner|solsikkekerner/],
  ['snacks', 'biscuits', /kiks|cookies|(?<!s)kage|gifler|vafler|kammerjunkere|donuts|softcake|toffypops|oreo|bastogne/],
  ['snacks', 'chocolate', /chokolade|slik|bolcher|karamel|lakrids|mentos|marabou|ritter sport|toblerone|kinder|maltesers|skittles|familieposer|bar marked|toms marked|\bbars?\b|proteinbar|toffee|dumle|malaco|toms twist/],
];

// The product form must win over an ingredient or flavour. For example,
// strawberry ice cream is ice cream, not fresh berries; tomato sauce is sauce,
// not fresh tomatoes. These rules intentionally run before the produce rules.
const PRODUCT_FORM_RULES = [
  ['prepared_meat', 'prepared_mixed_meat', /filet ala morbrad.*polser/],
  ['prepared_meat', 'prepared_pork_mixed_offer', /koteletter.*grillsticks.*grillpolser/],
  ['prepared_meat', 'prepared_mixed_meat', /pakkemarked.*klar til grillen/],
  ['prepared_meat', 'prepared_poultry_mixed_offer', /madvaerket.*kyllingebrystfilet.*laarmix/],
  ['prepared_meat', 'prepared_pork_mixed_offer', /mcennedy.*spareribs/],
  ['prepared_meat', 'prepared_mixed_meat', /omhu.*culotte.*frilandslammekod/],
  ['pantry', 'mixed_grocery_offer', /mutti.*tomater.*pizzasauce/],
  ['fruit', 'mixed_stone_fruit', /nektariner.*ferskner.*blommer.*abrikoser/],
  ['beef', 'prepared_lamb_marinated', /marinerede.*(?:lam|lamm)|(?:lam|lamm).*marinerede/],
  ['beef', 'prepared_beef_marinated', /marinerede.*(?:okse|kalv|flank|steak)|(?:okse|kalv|flank|steak).*marinerede/],
  ['prepared_meat', 'mixed_grocery_offer', /frikadeller.*fiskefilet.*kamsteg/],
  ['prepared_meat', 'mixed_grocery_offer', /morbrad.*kartoffel.*kyllingebryst.*flodekartof/],
  ['prepared_meat', 'mixed_meat_offer', /burnt ends.*hakket oksekod|hakket oksekod.*burnt ends/],
  ['frozen_ready', 'mixed_grocery_offer', /groent.*brod|brod.*groent/],
  ['pantry', 'mixed_grocery_offer', /knorr.*pasta.*risretter.*hellmanns.*maille/],
  ['eggs_dairy', 'mixed_dairy', /naturli.*smorbar.*iskaffe.*(?:havre|mandel).*drik/],
  ['baby', 'baby_care', /shampoo.*balsam.*skifteunderlag/],
  ['beef', 'beef_burgers', /burger boost/],
  ['vegetables', 'carrots', /gulerod/],
  ['fruit', 'bananas', /\bbananer?\b/],
  ['pantry', 'oil_mixed_offer', /vita d or.*(?:solsikke|raps)olie/],
  ['bread_grains', 'bread', /focacciabrod|crosti/],
  ['snacks', 'biscuits', /maelkesnitter/],
  ['frozen_ready', 'ready_meal', /taquitos/],
  ['personal_care', 'hair_body', /tandpasta|tandborste|mundskyl|mundpleje/],
  ['household', 'kitchen_tools', /tomatkniv/],
  ['household', 'kitchen_tools', /paalaegsbokse/],
  ['household', 'home_goods', /citronella.*lys/],
  ['pantry', 'canned_tomatoes', /tomatkonserves/],
  ['pantry', 'spices', /ristede log/],
  ['pantry', 'pickled_vegetables', /survarer/],
  ['snacks', 'chocolate', /chokobanan/],
  ['snacks', 'dried_fruit', /torrede|frysetorrede/],
  ['snacks', 'biscuits', /pasteis de nata/],
  ['snacks', 'biscuits', /churros|magdalenas|wienerstang/],
  ['snacks', 'biscuits', /kiks|cookies|jordbaertaerte|jordbaerkage|othellolagkage|donut|pandekage|vafler/],
  ['frozen_ready', 'ready_meal', /fransk hotdog/],
  ['frozen_ready', 'ready_meal', /polsehorn|focaccia.*pepperoni/],
  ['frozen_ready', 'plant_based_meat', /veganske polser|plantebaseret.*polser/],
  ['breakfast', 'cereal', /musli|mysli|muesli|granola|crusli|havregryn|morgenmad|solgryn|\bgrod\b/],
  ['household', 'paper', /\blambi\b|toiletpapir|kokkenrulle|servietter|lommetorklaeder/],
  ['frozen_ready', 'ice_cream', /ispind|isvafler|isbager|isbaeger|iskasse|ismarked|vaniljeis|jordbaeris|frugt fyldt med is|mini is|frys selv is|gelato|gelatelli|magnum|\bis\b/],
  ['bread_grains', 'bread', /smorcroissant|burgerboller|polsebrod|hotdogbrod/],
  ['bread_grains', 'bread', /hvidlogsflutes/],
  ['frozen_ready', 'dumplings', /forarsrulle|spring rolls?|miniruller|asia cubes/],
  ['frozen_ready', 'ready_meal', /smorrebrod/],
  ['snacks', 'dried_fruit', /frugtpaalaeg|grinebidder/],
  ['snacks', 'chocolate', /paalaegschokolade/],
  ['eggs_dairy', 'cheese_fresh', /salatost/],
  ['eggs_dairy', 'cheese', /rejeost|skinkeost/],
  ['frozen_ready', 'deli_spreads', /paalaegssalat/],
  ['vegetables', 'prepared_salad', /salatbowls|hvidkaalssalat/],
  ['vegetables', 'lettuce', /hjertesalat|icebergsalat/],
  ['vegetables', 'spinach', /spinat/],
  ['vegetables', 'mixed_produce', /aerter.*jordbaer|boftomat.*vindruer|mango.*spidskaal/],
  ['fruit', 'mixed_stone_fruit', /nektarin.*fersken.*blomme.*abrikos/],
  ['fruit', 'prepared_fruit', /melonmix|frugtmix|ananas i skiver/],
  ['fruit', 'mixed_fruit', /baer eller frugt|frugt eller baer/],
  ['fruit', 'apples', /\baebler\b|pink lady/],
  ['fruit', 'pears', /\bpaerer\b/],
  ['fruit', 'strawberries', /jordbaer/],
  ['fruit', 'blueberries', /blaabaer/],
  ['fruit', 'other_berries', /solbaer|hindbaer|ribena/],
  ['fruit', 'watermelon', /vandmelon/],
  ['fruit', 'grapes', /vindruer|\bdruer\b/],
  ['fruit', 'cherries', /kirsebaer/],
  ['fruit', 'apricots', /abrikoser?/],
  ['fruit', 'plums', /sveskeblommer|\bblomme\b/],
  ['fruit', 'peaches_nectarines', /nektarin|fersken/],
  ['fruit', 'pineapple', /ananas/],
  ['fruit', 'mango', /\bmango\b/],
  ['fruit', 'avocado', /avocado/],
  ['frozen_ready', 'pizza_snacks', /\bpizza(?:er)?\b|pizzasnegl|pizza snack/],
  ['frozen_ready', 'dumplings', /dumpling|gyoza|wonton|forarsrulle/],
  ['bread_grains', 'pasta_noodles', /lasagneplader|fusilli|penne rigate|suppehorn/],
  ['snacks', 'biscuits', /mazarintaerte|jordbaertaerte|othellolagkage|romkugler|traestamme|donut|pandekage/],
  ['snacks', 'chocolate', /flodeboller/],
  ['frozen_ready', 'frozen_vegetables', /frosne groentsager|okologiske groentsager/],
  ['frozen_ready', 'ready_meal', /faerdigret|familieret|familleret|biksemad|lasagne|taerte|suppe|bami goreng|tandoori|falafel|to og server|sushi|paella|gryderet|panini|middagskomponent|dinner kit|pokebowl|noglehulsret|to go marked|frostmarked|asiatisk marked|al fez|blue dragon|go tan|patak/],
  ['vegetables', 'potato_salad', /kartoffelsalat/],
  ['frozen_ready', 'potato_sides', /pommes frites|kartoffelbaade|kartoffelkroket|kartoffelgratin|flodekartof|kartoffelrosti|peka kartof/],
  ['pantry', 'mixed_grocery_offer', /tun.*(?:majs|tomater|pizzasauce)|(?:majs|tomater|pizzasauce).*tun/],
  ['frozen_ready', 'mixed_grocery_offer', /blaeksprutte.*chorizo/],
  ['seafood', 'seafood_mixed_offer', /laks.*(?:rejer|orred|krebsehaler|havtaske|fiskesalat)|(?:rejer|orred|krebsehaler|havtaske|fiskesalat).*laks|(?:rejer|vannamei|gambas).*(?:tun|fiskepinde|seafood)|(?:tun|fiskepinde|seafood).*(?:rejer|vannamei|gambas)/],
  ['seafood', 'salmon_smoked', /(?:koldroget|varmroget|roget|gravad).*laks|laks.*(?:koldroget|varmroget|roget|gravad)/],
  ['seafood', 'salmon_fresh', /laks|salmon/],
  ['seafood', 'shrimp', /rejer|shrimp|prawns|vannamei|gambas/],
  ['seafood', 'seafood_mixed_offer', /fiskefrikadeller.*eller.*roget makrel|roget makrel.*eller.*fiskefrikadeller/],
  ['seafood', 'fish_mince', /fiskefars/],
  ['seafood', 'white_fish', /tunsteak|tun steak|torsk|sej|rodspaette|fiskefilet|makrel|sardiner|\btun\b|dorade/],
  ['seafood', 'seafood_other', /skagensalat|fiskesalat|seafoodmix|fiskemarked|skaldyr|muslinger|blaeksprutte/],
  ['chicken', 'turkey_mixed_offer', /kalkunoverlaar.*schnitzel.*bryst|schnitzel.*bryst.*kalkunoverlaar/],
  ['chicken', 'poultry_deli_mixed', /kalkunbacon.*(?:paalaeg|postej)|(?:paalaeg|postej).*kalkunbacon/],
  ['chicken', 'turkey_minced', /hakket kalkun/],
  ['chicken', 'turkey_processed', /kalkunhakkebof|cordon bleu.*kalkun/],
  ['chicken', 'turkey_breast', /kalkunbryst|kalkunschnitz|kalkunstrimler/],
  ['chicken', 'turkey_thigh', /kalkunoverlaar|kalkununderlaar/],
  ['chicken', 'other_poultry', /poussin/],
  ['chicken', 'prepared_chicken_wings_mixed_offer', /(?:classic|original).*(?:eller).*(?:crispy|breaded).*(?:hot wings|wings)/],
  ['chicken', 'prepared_chicken_wings_seasoned', /hotwings|buffalo wings|sol mar kyllingevinger|piri.*(?:chicken wings|kyllingevinger)|(?:chicken wings|kyllingevinger).*piri/],
  ['chicken', 'prepared_chicken_wings_breaded', /(?:crispy|breaded|paneret).*(?:hot wings|kyllingevinger|chicken wings)|(?:hot wings|kyllingevinger|chicken wings).*(?:crispy|breaded|paneret)/],
  ['chicken', 'prepared_chicken_breast_marinated', /marineret kyllingebryst|kyllingebryst.*(?:bbq|citron|rosmarin)/],
  ['chicken', 'prepared_poultry_mixed_offer', /poussin.*marineret.*eller|marineret.*eller.*poussin/],
  ['pork', 'prepared_pork_mixed_offer', /(?:pulled pork|pulled chicken|spareribs|porchetta|roget hamburgerryg|marineret kamfilet).*(?:eller)|(?:eller).*(?:pulled pork|pulled chicken|spareribs|porchetta|roget hamburgerryg|marineret kamfilet)|(?:gris|svin|flaesk|kotelet|kamben|sparerib|ribsteak|kamfilet|skinkeculotte|morbrad).*(?:eller).*(?:marineret|bbq|chimichurri|ovnklar)|(?:marineret|bbq|chimichurri|ovnklar).*(?:eller).*(?:gris|svin|flaesk|kotelet|kamben|sparerib|ribsteak|kamfilet|skinkeculotte|morbrad)/],
  ['pork', 'prepared_pork_cooked', /pulled pork/],
  ['pork', 'prepared_pork_cooked', /rogede? kamben|kamben.*roget/],
  ['pork', 'prepared_pork_marinated', /porchetta|kotelet.*tilsat lage|kotelet.*(?:tomat|ramslog)|marinerede? spareribs/],
  ['pork', 'prepared_pork_mixed_offer', /krydrede kodboller.*eller.*hakket gris|hakket gris.*eller.*krydrede kodboller/],
  ['pork', 'prepared_pork_marinated', /(?:marineret|bbq|barbecue|chimichurri|mesquit|smokey|paprika|lakrids|firepit|gyros|ovnklar).*(?:gris|svin|flaesk|kotelet|kamben|sparerib|ribsteak|kamfilet|skinkeculotte|morbrad)|(?:gris|svin|flaesk|kotelet|kamben|sparerib|ribsteak|kamfilet|skinkeculotte|morbrad).*(?:marineret|bbq|barbecue|chimichurri|mesquit|smokey|paprika|lakrids|firepit|gyros|ovnklar)/],
  ['beef', 'prepared_lamb_marinated', /(?:marineret|bbq|hvidlog).*(?:lam|lamm)|(?:lam|lamm).*(?:marineret|bbq|hvidlog)/],
  ['beef', 'prepared_beef_marinated', /(?:marineret|chimichurri|bbq|hvidlog|peberkant).*(?:okse|kalv|steak|flank|flatsteak|culotte)|(?:okse|kalv|steak|flank|flatsteak|culotte).*(?:marineret|chimichurri|bbq|hvidlog|peberkant)/],
  ['beef', 'mixed_meat_offer', /hakket gris.*kalv.*kyllingelaar|kyllingelaar.*hakket gris.*kalv/],
  ['chicken', 'chicken_mixed_offer', /bryst.*(?:laar|laarmix|hakket)|(?:laar|laarmix|hakket).*bryst|kyllingemarked|kyllingelaarmix.*hakket kylling|kyllingelaar.*spyd.*overlaar|kyllingevinger.*laarfilet|wings.*nuggets.*spyd/],
  ['chicken', 'chicken_thigh', /kyllinge?(overlaar|laar|underlaar)|chicken thigh/],
  ['chicken', 'chicken_breast', /kyllingebryst|inderfilet|chicken breast/],
  ['chicken', 'whole_chicken', /hel kylling|grillkylling/],
  ['chicken', 'chicken_minced', /hakket kylling|kyllingefars/],
  ['chicken', 'chicken_wings', /kyllingevinger|hot ?wings|buffalo wings|\bwings\b/],
  ['chicken', 'chicken_breaded', /kyllingepopcorn|kyllingeburger|kyllingenugget|chicken nuggets?|cordon bleu/],
  ['chicken', 'chicken_skewers', /kyllingespyd/],
  ['chicken', 'chicken_sausages', /kylling snack polser|kyllingepolser/],
  ['chicken', 'chicken_other', /\bkylling\b|kyllinge/],
  ['pork', 'pork_mixed_offer', /hakket.*(?:kotelet|medister|flaesk|frilandsgris|kodbol)|(?:kotelet|medister|flaesk|frilandsgris|kodbol).*hakket|morbrad.*nakkefilet|nakkefilet.*morbrad|grisemorbrad.*ribbensteg|spareribs.*pulled|pulled.*spareribs|long ribs.*morbrad|morbrad.*long ribs|kamfilet.*porchetta.*hamburgerryg|flaeskesteg.*kamfilet.*skinkeculotte|postej.*medister|polser.*bacon|bacon.*polser/],
  ['pork', 'prepared_mixed_meat', /taga.*bacondadler.*fuet|bacondadler.*fuet|(?:postej|leverpostej).*(?:eller).*medister|medister.*(?:eller).*(?:postej|leverpostej)/],
  ['beef', 'mixed_minced', /hakket.*(?:gris|svin|okse|kalv).*(?:gris|svin|okse|kalv)|mesterhakket.*(?:grise|okse)/],
  ['pork', 'prepared_meatballs', /farsbrod|kodbol|frikadeller/],
  ['pork', 'bacon_deli', /bacon|skinke|hamburgerryg|leverpostej|postej|paalaeg|salami|serrano|rullepolse|saltkod/],
  ['pork', 'sausages', /polse|poelse|grillpolse|grillpoelse|medister|wiener|frankfurter|bockwurst|krakauer|krainer|merguez|chorizo|griller/],
  ['pork', 'pork_tenderloin', /grisemorbrad|svinemoerbrad|moerbrad af gris|moerbrad.*gris/],
  ['pork', 'pork_roast', /ribbensteg/],
  ['pork', 'pork_ribs', /kamben|spareribs|long ribs|ribben/],
  ['pork', 'pork_roast', /flaeskesteg|kamsteg|nakkesteg|ribbensteg|pulled pork|nakkefilet|porchetta/],
  ['pork', 'pork_chop', /kotelet|svinekotelet|grisemorbrad|svinemoerbrad|moerbrad af gris|nakkefilet|frilandsgris|secreto af gris|flaesk i skiver|stegeflaesk|porchetta|kamben/],
  ['beef', 'beef_mixed_offer', /roastbeef.*(?:steak|mignon)|(?:steak|mignon).*roastbeef|striploin.*ribeye roast|ribeye roast.*striploin|culotte.*flatsteak|flatsteak.*culotte|rumpsteak.*entrecote|entrecote.*rumpsteak|striploin.*(?:ribeye|rumpsteak)|(?:ribeye|rumpsteak).*striploin|kalvesteaks.*hojrebsboffer|kalvemarked/],
  ['beef', 'lamb_other', /lamme|lammeculotte|lammekod|lamb/],
  ['beef', 'beef_burgers', /burgerboffer|burgerboef|hamburger af oksekod/],
  ['beef', 'beef_diced', /oksekod i tern|oksekod i strimler/],
  ['beef', 'beef_roast', /culotte|roastbeef|ribeye roast|tyndsteg/],
  ['beef', 'beef_ribeye', /rib eye|ribeye|entrecote|ribsteak/],
  ['beef', 'beef_striploin', /striploin/],
  ['beef', 'beef_flat_steak', /flatsteak|flanksteak/],
  ['beef', 'beef_rump_steak', /rumpsteak|tykstegsboffer|mignon af oksetyksteg/],
  ['beef', 'beef_bone_steak', /t bone|cote de boeuf/],
  ['beef', 'beef_steak', /okseboef|steak|oksemoerbrad/],
  ['personal_care', 'supplements', /kosttilskud|mae?lkesyrebakterier|probiotika|vitaminer|mineraler/],
  ['eggs_dairy', 'mixed_dairy', /maelk.*(?:flode|skyr|creme fraiche)|(?:flode|skyr|creme fraiche).*maelk/],
  ['eggs_dairy', 'cheese', /\bost\b|skaereost|skiveost|smelteost|friskost|dessertost|grillost|osteplatte|manchego|burrata|blaaskimmelost|smoreost|flodeost|flodehavarti|mozzarella|cheddar|feta|danbo|gouda|havarti|grana padano|parmesan|mexitopping|kaymak|hytteost|ricotta/],
  ['eggs_dairy', 'butter', /smor|smorbar|lurpak|bakkedal|margarine|vita d or|ama flydende/],
  ['eggs_dairy', 'cream', /piskeflode|madlavningsflode|madlavningsjaevner|creme fraiche|fraiche/],
  ['eggs_dairy', 'yoghurt', /yoghurt|skyr|kefir|a38|cultura|hytteost|koldskaal|budding|fromage|ricotta|kvarkbar|protein frugtshots/],
  ['eggs_dairy', 'milk', /kaernemaelk|kakaomaelk|maelk|protein ?drik|proteinshake|milkshakemix/],
  ['eggs_dairy', 'plant_drinks', /soja.*drik|havre.*drik|plantedrik/],
  ['fruit', 'melon', /honningmelon|kantalupmelon|cantaloupemelon|piel de sapo/],
  ['vegetables', 'peppers', /peberfrugt|snackpeber|\brod peber\b/],
  ['bread_grains', 'mixed_bakery', /brod.*(?:kage|cookies|biscuits)|(?:kage|cookies|biscuits).*brod/],
  ['bread_grains', 'bread', /rugbrod|brod|boller|rundstykker|baguette|pitabrod|hotdogbrod|fransk hotdog|fladbrod|focaccia|croissant|kanelsnegl|magdalenas|macarons|churros/],
  ['snacks', 'biscuits', /ris(?: |-)eller majskiks|riskiks|majskiks/],
  ['snacks', 'chocolate', /sesambar/],
  ['bread_grains', 'rice', /\bris\b|jasminris|basmati/],
  ['bread_grains', 'pasta_noodles', /pasta|spaghetti|nudler|noodles|vermicelli|farfalle|gnocchi|fusilli/],
  ['bread_grains', 'flour_baking', /tortilla|wraps|filodej|blinys|pizzamel|\bmel\b/],
  ['breakfast', 'cereal', /musli|mysli|muesli|granola|crusli|havregryn|morgenmad|solgryn|\bgrod\b/],
  ['breakfast', 'coffee_tea', /kaffe|nescafe|helbonner|merrild|lavazza|\bte\b/],
  ['breakfast', 'spreads_jam', /marmelade|peanutbutter|nutella|\bhonning\b/],
  ['snacks', 'dried_fruit', /frysetorr|torret frugt|svesker|rosiner/],
  ['snacks', 'chips', /bananchips|chips|doritos|bugles|pretzels|popcorn|flaeskesvaer|majssnack|snacks\b|snack sticks/],
  ['snacks', 'nuts', /mandler|valnodder|nodder|noddeblanding|peanuts|solsikkekerner/],
  ['snacks', 'biscuits', /kiks|cookies|(?<!s)kage|gifler|vafler|kammerjunkere|donuts|softcake|toffypops|oreo|bastogne/],
  ['snacks', 'chocolate', /chokolade|slik|bolcher|karamel|lakrids|mentos|marabou|ritter sport|toblerone|kinder|maltesers|skittles|familieposer|bar marked|toms marked|\bbars?\b|proteinbar|toffee|dumle|malaco|toms twist/],
  ['pantry', 'canned', /hakkede tomater|kikaerter|bonner|\bdaase\b|tun eller|makrel i tomat|kokosmaelk/],
  ['pantry', 'sauces', /sauce|soja|ketchup|mayonnaise|dressing|remoulade|sennep|pesto|hummus|haydari/],
  ['pantry', 'oil_vinegar', /olivenolie|madolie|rapsolie|eddike|friture olie/],
  ['pantry', 'spices', /krydderi|spidskommen|\bsesam\b|bouillon|fond/],
  ['pantry', 'baking_ingredients', /sukker|bagepulver|vaniljesukker|maizena/],
  ['pantry', 'pickled_vegetables', /syltede|oliven|sauerkraut|ajvar|pindur/],
];

const DRINK_ALLOWED = /coca cola zero|coke zero|sprite zero/;
const DRINK_WORDS = /\bcola\b|pepsi|\bfanta\b|sprite|sodavand|danskvand|kildevand|mineralvand|vand med brus|sparkling lemonade|proteinvand|aloe ?vera vand|soft drink|energidrik|energy|juice|saft|ribena|capri sun|blue keld|powerade|club mate|cocio|faxe kondi|fever tree|fritz kola|guarana|harboe 2 0|innocent|mogu mogu|monster|red bull|rynkeby|san pellegrino|perrier|sodastream|vitamin well|nobe|valsollille|frugtbrus|\bnektar\b|smoothie|sportsdrik|ice tea|drik\b|ingefaershot|\bshot\b|til opblanding|t opblanding/;
const WINE_WORDS = /\b(vin|wine|vino|rosso|rodvin|hvidvin|rosevin|shiraz|syrah|chardonnay|sauvignon|riesling|pinot|cabernet|merlot|malbec|tempranillo|moscato|prosecco|champagne|cremant|cava|amarone|appassimento|ripasso|primitivo|zinfandel|chianti|barolo|rioja|bourgogne|bordeaux|chablis|saint emilion|cotes du rhone|coteaux d aix|gigondas|montalcino|spumante|gruner veltliner|spatburgunder|verdejo|negroamaro|bodegas|chateau|domaine|cuvee|reserva|crianza|douro|igp|i boks|bag in box|vinmarked|casillero del diablo|appassinero|auguste bessac|ernst ludwig|jean marie garnier|the wild life|balthazar|candeline|chandon|cono sur|cote des roses|dark horse|early harvest|fortune cove|veronia|gran appasso|grande alberone|jp chenet|juan de juanes|la belle angele|la mancha|langhe|misty cove|macon|matsu|mentor|mucho mas|santa luna|santa rita|seleccion del hermanito|silverboom|south african bay|sweet escape|toftrup|torres|spier note|zonin|verdi)\b/;
const SPIRIT_WORDS = /\b(whisky|whiskey|vodka|gin|rom|cognac|tequila|snaps|akvavit|aquavit|bitter|likor|spiritus|spiritusmarked|soju|jaegermeister|aperol|bacardi|baileys|campari|fernet|underberg|limoncello|gammel dansk|jack daniels|jameson|tullamore|sarti rosa)\b/;
const BEER_WORDS = /\b(ol|beer|specialol|olmarked|pilsner|leffe|hoegaarden|carlsberg|tuborg|heineken|corona|grimbergen|slots classic|royal classic)\b/;
const RTD_WORDS = /\b(cider|breezer|mokai|shaker|smirnoff ice|alcopop|cocktail|spritz|sangria|ready to drink cocktail|hard seltzer|slush cocktail|elderflower spritz)\b/;
const ALCOHOL = new RegExp(`${WINE_WORDS.source}|${SPIRIT_WORDS.source}|${BEER_WORDS.source}|${RTD_WORDS.source}`);
const PET = /\b(?:hundesnacks|hundefoder|hundeposer|kattefoder|kattemad|kattegodt|indekatte|godbidder?\s+t\s+kat|t\s+hund|t\s+kat)\b|\b(?:dreamies|pedigree|frolic|latz|whiskas|purina|sheba|best friend snack|gourmet gold|beef stick|dogman|jolly paw)\b/;
const ELECTRONICS = /\b(elektronik|soundbar|sound tower|hojttaler|hojtaler|bluetoothhojttaler|hovedtelefon|oretelefon|in ear|on ear|over ear|headset|skaerm|smart tv|pc|chromebook|ipad|macbook|apple watch|armbaandsur|projektor|computer|computertaske|tablet|iphone|samsung galaxy|xiaomi redmi|zte blade|doro|realme|telefon|oplader|biloplader|mobiloplader|ladekabel|ladestander|powerbank|usb|microsd|bluetooth|smartwatch|printer|laserjet|kamera|overvagningskamera|overvaagningskamera|router|wifi|wi fi|extender|harddisk|radio|clock radio|cd afspiller|dvd afspiller|pladespiller|digital billedramme|fotoramme|streaming box|google tv|tv vaegbeslag|controller|gaming mus|tradlos mus|keyboard|tastatur|mikrofon|stylus pen|mobilholder|norton 360|spillekonsol|nintendo switch|ps5|playstation|airpods|stromskinne|solcelle opladningspanel)\b|led\s+(?:paere|lampe|bordlampe|standerlampe)|\b(?:lg|hisense|philips|prosonic|samsung)\s+(?:\d{2}|tq|tu)/;
const HOME_APPLIANCES = /\b(damprenser|luftblaeser|affugter|luftrenser|purifier|juicepresser|kaffemaskine|espressomaskine|kokkenmaskine|badevaegt|induktionskogeplade|vaskemaskine|kondenstorretumbler|torretumbler|ovn|pizzaovn|brodrister|elkedel|toastmaskine|sandwichtoaster|vaffeljern|stovsuger|robotstovsuger|cyklonstovsuger|hoover|dampmoppe|gulvvasker|steamer|strygejern|dampstrygejern|kogeplade|kodhakker|elektrisk hakker|kontaktgrill|frituregryde|riskoger|multihakker|minihakker|multiskaerer|stavblender|stavblendersaet|vakuumpakker|ismaskine|slush ice|soft ice maker|gasgrill|airfryer|mikroovn|mikrobolgeovn|kokkenvaegt|koleskab|fryseskab|kole fryseskab|luftkoler|ventilator|varmtvandsdispenser|vinkoleskab|koleboks)\b/;
const HOME_COOKWARE = /\b(kokkenredskab|kokkenredskaber|kokkenartikler|kokkentilbehor|gryde|grydesaet|kasserolle|maelkegryde|pande|pandesaet|minipande|serveringspande|kniv|knivblok|bestik|bestikbakke|service|flergangsservice|borneservice|bordopdaekning|skaerebraet|bageform|dorslag|skaal|skaale|skaalesaet|glasskaale|ovnfast fad|stegegryde|stegepande|wok|si|sier|glas|shotsglas|termoglas|termokrus|termokop|termoflaske|universallaag|grillbakke|grillbriketter|forklaede|viskestykke|viske stykker|bordskaner|vandfilter|brita|y skraeller)\b/;
const HOME_STORAGE = /\b(drikkedunk|drikkeflaske|vanddunk|madkasse|madopbevaringsbokse|snackboks|minibokse|opbevaringsglas|opbevaringsboks|opbevaringsbotte|opbevaringskasse|opbevaringskurv|opbevaringsbokse|glasbeholder|flaske|skoreol|skoskab|blomsterreol|kurv|traadkurv|pyntekurv|opbevaring|plastopbevaring|foldekasse|foldekasser|indkobskurv|sortimentsboks|sortimentsbokse|vasketojskurv)\b/;
const HOME_OTHER = /\b(vaerktoj|vaerktojssaet|termometer|ophaengningstilbehor|duftlys|bloklys|pearlwax lys|fletlanterner|duftolie|stagelys|fyrfadslys|havelys|citronella lys|betonstage|pude|kammerpude|hovedpude|nakkepude|naturfyldspude|dyne|juniordyne|termodyne|silkedyne|sommerdyne|silkesommerdyne|taeppe|varmetaeppe|picnictaeppe|fleeceplaid|rejsetaeppe|vattaeppe|haandklaede|badehaandklaede|gaestehaandklaede|mikrofiber haandklaeder|viskestykke|sengetoj|sengesaet|lagen|straeklagen|rullemadras|rullemadrasser|boxmadras|boxmadrasseng|madras|seng|natbord|hynde|hyndeboks|bokshynde|siddehynde|havehynder|filtpuder|puf|skammel|maatte|bademaatte|dormaatte|gardin|rullegardin|dug|damaskdug|telt|tipi|pavillon|festivaltelt|festivalstol|foldestol|bornefoldestol|havestol|havestole|loungestol|spisebordsstol|barstol|cafe bord|cafebord|havebord|sidebord|sofabord|spisebord|bord baenke saet|loungebord|loungesofa|loungesaet|traekvogn|grill|udekokken|krukke|selvvandingskrukke|vase|decopfad|potteskjuler|husholdningsartikel|batterier|gaffatape|kabelbindere|skruetraekker|skruetraekkersaet|topnoglesaet|taenger|superlim|bojler|torrestativ|stige|stormsikring|strygebraetbetraek|akustiske traepaneler|klebefolie|luftmadras|pool|skuffemaatte|vinkoler|karklude|kokkentekstiler|gavepapir|papkrus|paptallerken|koleskabsmagneter|kort med kuvert|sommerpynt|sommerhavenisse|spand med udvrider|bordopdaekning)\b/;
const CLOTHING = /\b(beklaedning|t shirt|stroptop|croptop|tanktop|g streng|boxershorts|hipsters|trusser|stromper|sneakerstromper|bornestromper|glimmerstromper|sko|lyssko|sneakers|ballerina|skechers|slippers|sandaler|flip flops|clogs|stovler|gummistovler|texstovler|jakke|regnjakke|bukser|regnbukser|smækbukser|suitpants|joggingbukser|jeans|nederdel|leggings|caprileggings|tights|kjole|bluse|musselinbluse|skjorte|skjortejakke|cardigan|strikcardigan|undertoj|undertroje|herreundertroje|mens underwear|bh|handsker|hue|hat|bollehat|straahat|kasket|baelte|baeltetaske|torklaede|shorts|badeshorts|denimshorts|indershorts|cykelshorts|sweatshorts|nattoj|natdragt|hoodie|sweatsaet|regnsaet|strik|badeponcho|solbriller|pandebaand|halskaede|oreringe|haarpynt|haarklemme|haarspaende)\b/;
const CHILDREN_CLOTHING = /(?:borne|born|baby|kids|lupilu).*(?:toj|sko|sneakers|stromper|jakke|bukser|leggings|troje|top|trusser|hat|kasket|nattoj|natdragt)|(?:toj|sko|sneakers|stromper|jakke|bukser|leggings|troje|top|trusser|hat|kasket|nattoj|natdragt).*(?:borne|born|baby|kids|lupilu)/;
const LEISURE = /\b(legetoj|legetojsbiler|aktivitetslegetoj|sanselegetoj|skriveredskaber|skrivesaet|skriveartikler|kontorartikler|skoleaccessories|skolesaet|staedtler|twinmarkers|dualmarkers|designermarker|brushpens|bog|notesbog|notesboger|spiralnotesbog|spiralhaefte|opgavebog|pegebog|kogebog|haefte|kalender|studiekalender|ugeplan|dagsplan|tavle|belonningstavle|penalhus|skoletaske|rygsaek|bornetaske|taske|mappe|elastikmappe|bogbind|blyant|grafitblyanter|kuglepen|kuglepenne|viskelaeder|geometrisaet|kompassersaet|spil|minecraft|samlealbum|puslespil|kropspuslespil|krea|farveblyanter|perler|perleboks|perleplader|diamond art|sjippetov|gadekridt|kridt|bamse|plys|samlefigur|funko pop|laeringskort|laeringscomputer|laeringstaarn|airtrack|trampolin|gynge|gyngestativ|legetaarn|sandkasse|kongespil|bowlingsaet|ringspil|rutsjebane|strandspil|strandleg|sandlegetoj|fodbold|basketstander|padelbolde|sup board|cykel|cykelhjelm|elbil|rideon|atv|offroader|buggy|skaterhjelm|maalmandshandsker)\b/;
const FLOWERS = /\b(blomst|blomster|buket|roser|krysantemum|krysantemumbuket|havechrysanthemum|hortensia|syrenhortensia|klokkeblomst|tulipan|blomsterpicks)\b/;
const PLANTS = /\b(plante|potteplante|haveplante|krydderurt|kalanchoe|orkide|miniorkide|sukkulent|muehlenbeckia|hedera|stauder|sunbeckia|yucca|cycas|strelitzia|alocasia|klokkelyng|myrte|palmemarked|graes til haven)\b/;
const TOBACCO = /\b(cigaret|tobak|nikotin|nicorette|nicotinell|snus)\b/;
const PRIORITY_FOOD_FORM = [
  ['baby', 'baby_food', /babymad/],
  ['sauces_condiments', 'sauce_mixed_offer', /sauce.*whisky|whisky.*sauce/],
  ['breakfast', 'spreads_jam', /blomsterhonning|\bhonning\b/],
  ['ice_cream', 'ice_cream', /\b(?:is|sandwichis|flodeis|flodebolleis|astronautis|sun lolly)\b/],
  ['candy_chocolate', 'chocolate', /skolekridt/],
  ['eggs_milk', 'milk', /\b(?:cocio|matilde milkshake)\b/],
  ['eggs_milk', 'milk', /arla oko maelkedrik/],
  ['eggs_milk', 'plant_drinks', /naturli.*plantedrik/],
  ['baby', 'baby_food', /semper.*(?:grod|smoothie)/],
  ['leisure', 'leisure_other', /beer bong/],
  ['home_kitchen', 'home_cookware', /cocktail shaker/],
  ['home_kitchen', 'home_other', /loungestol/],
  ['potato_products', 'potato_sides', /ovn kartofler/],
];

const drinkGroup = heading => {
  if (/energidrik|energy/.test(heading)) return 'drink_energy';
  if (/juice|smoothie|\bnektar\b/.test(heading)) return 'drink_juice';
  if (/danskvand|mineralvand|kildevand|\bvand\b/.test(heading)) return 'drink_water';
  if (/sportsdrik|ingefaershot|\bshot\b/.test(heading)) return 'drink_sports';
  if (/saft|ribena|opblanding/.test(heading)) return 'drink_concentrate';
  if (/cola|sprite|sodavand|soft drink|pepsi|fanta/.test(heading)) {
    return DRINK_ALLOWED.test(heading) && !/fanta|pepsi(?! max)/.test(heading) ? 'zero_soda' : 'drink_soda';
  }
  return 'drink_other';
};

const alcoholGroup = heading => {
  if (BEER_WORDS.test(heading)) return 'alcohol_beer';
  if (WINE_WORDS.test(heading)) return 'alcohol_wine';
  if (SPIRIT_WORDS.test(heading)) return 'alcohol_spirits';
  if (RTD_WORDS.test(heading)) return 'alcohol_cider_rtd';
  return 'alcohol_other';
};

const electronicsGroup = text => /soundbar|sound tower|hojttaler|hojtaler|hovedtelefon|oretelefon|in ear|on ear|over ear|headset|airpods|radio|pladespiller|cd afspiller/.test(text) ? 'electronics_audio'
  : (/skaerm|pc|chromebook|ipad|macbook|tablet|telefon|oplader|powerbank|usb|smartwatch|apple watch|printer|laserjet|kamera|router|wifi|harddisk|keyboard|tastatur|gaming mus|mikrofon/.test(text) ? 'electronics_computing'
    : (/led\s+paere|lampe|belysning/.test(text) ? 'electronics_lighting' : 'electronics_other'));

export function isClearlyOutOfScope(raw) {
  const text = norm(`${raw?.heading || raw?.originalName || ''} ${raw?.description || raw?.originalDescription || ''}`);
  return !text;
}

export function classifyOffer(raw) {
  const heading = norm(raw.heading);
  const text = norm(`${raw.heading || ''} ${raw.description || ''}`);
  if (!heading || isClearlyOutOfScope(raw)) return null;
  for (const [categoryId, comparisonGroup, regex] of PRIORITY_FOOD_FORM) {
    if (regex.test(heading)) return classified(categoryId, comparisonGroup, heading);
  }
  if (/alkoholfri/.test(heading)) return classified('drinks', 'drink_other', heading);
  if (ALCOHOL.test(heading)) return classified('alcohol', alcoholGroup(heading), heading);
  if (PET.test(heading)) return classified('pet', /kat|cat|dreamies|latz|whiskas|sheba|gourmet gold/.test(heading) ? 'pet_cat' : (/hund|dog|pedigree|frolic/.test(heading) ? 'pet_dog' : 'pet_other'), heading);
  if (TOBACCO.test(heading)) return classified('tobacco_nicotine', /cigaret|tobak/.test(heading) ? 'tobacco_cigarettes' : 'tobacco_nicotine', heading);
  if (ELECTRONICS.test(heading)) {
    return classified('electronics', electronicsGroup(heading), heading);
  }
  if (HOME_APPLIANCES.test(heading)) return classified('home_kitchen', 'home_appliances', heading);
  if (HOME_COOKWARE.test(heading)) return classified('home_kitchen', 'home_cookware', heading);
  if (HOME_STORAGE.test(heading)) return classified('home_kitchen', 'home_storage', heading);
  if (CLOTHING.test(heading)) return classified('clothing', CHILDREN_CLOTHING.test(heading) ? 'clothing_children' : 'clothing_adult', heading);
  if (LEISURE.test(heading)) {
    const group = /legetoj|spil|puslespil|bamse|plys|samlefigur|perler|airtrack|rutsjebane/.test(heading) ? 'leisure_toys'
      : (/skrive|kontor|marker|blyant|kuglepen|viskelaeder|penalhus|kalender|haefte|notesbog|mappe|bogbind/.test(heading) ? 'leisure_stationery'
        : (/\bbog\b|pegebog|kogebog/.test(heading) ? 'leisure_books' : 'leisure_other'));
    return classified('leisure', group, heading);
  }
  if (FLOWERS.test(heading)) return classified('flowers_plants', 'flower_bouquet', heading);
  if (PLANTS.test(heading)) return classified('flowers_plants', 'plants', heading);
  if (HOME_OTHER.test(heading)) return classified('home_kitchen', 'home_other', heading);
  if (DRINK_WORDS.test(heading)) {
    // Dairy protein drinks and plant drinks are handled by explicit food rules.
    if (!/protein ?drik|proteinshake|yoghurt|kefir|cultura|soja|havre/.test(heading)) {
      return classified('drinks', drinkGroup(heading), heading);
    }
  }
  if (/poussin.*mariner/.test(text)) return classified('chicken', 'prepared_poultry_mixed_offer', text);
  if (/flanksteak.*(?:alm|mariner)/.test(text)) return classified('beef', 'prepared_beef_mixed_offer', text);
  if (/(?:svinekotelet|kotelet).*(?:alm|mariner)/.test(text)) return classified('pork', 'prepared_pork_mixed_offer', text);
  for (const [categoryId, comparisonGroup, regex] of PRODUCT_FORM_RULES) {
    if (regex.test(heading)) return classified(categoryId, comparisonGroup, heading);
  }
  for (const [categoryId, comparisonGroup, regex] of HEADING_RULES) {
    if (regex.test(heading)) return classified(categoryId, comparisonGroup, heading);
  }
  // Descriptions may clarify explicit frozen products or broad household bundles,
  // but never use package units alone as proof that something is food.
  if (/dybfrost/.test(text)) {
    if (/groentsag/.test(text)) return classified('frozen_ready', 'frozen_vegetables', heading);
    if (/is\b|ispinde|isvafler/.test(text)) return classified('frozen_ready', 'ice_cream', heading);
    if (/mad|ret|kylling|pizza|brod/.test(text)) return classified('frozen_ready', 'ready_meal', heading);
  }
  if (/affaldsposer|bagepapir|fryseposer|opvaskeborste|rengoringsmiddel/.test(text)) {
    return classified('household', /affald|fryseposer/.test(text) ? 'trash_bags' : 'cleaning', heading);
  }
  // Some flyer headings are only model or collection names. When ordinary
  // product-form rules found nothing, use explicit nouns from the flyer body
  // rather than leaving recognisable wine, electronics, bikes and tents in
  // the generic bucket.
  if (ALCOHOL.test(text)) return classified('alcohol', alcoholGroup(text), heading);
  if (ELECTRONICS.test(text)) return classified('electronics', electronicsGroup(text), heading);
  if (/\b(?:hjul|staalstel|aluminiumsstel).*(?:gear|bremse|daek)|(?:gear|bremse).*(?:hjul|stel|daek)\b/.test(text)) {
    return classified('leisure', 'leisure_other', heading);
  }
  if (/vandsojletryk|\b\d+ personer\b.*\b\d+ rum\b/.test(text)) return classified('home_kitchen', 'home_other', heading);
  return classified('other_offers', 'other_offer', heading);
}

export function normalizedText(value) { return norm(value); }
