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
  ['chicken', '🐔', '鸡肉与其他禽肉', '鸡胸、鸡腿、整鸡、火鸡和禽肉末分组比较。'],
  ['pork', '🐷', '猪肉与香肠', '鲜猪肉、培根、肉肠和熟食分开比较。'],
  ['beef', '🥩', '牛肉与肉末', '牛肉末、牛排和整块牛肉分别比较。'],
  ['seafood', '🐟', '鱼虾海鲜', '区分三文鱼、白身鱼、虾和熟制海鲜。'],
  ['eggs_dairy', '🥚', '鸡蛋与乳制品', '鸡蛋、牛奶、酸奶、奶酪和黄油分组显示。'],
  ['vegetables', '🥬', '蔬菜', '蘑菇、番茄、土豆、叶菜等按品种比较。'],
  ['fruit', '🍎', '水果', '按品种、重量或单件价格显示。'],
  ['bread_grains', '🍚', '米面与面包', '大米、面条、意面、面包和烘焙主食。'],
  ['frozen_ready', '🍕', '冷冻、冰品与方便餐', '冷冻主食、冰淇淋和即食餐分组显示。'],
  ['breakfast', '🥣', '早餐、咖啡与抹酱', '麦片、燕麦、咖啡、果酱和花生酱。'],
  ['pantry', '🧂', '调料、罐头与烹饪食材', '只包含酱料、食用油、香料、面粉和真正的罐头食品。'],
  ['snacks', '🍫', '零食甜品', '薯片、坚果、饼干、糖果和巧克力。'],
  ['household', '🧻', '家庭清洁与耗材', '垃圾袋、纸品、清洁剂和厨房耗材；不会再混进食品。'],
  ['baby', '🍼', '婴幼儿用品', '纸尿裤、婴儿棉片和无香护理用品。'],
  ['personal_care', '🧴', '个人护理', '洗发、沐浴、防晒和身体护理用品。'],
  ['drinks', '🥤', '指定无糖饮料', '按既定范围只保留 Coca-Cola Zero 与 Sprite Zero。'],
].map(([id, emoji, nameZh, descriptionZh]) => ({ id, emoji, nameZh, descriptionZh, color: '#315f51' }));

const group = (nameZh, noteZh) => ({ nameZh, noteZh });
export const AARHUS_COMPARISON_GROUPS = {
  chicken_thigh: group('鸡腿肉', '同为鸡腿部位时优先按公斤比较。'),
  chicken_breast: group('鸡胸肉', '鸡胸与鸡里脊保留原名差异。'),
  whole_chicken: group('整鸡', '按公斤比较整只鸡。'),
  chicken_minced: group('鸡肉末', '适合肉丸、饺子馅或炒肉末。'),
  chicken_other: group('其他鸡肉', '部位不同，单位价格仅作参考。'),
  turkey_other: group('火鸡与其他禽肉', '火鸡、童子鸡等按部位和单位价格参考。'),
  pork_roast: group('烤猪肉块', '带皮、部位和骨头会影响可比性。'),
  pork_chop: group('猪排与猪肉片', '按公斤初步比较。'),
  pork_minced: group('猪肉末', '按公斤比较。'),
  sausages: group('香肠与烤肠', '烟熏、肉含量和调味可能不同。'),
  bacon_deli: group('培根与猪肉熟食', '加工方式不同，单位价格仅作参考。'),
  beef_minced: group('牛肉末', '脂肪比例不同会影响口感。'),
  mixed_minced: group('猪牛混合肉末', '不与纯牛肉末混为一组。'),
  beef_steak: group('牛排与整块牛肉', '不同部位差异较大。'),
  beef_deli: group('牛肉熟食', '加工与调味不同。'),
  salmon: group('三文鱼', '鲜鱼、冷冻和烟熏产品会保留说明。'),
  shrimp: group('虾', '熟虾与生虾用途不同。'),
  white_fish: group('白身鱼', '不同鱼种保留原名。'),
  seafood_other: group('其他海鲜', '贝类和加工海鲜不强行视作同一种。'),
  eggs: group('鸡蛋', '优先按每枚价格比较。'),
  milk: group('牛奶与奶油', '液体产品按升比较。'),
  yoghurt: group('酸奶与 Skyr', '糖分、蛋白质和脂肪含量可能不同。'),
  cheese: group('奶酪', '奶酪种类差异较大，单位价格只作辅助。'),
  butter: group('黄油与抹酱', '真黄油与混合抹酱保留原名。'),
  mushrooms: group('蘑菇', '只收录真正的食用蘑菇。'),
  cauliflower: group('花椰菜', '花椰菜单独按公斤或每颗比较。'),
  broccoli: group('西兰花', '西兰花单独按公斤或每颗比较。'),
  lettuce: group('生菜与沙拉叶', '整颗生菜与袋装沙拉叶保留规格差异。'),
  spinach: group('菠菜', '新鲜菠菜按包装重量比较。'),
  fresh_herbs: group('新鲜香草', '欧芹、罗勒、细香葱等按品种和盆/把比较。'),
  root_vegetables: group('胡萝卜与根茎菜', '按具体品种和公斤价格比较。'),
  peppers: group('甜椒与辣椒', '甜椒和辣椒保留辣度与包装差异。'),
  peas: group('豌豆', '新鲜、冷冻或带荚状态必须分别确认。'),
  corn: group('玉米', '鲜玉米棒与罐装玉米不混为一组。'),
  vegetable_mix: group('蔬菜组合', '多种蔬菜混合包按用途、组成和重量参考。'),
  mixed_produce: group('果蔬任选', '跨品种任选促销不参与单一品种最低价。'),
  prepared_salad: group('预制沙拉', '已拌制或切配沙拉按配料和包装比较。'),
  potatoes_fresh: group('新鲜土豆', '只比较新鲜整颗土豆，优先看每公斤价格。'),
  potato_salad: group('土豆沙拉', '冷藏调味土豆沙拉按重量比较。'),
  potato_sides: group('加工土豆配菜', '薯角、薯饼、焗土豆等按形态和重量参考。'),
  tomatoes: group('番茄', '小番茄与普通番茄保留原名。'),
  cucumber: group('黄瓜', '通常按每根或每公斤比较。'),
  potatoes: group('土豆', '按公斤比较。'),
  cabbage: group('甘蓝、花椰菜与西兰花', '不同品种保留名称。'),
  onion_garlic: group('葱姜蒜与洋葱', '按公斤或每包比较。'),
  leafy_green: group('叶菜', '包装重量和新鲜度很重要。'),
  vegetables_other: group('其他蔬菜', '按原名识别具体品种。'),
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
  mixed_stone_fruit: group('核果任选', '桃、李、杏等任选促销不强行视作同一品种。'),
  pineapple: group('菠萝', '整颗与切片菠萝分开参考。'),
  mango: group('芒果', '芒果按每颗或公斤价格比较。'),
  avocado: group('牛油果', '牛油果按成熟度、每颗或包装比较。'),
  prepared_fruit: group('切配水果', '果切和水果拼盘按组成、重量和保鲜期参考。'),
  mixed_fruit: group('水果任选', '多种水果或莓果任选不参与单一品种最低价。'),
  canned_tomatoes: group('番茄罐头', '切碎、整粒和调味番茄罐头按净重与用途比较。'),
  cheese_fresh: group('新鲜白奶酪', '沙拉奶酪、白奶酪等按盐度和重量参考。'),
  home_goods: group('家居用品', '蜡烛等非食品按用途、数量和规格比较。'),
  kitchen_tools: group('厨房工具', '刀具等耐用品不参与食品单位价比较。'),
  stone_fruit: group('桃、油桃与李子', '按公斤或每件比较。'),
  berries: group('莓果', '小包装优先看每公斤价格。'),
  tropical_fruit: group('热带水果', '牛油果等常按每个出售。'),
  melon_grapes_citrus: group('瓜果、葡萄与柑橘', '按公斤或每件比较。'),
  fruit_other: group('其他水果', '品种和成熟度会影响价格。'),
  bread: group('面包', '黑麦、法棍和小面包用途不同。'),
  rice: group('大米', '大包装通常单位价更低。'),
  pasta_noodles: group('意面、面条与泡面', '产品差异较大，保留原名。'),
  flour_baking: group('面粉与烘焙主食', '区分面粉、饼皮和烘焙制品。'),
  pizza_snacks: group('披萨与披萨点心', '口味和大小不同。'),
  dumplings: group('饺子与冷冻点心', '不同国家口味和烹调方式可能不同。'),
  ready_meal: group('方便餐', '按总价和规格参考。'),
  frozen_vegetables: group('冷冻蔬菜', '优先按公斤比较。'),
  ice_cream: group('冰淇淋与冰品', '容量、支数和类型不同。'),
  cereal: group('麦片与早餐谷物', '糖分、坚果和水果含量可能不同。'),
  coffee_tea: group('咖啡与茶', '咖啡豆、粉和速溶咖啡不完全可比。'),
  spreads_jam: group('果酱与抹酱', '甜度、坚果含量和用途不同。'),
  canned: group('罐头食品', '适合长期保存和快速做饭。'),
  sauces: group('酱料', '口味差异大，不只按单位价判断。'),
  spices: group('香料与调味料', '说明适合的烹调方式。'),
  oil_vinegar: group('食用油与醋', '按升比较，并区分烹调用途。'),
  baking_ingredients: group('糖、面粉与烘焙原料', '按公斤比较。'),
  pickled_vegetables: group('腌菜与橄榄', '口味和沥干重量不同。'),
  chips: group('薯片与咸味零食', '多件价会明确标注。'),
  chocolate: group('巧克力与甜食', '保留主要口味。'),
  biscuits: group('饼干与蛋糕', '包装和甜度不同。'),
  nuts: group('坚果', '优先按公斤比较。'),
  dried_fruit: group('果干与冻干水果', '不与新鲜水果混比，优先按公斤比较。'),
  paper: group('纸品', '优先看每卷或每件。'),
  cleaning: group('清洁用品', '区分清洁剂、洗碗和洗衣用品。'),
  trash_bags: group('垃圾袋与保鲜袋', '按只数、容量和厚度比较。'),
  kitchen_consumables: group('厨房耗材', '烘焙纸、铝箔等按数量或长度比较。'),
  diapers: group('纸尿裤', '按尺码和每片价格比较。'),
  baby_care: group('婴儿护理', '注意是否无香、适用年龄和包装数量。'),
  baby_food: group('婴幼儿食品', '注意适用月龄、糖分和配料。'),
  hair_body: group('洗发与身体护理', '按容量和用途比较。'),
  sun_care: group('防晒用品', '注意 SPF、适用人群和容量。'),
  hygiene: group('卫生护理用品', '按用途、吸收量和包装数量比较。'),
  zero_soda: group('Coca-Cola Zero / Sprite Zero', '仅保留既定无糖饮料范围。'),
};

const HEADING_RULES = [
  ['baby', 'diapers', /\b(bleer|buksebleer|diapers)\b/],
  ['baby', 'baby_care', /\b(babypads|babypleje|skumklude|baby wipes|vaadservietter)\b/],
  ['baby', 'baby_food', /\b(babymad|grodpouch)\b/],
  ['personal_care', 'sun_care', /\b(solcreme|solpleje|aftersun|sunscreen|spf)\b/],
  ['personal_care', 'hygiene', /\b(always|tampax|libresse|tena)\b/],
  ['personal_care', 'hair_body', /\b(shampoo|torshampoo|balsam|haarpleje|hudpleje|kropspleje|deodorant|deo|showergel|laebepomade|micellar|ansigtscreme|tandpasta|mundpleje|haandsaebe|badevaegt|barbering|mascara|serum|body)\b/],
  ['household', 'trash_bags', /\b(affaldsposer|skraldeposer|fryseposer|snorreposer|klare saekke|genluksposer)\b/],
  ['household', 'paper', /\b(toiletpapir|kokkenrulle|servietter|lommetorklaeder|papir)\b/],
  ['household', 'kitchen_consumables', /\b(bagepapir|alufolie|husholdningsfilm|madpapir|plastruller)\b/],
  ['household', 'cleaning', /\b(husholdningsmarked|at home marked|vaskemiddel|vaskepulver|skyllemiddel|opvask|opvaskemiddel|maskinopvask|rengoring|rodalon|biotex|vanish|omo|klorin|cillit|ajax|domestos|toiletrengoring|skuresvamp|rengoringsmiddel)\b/],
  ['chicken', 'chicken_thigh', /kyllinge?(overlaar|laar|underlaar)|chicken thigh/],
  ['chicken', 'chicken_breast', /kyllingebryst|brystfilet|inderfilet|chicken breast/],
  ['chicken', 'whole_chicken', /hel kylling|grillkylling/],
  ['chicken', 'chicken_minced', /hakket kylling|kyllingefars/],
  ['chicken', 'turkey_other', /kalkun|poussin/],
  ['chicken', 'chicken_other', /\bkylling\b|kyllinge|hotwings|buffalo wings|\bwings\b|cordon bleu/],
  ['pork', 'pork_roast', /flaeskesteg|kamsteg|nakkesteg|ribbensteg|spareribs|pulled pork/],
  ['pork', 'pork_chop', /kotelet|svinekotelet|grisemorbrad|svinemoerbrad|moerbrad af gris|nakkefilet|frilandsgris|secreto af gris|flaesk i skiver|stegeflaesk|porchetta|kamben/],
  ['pork', 'pork_minced', /hakket gris|hakket svin|grisefars/],
  ['pork', 'sausages', /polse|poelse|grillpolse|grillpoelse|medister|wiener|frankfurter|bockwurst|krakauer|krainer|merguez|chorizo/],
  ['pork', 'bacon_deli', /bacon|skinke|hamburgerryg|leverpostej|postej|paalaeg|salami|serrano|italiensk palaeg|frokost favorit/],
  ['beef', 'mixed_minced', /hakket okse.*gris|hakket gris.*okse|blandet fars/],
  ['beef', 'beef_minced', /hakket okse|oksefars|ground beef|burger boost/],
  ['beef', 'beef_steak', /okseboef|burgerboffer|burgerboef|hamburger af oksekod|rib eye|ribeye|striploin|t bone|cote de boeuf|steak|entrecote|culotte|oksemoerbrad|roastbeef|oksekod i tern|oksekod i strimler|tykstegsboffer|mignon af oksetyksteg|kalvemarked/],
  ['beef', 'beef_deli', /okse.*palaeg|beef.*deli/],
  ['seafood', 'salmon', /laks|salmon/],
  ['seafood', 'shrimp', /rejer|shrimp|prawns/],
  ['seafood', 'white_fish', /torsk|sej|rodspaette|fiskefilet|fiskefars|makrel|sardiner|tun\b|dorade/],
  ['seafood', 'seafood_other', /\bfisk\b|fiskemarked|seafood|skaldyr|muslinger|blaeksprutte/],
  ['eggs_dairy', 'eggs', /\b(aeg|skrabeaeg|frilandsaeg|eggs)\b/],
  ['eggs_dairy', 'milk', /maelk|flode|protein ?drik|proteinshake|milkshakemix/],
  ['eggs_dairy', 'yoghurt', /yoghurt|skyr|kefir|a38|cultura|hytteost|koldskaal|budding|fromage|ricotta|kvarkbar|protein frugtshots/],
  ['eggs_dairy', 'cheese', /\bost\b|skaereost|skiveost|smelteost|friskost|dessertost|grillost|osteplatte|manchego|burrata|blaaskimmelost|smoreost|flodeost|mozzarella|cheddar|feta|danbo|gouda|havarti|grana padano|parmesan|mexitopping|kaymak/],
  ['eggs_dairy', 'butter', /smor|smorbar|lurpak|bakkedal|margarine|vita d or|ama flydende/],
  ['pantry', 'canned', /hakkede tomater|kikaerter|bonner|\bdaase\b|tun eller|makrel i tomat|kokosmaelk/],
  ['vegetables', 'mushrooms', /\b(champignon(?:er)?|svampe|shiitake)\b/],
  ['vegetables', 'tomatoes', /tomat/],
  ['vegetables', 'cucumber', /agurk/],
  ['vegetables', 'potatoes', /kartof/],
  ['vegetables', 'cabbage', /\bkaal\b|spidskaal|blomkaal|broccoli/],
  ['vegetables', 'onion_garlic', /\blog\b|hvidlog|forarslog|ingefaer|purlog/],
  ['vegetables', 'leafy_green', /salat|spinat|pak choi|choy sum|basilikum|persille/],
  ['vegetables', 'vegetables_other', /groentsag|grontsag|aerter|majs(?!kiks)|peberfrugt|gulerod|squash|aubergine|porre|bonnespirer/],
  ['fruit', 'apples_pears', /aeble|paere/],
  ['fruit', 'stone_fruit', /fersken|nektarin|blomme|abrikos|kirsebaer|svesker/],
  ['fruit', 'berries', /jordbaer|blaabaer|hindbaer|solbaer/],
  ['fruit', 'tropical_fruit', /mango|avocado|ananas|banan/],
  ['fruit', 'melon_grapes_citrus', /melon|vindruer|druer|appelsin|citron|lime|mandarin/],
  ['fruit', 'fruit_other', /\bfrugt\b/],
  ['bread_grains', 'bread', /rugbrod|brod|boller|rundstykker|baguette|pitabrod|hotdogbrod|fransk hotdog|fladbrod|focaccia|croissant|kanelsnegl|magdalenas|macarons|churros|traestamme/],
  ['bread_grains', 'rice', /\bris\b|jasminris|basmati/],
  ['bread_grains', 'pasta_noodles', /pasta|spaghetti|nudler|noodles|vermicelli|farfalle|gnocchi|fusilli/],
  ['bread_grains', 'flour_baking', /tortilla|wraps|filodej|blinys|pizzamel|\bmel\b/],
  ['frozen_ready', 'pizza_snacks', /\bpizza(?:er)?\b|pizzasnegl|pizza snack/],
  ['frozen_ready', 'dumplings', /dumpling|gyoza|wonton|forarsrulle/],
  ['frozen_ready', 'ice_cream', /ispind|isvafler|isbager|isbaeger|iskasse|ismarked|vaniljeis|mini is|frys selv is|gelato|gelatelli|magnum|\bis\b/],
  ['frozen_ready', 'frozen_vegetables', /frosne groentsager|okologiske groentsager|pommes frites/],
  ['frozen_ready', 'ready_meal', /faerdigret|familieret|familleret|biksemad|lasagne|taerte|suppe|bami goreng|tandoori|falafel|to og server|sushi|paella|gryderet|middagskomponent|dinner kit|pokebowl|noglehulsret|to go marked|frostmarked|asiatisk marked|al fez|blue dragon|go tan|patak/],
  ['breakfast', 'cereal', /musli|mysli|muesli|granola|crusli|havregryn|morgenmad|solgryn|\bgrod\b/],
  ['breakfast', 'coffee_tea', /kaffe|nescafe|helbonnemarked|\bte\b/],
  ['breakfast', 'spreads_jam', /marmelade|peanutbutter|nutella|honning/],
  ['pantry', 'sauces', /sauce|soja|ketchup|mayonnaise|dressing|remoulade|sennep|pesto|hummus|haydari/],
  ['pantry', 'oil_vinegar', /olivenolie|madolie|rapsolie|eddike|friture olie/],
  ['pantry', 'spices', /krydderi|spidskommen|chili|peber|salt|sesam|bouillon|fond/],
  ['pantry', 'baking_ingredients', /sukker|bagepulver|vaniljesukker|maizena/],
  ['pantry', 'pickled_vegetables', /syltede|oliven|sauerkraut|ajvar|pindur/],
  ['snacks', 'chips', /chips|doritos|bugles|pretzels|popcorn|flaeskesvaer|majssnack|snacks\b|snack sticks/],
  ['snacks', 'nuts', /mandler|valnodder|nodder|nodd|peanuts|rosiner|solsikkekerner/],
  ['snacks', 'biscuits', /kiks|cookies|kage|gifler|vafler|kammerjunkere|donuts|softcake|toffypops|oreo|bastogne/],
  ['snacks', 'chocolate', /chokolade|slik|bolcher|karamel|lakrids|mentos|marabou|ritter sport|toblerone|kinder|maltesers|skittles|familieposer|bar marked|toms marked|\bbars?\b|proteinbar|toffee|dumle|malaco|twist/],
];

// The product form must win over an ingredient or flavour. For example,
// strawberry ice cream is ice cream, not fresh berries; tomato sauce is sauce,
// not fresh tomatoes. These rules intentionally run before the produce rules.
const PRODUCT_FORM_RULES = [
  ['frozen_ready', 'ice_cream', /ispind|isvafler|isbager|isbaeger|iskasse|ismarked|vaniljeis|jordbaeris|frugt fyldt med is|mini is|frys selv is|gelato|gelatelli|magnum|\bis\b/],
  ['frozen_ready', 'pizza_snacks', /\bpizza(?:er)?\b|pizzasnegl|pizza snack/],
  ['frozen_ready', 'dumplings', /dumpling|gyoza|wonton|forarsrulle/],
  ['frozen_ready', 'frozen_vegetables', /frosne groentsager|okologiske groentsager|pommes frites/],
  ['frozen_ready', 'ready_meal', /faerdigret|familieret|familleret|biksemad|lasagne|taerte|suppe|bami goreng|tandoori|falafel|to og server|sushi|paella|gryderet|middagskomponent|dinner kit|pokebowl|noglehulsret|to go marked|frostmarked|asiatisk marked|al fez|blue dragon|go tan|patak/],
  ['bread_grains', 'bread', /rugbrod|brod|boller|rundstykker|baguette|pitabrod|hotdogbrod|fransk hotdog|fladbrod|focaccia|croissant|kanelsnegl|magdalenas|macarons|churros|traestamme/],
  ['bread_grains', 'rice', /\bris\b|jasminris|basmati/],
  ['bread_grains', 'pasta_noodles', /pasta|spaghetti|nudler|noodles|vermicelli|farfalle|gnocchi|fusilli/],
  ['bread_grains', 'flour_baking', /tortilla|wraps|filodej|blinys|pizzamel|\bmel\b/],
  ['breakfast', 'cereal', /musli|mysli|muesli|granola|crusli|havregryn|morgenmad|solgryn|\bgrod\b/],
  ['breakfast', 'coffee_tea', /kaffe|nescafe|helbonnemarked|\bte\b/],
  ['breakfast', 'spreads_jam', /marmelade|peanutbutter|nutella|honning/],
  ['snacks', 'dried_fruit', /frysetorr|torret frugt|svesker|rosiner/],
  ['snacks', 'chips', /bananchips|chips|doritos|bugles|pretzels|popcorn|flaeskesvaer|majssnack|snacks\b|snack sticks/],
  ['snacks', 'nuts', /mandler|valnodder|nodder|noddeblanding|peanuts|solsikkekerner/],
  ['snacks', 'biscuits', /kiks|cookies|kage|gifler|vafler|kammerjunkere|donuts|softcake|toffypops|oreo|bastogne/],
  ['snacks', 'chocolate', /chokolade|slik|bolcher|karamel|lakrids|mentos|marabou|ritter sport|toblerone|kinder|maltesers|skittles|familieposer|bar marked|toms marked|\bbars?\b|proteinbar|toffee|dumle|malaco|twist/],
  ['pantry', 'canned', /hakkede tomater|kikaerter|bonner|\bdaase\b|tun eller|makrel i tomat|kokosmaelk/],
  ['pantry', 'sauces', /sauce|soja|ketchup|mayonnaise|dressing|remoulade|sennep|pesto|hummus|haydari/],
  ['pantry', 'oil_vinegar', /olivenolie|madolie|rapsolie|eddike|friture olie/],
  ['pantry', 'spices', /krydderi|spidskommen|chili|peber|salt|sesam|bouillon|fond/],
  ['pantry', 'baking_ingredients', /sukker|bagepulver|vaniljesukker|maizena/],
  ['pantry', 'pickled_vegetables', /syltede|oliven|sauerkraut|ajvar|pindur/],
];

const DRINK_ALLOWED = /coca cola zero|coke zero|sprite zero/;
const DRINK_WORDS = /cola|sprite|sodavand|soft drink|energidrik|energy|juice|saft|\bnektar\b|smoothie|sportsdrik|ice tea|drik\b/;
const ALCOHOL = /\b(ol|vin|whisky|vodka|gin|rom|cider|soju|jaegermeister|mousserende|zinfandel|merlot|pinot grigio|rosé)\b|carlsberg|tuborg|heineken|corona|grimbergen/;
const DURABLE_OR_IRRELEVANT = /\b(legetoj|vaerktoj|beklaedning|elektronik|soundbar|skaerm|computer|oplader|blomst|plante|t shirt|boxershorts|stromper|bog|termometer|skriveredskaber|kontorartikler|dualmarkers|drikkedunk|madkasse|opbevaringsglas|madopbevaringsbokse|kokkenredskab|flaske|juicepresser|ophaengningstilbehor|cigaret|tobak|nicorette)\b/;

export function classifyOffer(raw) {
  const heading = norm(raw.heading);
  const text = norm(`${raw.heading || ''} ${raw.description || ''}`);
  if (!heading || ALCOHOL.test(text) || DURABLE_OR_IRRELEVANT.test(text)) return null;
  if (DRINK_WORDS.test(heading)) {
    if (DRINK_ALLOWED.test(heading)) return { categoryId: 'drinks', comparisonGroup: 'zero_soda' };
    // Dairy protein drinks and plant drinks are handled by explicit food rules.
    if (!/protein ?drik|proteinshake|yoghurt|kefir|cultura|soja|havre/.test(heading)) return null;
  }
  for (const [categoryId, comparisonGroup, regex] of PRODUCT_FORM_RULES) {
    if (regex.test(heading)) return { categoryId, comparisonGroup };
  }
  for (const [categoryId, comparisonGroup, regex] of HEADING_RULES) {
    if (regex.test(heading)) return { categoryId, comparisonGroup };
  }
  // Descriptions may clarify explicit frozen products or broad household bundles,
  // but never use package units alone as proof that something is food.
  if (/dybfrost/.test(text)) {
    if (/groentsag/.test(text)) return { categoryId: 'frozen_ready', comparisonGroup: 'frozen_vegetables' };
    if (/is\b|ispinde|isvafler/.test(text)) return { categoryId: 'frozen_ready', comparisonGroup: 'ice_cream' };
    if (/mad|ret|kylling|pizza|brod/.test(text)) return { categoryId: 'frozen_ready', comparisonGroup: 'ready_meal' };
  }
  if (/affaldsposer|bagepapir|fryseposer|opvaskeborste|rengoringsmiddel/.test(text)) {
    return { categoryId: 'household', comparisonGroup: /affald|fryseposer/.test(text) ? 'trash_bags' : 'cleaning' };
  }
  return null;
}

export function normalizedText(value) { return norm(value); }
