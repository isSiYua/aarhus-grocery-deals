const BASE_URL = 'https://backflipp.wishabi.com/flipp';
const TIMEOUT_MS = 15_000;
const RETRIES = 3;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const normalized = value => String(value || '').trim().toLowerCase();

export const flippKnowledgeKey = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

async function fetchJson(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => value !== undefined && value !== null && url.searchParams.set(key, String(value)));
  let lastError;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'aarhus-grocery-deals/0.3 (+personal price comparison)' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (response.status === 429 || response.status >= 500) {
        await sleep(600 * 2 ** attempt);
        continue;
      }
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES - 1) await sleep(600 * 2 ** attempt);
    }
  }
  throw lastError || new Error('Flipp API request failed');
}

export async function fetchFlyers(postalCode, fetchPage = fetchJson) {
  const payload = await fetchPage('/flyers', { postal_code: postalCode });
  if (!payload || !Array.isArray(payload.flyers)) throw new Error('Flipp flyers response must contain a flyers array');
  return payload.flyers;
}

export async function fetchFlyerItems(flyerId, postalCode, fetchPage = fetchJson) {
  const payload = await fetchPage(`/flyers/${flyerId}`, { postal_code: postalCode });
  if (!payload || !Array.isArray(payload.items)) throw new Error('Flipp flyer response must contain an items array');
  return payload.items;
}

export function chooseCurrentFlyer(flyers, source, now = new Date()) {
  const merchant = normalized(source.merchant);
  const acceptedNames = source.flyerNames.map(normalized);
  const matching = flyers.filter(flyer => normalized(flyer.merchant) === merchant && acceptedNames.includes(normalized(flyer.name)));
  const current = matching.filter(flyer => new Date(flyer.valid_from) <= now && new Date(flyer.valid_to) >= now);
  current.sort((a, b) => new Date(b.valid_from) - new Date(a.valid_from));
  return current[0] || null;
}

// Product-form rules come before ingredient words.  This prevents names such
// as "Pork and Beans" and "Butter Croissants" from being captured by pork or
// butter before the complete product can be understood.
const NON_GROCERY_PATTERN = /\b(airpods?|apple pencil|water shoes?|sneakers?|graphic tee|shorts set|backpack|toaster|waffle maker|coffee maker|espresso maker|ice cream maker|sorbet maker|creami|frozen drink machine|air conditioner|patio coffee table|cornhole|swing|carpet cleaner|steam mop|water filter pitcher)\b/i;

const PRODUCT_RULES = [
  ['pet', /\b(dog|cat|pet)\b/i, '宠物食品或零食；请按原名确认适用犬猫、口味、净重和喂食量，不是人食。'],
  ['baby', /\b(diapers?|pampers|huggies)\b/i, '婴儿纸尿裤；应按体重、尺码、吸收需求和每片价格选择。'],
  ['baby', /\b(infant oatmeal|baby food|formula)\b/i, '婴幼儿辅食；购买时需按月龄、配料和过敏原选择。'],
  ['household', /\b(laundry detergent|detergent pods?|oxi ?clean)\b/i, '洗衣液或洗衣凝珠，用于机洗衣物；不是食品，应按洗衣量和包装说明投放。'],
  ['household', /\b(dishwasher detergent|dishwasher pacs?|dishwasher.*tabs?|powerball)\b/i, '洗碗机专用洗涤块或洗涤剂；不能当作手洗洗洁精使用，也必须远离食品。'],
  ['household', /\b(toilet paper|bath tissue|bathroom tissue)\b/i, '卫生纸；比较时除总价外还要看卷数、层数和每卷长度。'],
  ['household', /\b(paper towels?)\b/i, '厨房纸巾，可吸油吸水和擦拭台面；比较时看卷数、尺寸与每卷张数。'],
  ['household', /\b(facial tissue|kleenex|puffs)\b/i, '抽取式面巾纸；适合日常清洁和擤鼻涕，比较时看盒数与总抽数。'],
  ['household', /\b(air freshener|laundry hamper)\b/i, '家庭日用品；请按原名确认是空气清新剂还是洗衣篮，不是食品。'],
  ['personal', /\b(toothpaste|sensodyne|colgate|crest)\b/i, '牙膏，用于日常口腔清洁；按含氟量、敏感牙或美白需求选择。'],
  ['personal', /\b(lozenges?|dry-mouth relief)\b/i, '含片或润喉糖，用于缓解口干或咽喉不适；应按包装用量使用，不是新鲜水果。'],
  ['personal', /\b(body wash|hand soap|shampoo|conditioner|dry shampoo|body scrub|shave oil|razor|deodorant|antiperspirant|hair oil|lip oil)\b/i, '个人洗护用品；请按原名确认是清洁、剃刮、除味还是护发产品，不是食品。'],

  ['pantry', /\bpork and beans\b/i, '美式番茄酱汁猪肉焗豆罐头，主要是熟豆类，带少量猪肉调味；可加热配面包、米饭或烧烤，不是生猪肉。'],
  ['pantry', /\b(mac\s*(?:&|and)\s*cheese|macaroni.*cheese)\b/i, '芝士通心粉，是常温盒装主食，煮熟面后拌入芝士酱；类似奶酪味方便意面。'],
  ['snacks', /\b(rice krispies treats?|cookie pudding)\b/i, '甜味谷物棒或布丁类零食，可直接食用；虽然名称含米、花生酱或饼干，但不是大米或早餐抹酱。'],
  ['pantry', /\b(peanut butter|grape (?:jam|jelly)|jam|jelly)\b/i, '花生酱或果酱，可抹面包、搭配早餐或用于烘焙；这是常温抹酱，不是新鲜水果或乳制品。'],
  ['snacks', /\b(fruit\s*(?:&|and)\s*nut bar|protein bar)\b/i, '水果坚果棒或蛋白棒，开袋即食，适合随身加餐；比较时看净重、蛋白质与含糖量。'],
  ['drinks', /\b(capri[ -]?sun|juice drink blend|fruit punch)\b/i, '果汁风味饮料，通常为便携小袋装，可冷藏后直接饮用；不是新鲜水果，应查看果汁含量和添加糖。'],
  ['bakery', /\bbutter croissants?\b/i, '黄油可颂，层次酥松的烘焙面包，可直接吃或复烤作早餐；虽然含黄油，但应归入面包烘焙。'],
  ['produce', /\bsweet potatoes? with butter\b/i, '加黄油调味的红薯配菜，口感甜软，通常加热后食用；主体是红薯，不是乳制品。'],
  ['bakery', /\b(apple|guava).*pie\b|\bpie\b/i, '水果派，是带酥皮或派皮的烘焙甜点；可直接吃或稍加热，不应按新鲜水果比较。'],
  ['bakery', /\b(cake|cookies?|bread|bagels?|buns?|muffins?|croissants?|tarts?|toast|breadsticks?|knots?)\b/i, '面包或烘焙点心，可作早餐或甜点；购买时按原名确认口味、是否夹馅和包装大小。'],
  ['frozen', /\bice cream\b/i, '冰淇淋，冷冻甜品，开盒即食；比较时需同时看容量、乳脂和口味。'],
  ['frozen', /\b(pizza|egg rolls?|dumplings?)\b/i, '冷冻披萨或冷冻点心，通常用烤箱、空气炸锅或平底锅加热；具体加热方式以包装为准。'],
  ['frozen', /\b(fruit bars?|popsicles?)\b/i, '冷冻水果冰棒，可直接食用；比较时看支数、净含量和含糖量。'],

  ['seafood', /\b(salmon|sockeye)\b/i, '三文鱼，可煎、烤或空气炸；若是鱼排或汉堡饼，应按包装说明确认是否已调味。'],
  ['seafood', /\b(shrimp|prawns?)\b/i, '虾或虾仁，可清炒、煮汤、做意面或海鲜饭；去壳去肠线款更省处理时间。'],
  ['seafood', /\b(crab|lobster)\b/i, '蟹或龙虾海鲜，适合蒸、煮或烤；比较时需留意带壳重量和是否已熟。'],
  ['seafood', /\b(tuna|swordfish)\b/i, '金枪鱼或剑鱼；鲜鱼排适合煎烤，罐装金枪鱼可拌沙拉或夹三明治。'],
  ['seafood', /\b(seafood|fish|tilapia|cod)\b/i, '鱼类或混合海鲜；请按原名确认鱼种、鲜冻状态和是否带壳，再选择煎、烤或煮汤。'],

  ['meat', /\bground (?:beef|chuck)\b|\bbeef burgers?\b/i, '牛肉末或牛肉汉堡饼，可做肉酱、肉丸、汉堡或炒饭；脂肪比例越高通常越多汁。'],
  ['meat', /\b(steak|ribeye|sirloin)\b/i, '牛排，适合平底锅煎或烧烤；嫩度和所需火候取决于具体部位与厚度。'],
  ['meat', /\b(beef brisket|beef roast|chuck roast|round roast|roast beef)\b/i, '整块烤牛肉或牛腩类，适合慢烤、炖煮或切片；具体嫩度取决于部位。'],
  ['meat', /\b(chicken breast|chicken cutlets?|chicken tenderloins?|ground chicken)\b/i, '鸡胸肉、鸡里脊或鸡肉末，脂肪较少，适合快炒、煎烤、咖喱或做肉丸。'],
  ['meat', /\b(chicken drumsticks?|chicken thighs?)\b/i, '鸡腿或带骨鸡大腿，肉汁较多，适合红烧、炖煮、烧烤或空气炸。'],
  ['meat', /\bwhole young chicken\b/i, '整只嫩鸡，可烤、炖汤、白切或拆分烹调；比较时应结合整鸡重量。'],
  ['meat', /\b(fried chicken|oven-roasted chicken|chicken tender|chicken bites?)\b/i, '已调味或熟制鸡肉，可直接吃或复热；按原名确认是炸鸡、烤鸡、鸡柳还是鸡肉小食。'],
  ['meat', /\b(pork loin|ground pork|pulled pork|pork meatballs?)\b/i, '猪里脊、猪肉末或熟制手撕猪肉；可煎炒、做肉丸或复热夹面包，具体做法按产品形态选择。'],
  ['meat', /\b(sausage|bacon|pepperoni|ham|turkey breast|meat sticks?)\b/i, '香肠、培根、火腿或肉类熟食，通常已调味且盐分较高，可煎烤、夹面包或作披萨配料。'],
  ['meat', /\blamb\b/i, '羊排或羊肩肉，适合煎烤或慢炖；风味比牛猪肉更明显。'],
  ['meat', /\b(chicken|beef|pork|turkey|meat|deli)\b/i, '肉类商品；请按原名确认动物种类、部位、是否带骨和是否熟制，再选择煎炒、炖或烤。'],

  ['produce', /\b(mushrooms?|bella)\b/i, '鲜蘑菇（白蘑菇或褐色 Baby Bella），可切片炒肉、煎烤、煮汤或做奶油意面；类似中国常见口蘑。'],
  ['produce', /\bcarrots?\b/i, '胡萝卜，可清炒、炖肉、烤制、煮汤或生吃；类似中国常见胡萝卜。'],
  ['produce', /\bgreen beans?\b/i, '四季豆或嫩豆角，可清炒、焯拌或炖煮；购买时注意是否已去筋、是否按磅计价。'],
  ['produce', /\bpeas?\b/i, '豌豆，可清炒、焯煮、做汤或作为配菜；这里按豌豆本身归类，不与四季豆混为一种。'],
  ['produce', /\bbroccoli\b/i, '西兰花，可清炒、焯拌、烤制或煮汤；类似中国常见西兰花。'],
  ['produce', /\bcauliflower\b/i, '花椰菜（菜花），可清炒、焯拌、烤制或做低碳“菜花米”；不与西兰花混为一种。'],
  ['produce', /\b(corn|sweet corn)\b/i, '鲜玉米，可水煮、烧烤或剥粒炒菜；整根和散装商品应按重量或根数比较。'],
  ['produce', /\brusset potatoes?\b|\bpotatoes?.*russet\b/i, 'Russet 褐皮土豆，淀粉较多，适合烤土豆、炸薯条或做松软土豆泥；大小和包装不同仍属于同一种土豆比价组。'],
  ['produce', /\bpotatoes?\b/i, '新鲜土豆，可烤、炖、煎或做土豆泥；大、小、迷你或袋装只是规格差异，不因此拆成不同商品组。'],
  ['produce', /\bspinach\b/i, '菠菜，可清炒、焯拌、煮汤或加入沙拉；嫩叶菠菜也可直接生食。'],
  ['produce', /\blettuce\b/i, '生菜，可直接做沙拉、夹三明治或快炒；不同叶型仍属于生菜，但不与菠菜混类。'],
  ['produce', /\bsalad\b/i, '预制或混合沙拉菜，通常开袋后拌食；注意是否含酱料、配料包及保鲜期。'],
  ['produce', /\btomatoes?\b/i, '番茄，可生吃、做沙拉、炒蛋、煮汤或熬酱；不同大小和包装仍按番茄归组。'],
  ['produce', /\bpeppers?\b/i, '甜椒或辣椒，可清炒、烤制、做沙拉或调味；具体辣度以原名和包装为准。'],
  ['produce', /\bcucumbers?\b/i, '黄瓜，可生吃、凉拌、做沙拉或腌渍；大小和包装差异不另拆商品组。'],
  ['produce', /\bonions?\b/i, '洋葱，可炒、炖、烤或用于汤和酱汁打底；黄洋葱、白洋葱等保留原名但同属洋葱类。'],
  ['produce', /\bstrawberries\b/i, '草莓，可直接吃、配酸奶燕麦、做果酱或甜点；盒装商品比较时需同时看净重。'],
  ['produce', /\bblueberries\b/i, '蓝莓，可直接吃、配酸奶燕麦或用于烘焙；小盒装商品比较时需同时看净重。'],
  ['produce', /\bberries\b/i, '莓果商品，可直接吃、配酸奶燕麦或用于烘焙；原名未明确品种时需结合图片确认。'],
  ['produce', /\b(grapes?)\b/i, '鲜葡萄，可直接吃；购买时注意是否无籽、果粒状态和每磅价格。'],
  ['produce', /\bplums?\b/i, '李子，成熟后可直接吃、做水果沙拉或甜点；购买时注意软硬、表皮和成熟度。'],
  ['produce', /\b(peaches|nectarines)\b/i, '桃或油桃，成熟后可直接吃、做水果沙拉或甜点；油桃表皮较光滑，二者不应误写成李子。'],
  ['produce', /\bapples?\b/i, '苹果，可直接吃、做沙拉、烘焙或煮果酱；品种名保留，但大小和袋装规格不另拆商品组。'],
  ['produce', /\bbananas?\b/i, '香蕉，可直接吃、配早餐、做奶昔或烘焙香蕉面包；购买时留意成熟度和计价单位。'],
  ['produce', /\bavocados?\b/i, '牛油果（鳄梨），可直接拌沙拉、抹面包或做鳄梨酱；购买时注意软硬和成熟度。'],
  ['produce', /\blimes?\b/i, '青柠，可挤汁调饮料、海鲜、沙拉或酱汁；通常按个或袋装销售。'],
  ['produce', /\bwatermelon\b/i, '西瓜，可切块直接食用；整瓜和切块商品应结合重量及可食部分比较。'],
  ['produce', /\b(fruit cups?|fresh fruit)\b/i, '切配水果杯或水果拼盘，开盒即食；属于预制水果，不与单一整果直接比价。'],
  ['produce', /\b(produce|fruits?|vegetables?)\b/i, '果蔬商品；原名未提供更细品种时，应结合商品图片确认具体果蔬，不能与不同品种直接比价。'],

  ['dairy', /\bgreek yogurt|yogurt|yoghurt|noosa|chobani|yoplait\b/i, '酸奶；Greek Yogurt 是质地更稠、蛋白质通常更高的希腊式酸奶，可直接吃或搭配水果燕麦。'],
  ['dairy', /\b(cheese slices?|shredded cheese|cheddar|havarti|mozzarella|cheese sticks?|cheese)\b/i, '奶酪；切片款适合三明治，刨丝款适合焗烤，奶酪棒可作零食，具体风味按原名品种确认。'],
  ['dairy', /\b(eggs?)\b/i, '鸡蛋，可煎、炒、煮、蒸或用于烘焙；比较时看枚数、大小和是否散养。'],
  ['dairy', /\b(milk|butter|cream)\b/i, '牛奶、黄油或奶油类乳制品；请按原名确认具体形态，再用于饮用、抹面包、煎制或烘焙。'],

  ['pantry', /\b(beans?)\b/i, '豆类罐头或调味熟豆，可加热配饭、做汤、辣豆酱或烧烤配菜。'],
  ['pantry', /\b(rice|pasta|pasta roni|rice-a-roni)\b/i, '大米、意面或调味方便主食，需煮熟后食用；类似中国袋装米、意面或调味方便饭。'],
  ['pantry', /\b(cereal|oatmeal)\b/i, '早餐谷物或燕麦片，通常加牛奶或酸奶食用；注意含糖量与包装净重。'],
  ['pantry', /\b(jam|jelly|peanut butter|syrup|sugar)\b/i, '果酱、花生酱、糖浆或糖类，可抹面包、搭配早餐或用于烘焙；具体用途按原名确认。'],
  ['pantry', /\b(tuna)\b/i, '金枪鱼罐头，可拌沙拉、夹三明治或配饭；注意是水浸还是油浸。'],
  ['pantry', /\b(rice|pasta|noodle|flour|oil|sauce|soup|seasoning|condiment)\b/i, '常温主食或调味品；请按原名确认是米面、酱料还是汤料，再按包装方法烹调。'],

  ['snacks', /\b(chips?|crisps?|pretzels?|crackers?|goldfish|popcorn|cheez-it|takis)\b/i, '咸味脆零食，如薯片、脆饼或椒盐卷饼，开袋即食；比较时看口味和包装净重。'],
  ['snacks', /\b(candy|chocolate|gummi|nerds|trolli|tootsie)\b/i, '糖果或巧克力零食，开袋即食；注意单包/多包规格和含糖量。'],
  ['snacks', /\b(protein bar|fruit & nut bar|snacks?)\b/i, '综合零食或能量棒，可随身即食；应按原名确认是坚果棒、蛋白棒还是混合零食。'],

  ['drinks', /\b(beer|wine|prosecco|moscato|cabernet|pinot grigio|sauvignon blanc)\b/i, '酒精饮料，仅供达到当地法定饮酒年龄者；请按原名确认啤酒或葡萄酒类型与包装数量。'],
  ['drinks', /\b(orange juice|juice drink|juice)\b/i, '果汁或果汁饮料，可冷藏后直接饮用；“juice drink” 通常不是 100% 果汁，应查看含糖量。'],
  ['drinks', /\b(soda|sparkling water|purified water|sports drink|fountain drink|beverage|powerade|bubly|bubbl'r|water enhancer)\b/i, '软饮、气泡水、运动饮料或饮水调味液；请按原名确认是否含糖、是否含咖啡因和包装数量。'],
  ['drinks', /\b(coffee|k-cup|tea|cold brew)\b/i, '咖啡或茶；咖啡豆/粉需冲煮，K-Cup 需胶囊机，冷萃咖啡通常可直接冷饮。'],
];

const atlantaGroup = (nameZh, noteZh = '同一商品主体归组；尺寸和包装保留原名，价格比较仍需结合净重。') => ({ nameZh, noteZh });
export const ATLANTA_COMPARISON_GROUPS = {
  produce_mushrooms: atlantaGroup('蘑菇'), produce_potatoes: atlantaGroup('土豆'), produce_salad: atlantaGroup('生菜与沙拉'),
  produce_tomatoes: atlantaGroup('番茄'), produce_beans: atlantaGroup('鲜豆类'), produce_corn: atlantaGroup('鲜玉米'),
  produce_onions: atlantaGroup('洋葱'), produce_peppers: atlantaGroup('甜椒'), produce_cucumbers: atlantaGroup('黄瓜'),
  produce_cruciferous: atlantaGroup('西兰花与花椰菜'), produce_grapes: atlantaGroup('葡萄'), produce_plums: atlantaGroup('李子'),
  produce_peaches: atlantaGroup('桃与油桃'), produce_strawberries: atlantaGroup('草莓'), produce_blueberries: atlantaGroup('蓝莓'),
  produce_apples: atlantaGroup('苹果'), produce_citrus: atlantaGroup('柑橘与青柠'), produce_avocado: atlantaGroup('牛油果'),
  produce_watermelon: atlantaGroup('西瓜'), produce_bananas: atlantaGroup('香蕉'),
  produce_prepared_salad: atlantaGroup('预制沙拉'), produce_prepared_fruit: atlantaGroup('切配水果'),
  produce_prepared_potatoes: atlantaGroup('预制土豆配菜'), produce_prepared_mixed: atlantaGroup('果蔬混合加餐', '组成不同，不参与单一果蔬最低价。'),
  produce_other: atlantaGroup('其他果蔬', '品种不同不直接比较最低价。'),
  meat_ground_beef: atlantaGroup('牛肉末与牛肉饼'), meat_beef_steak: atlantaGroup('牛排'), meat_beef_roast: atlantaGroup('整块烤牛肉'),
  meat_chicken_breast: atlantaGroup('鸡胸与鸡里脊'), meat_ground_chicken: atlantaGroup('鸡肉末'), meat_chicken_thigh: atlantaGroup('鸡腿肉'), meat_whole_chicken: atlantaGroup('整鸡'),
  meat_prepared_chicken: atlantaGroup('熟制与调味鸡肉'), meat_ground_pork: atlantaGroup('猪肉末'), meat_pork_tenderloin: atlantaGroup('猪里脊'), meat_pork_chops: atlantaGroup('猪排'),
  meat_pork_meatballs: atlantaGroup('猪肉丸'), meat_pulled_pork: atlantaGroup('手撕猪肉'), meat_bacon: atlantaGroup('培根'),
  meat_beef_burgers: atlantaGroup('牛肉汉堡饼'), meat_meatballs: atlantaGroup('肉丸'), meat_sausage_deli: atlantaGroup('香肠与肉类熟食'),
  meat_lamb: atlantaGroup('羊肉'), meat_other: atlantaGroup('其他肉类', '部位不同，价格只作参考。'),
  seafood_salmon: atlantaGroup('三文鱼'), seafood_salmon_burgers: atlantaGroup('三文鱼汉堡饼'), seafood_shrimp: atlantaGroup('虾'),
  seafood_tuna_fresh: atlantaGroup('金枪鱼与剑鱼排'), seafood_tuna_canned: atlantaGroup('金枪鱼罐头'), seafood_other: atlantaGroup('其他海鲜'),
  dairy_yogurt: atlantaGroup('酸奶'), dairy_cheese: atlantaGroup('奶酪'), dairy_prepared_cheese: atlantaGroup('裹粉奶酪小食'), dairy_eggs: atlantaGroup('鸡蛋'), dairy_other: atlantaGroup('其他乳制品'),
  bakery_bread: atlantaGroup('面包'), bakery_cake: atlantaGroup('蛋糕与甜点'), bakery_pie: atlantaGroup('派'), bakery_cookies: atlantaGroup('饼干'),
  bakery_croissants: atlantaGroup('可颂'), bakery_other: atlantaGroup('其他烘焙'),
  frozen_ice_cream: atlantaGroup('冰淇淋与冰棒'), frozen_pizza: atlantaGroup('冷冻披萨'), frozen_appetizers: atlantaGroup('冷冻点心'), frozen_other: atlantaGroup('其他冷冻食品'),
  pantry_rice_pasta: atlantaGroup('米饭与意面'), pantry_cereal: atlantaGroup('早餐谷物'), pantry_beans: atlantaGroup('豆类罐头'),
  pantry_spreads: atlantaGroup('果酱与花生酱'), pantry_sugar: atlantaGroup('糖与糖浆'), pantry_other: atlantaGroup('其他常温食品'),
  snacks_savory: atlantaGroup('薯片与咸味零食'), snacks_candy: atlantaGroup('糖果与巧克力'), snacks_bars: atlantaGroup('能量棒与蛋白棒'), snacks_other: atlantaGroup('其他零食'),
  drinks_coffee_tea: atlantaGroup('咖啡与茶'), drinks_water: atlantaGroup('饮用水与气泡水'), drinks_enhancer: atlantaGroup('饮水调味液'), drinks_juice: atlantaGroup('果汁与果汁饮料'),
  drinks_soft: atlantaGroup('软饮与运动饮料'), drinks_beer: atlantaGroup('啤酒'), drinks_wine: atlantaGroup('葡萄酒'), drinks_other: atlantaGroup('其他饮料'),
  household_laundry: atlantaGroup('洗衣用品'), household_dishwasher: atlantaGroup('洗碗机用品'), household_paper: atlantaGroup('纸品'), household_other: atlantaGroup('其他家庭用品'),
  personal_oral: atlantaGroup('口腔护理'), personal_hair: atlantaGroup('头发护理'), personal_body: atlantaGroup('身体与剃刮护理'), personal_other: atlantaGroup('其他个人护理'),
  baby_diapers: atlantaGroup('纸尿裤'), baby_food: atlantaGroup('婴幼儿食品'), baby_other: atlantaGroup('其他婴幼儿用品'),
  pet_cat: atlantaGroup('猫粮与猫零食'), pet_dog: atlantaGroup('狗粮与狗零食'), pet_other: atlantaGroup('其他宠物用品'),
};

function atlantaComparisonGroup(name, categoryId) {
  const text = String(name || '').toLowerCase();
  const rules = {
    produce: [
      ['produce_prepared_mixed', /snack featuring/], ['produce_prepared_potatoes', /sweet potatoes? with butter/],
      ['produce_prepared_salad', /salad kits?|salad blend/], ['produce_prepared_fruit', /fruit cups?|apple slices/],
      ['produce_mushrooms', /mushrooms?|bella/], ['produce_potatoes', /potatoes?|russet/], ['produce_salad', /salad|lettuce|spinach/],
      ['produce_tomatoes', /tomatoes?/], ['produce_beans', /green beans?|\bpeas?\b/], ['produce_corn', /corn/], ['produce_onions', /onions?/],
      ['produce_peppers', /peppers?/], ['produce_cucumbers', /cucumbers?/], ['produce_cruciferous', /broccoli|cauliflower/],
      ['produce_grapes', /grapes?/], ['produce_plums', /plums?/], ['produce_peaches', /peaches|nectarines/],
      ['produce_strawberries', /strawberries/], ['produce_blueberries', /blueberries/], ['produce_apples', /apples?/],
      ['produce_citrus', /limes?|lemons?|oranges?/], ['produce_avocado', /avocados?/], ['produce_watermelon', /watermelon/], ['produce_bananas', /banana/],
    ],
    meat: [
      ['meat_beef_burgers', /beef burgers?|slider burgers?/], ['meat_ground_beef', /ground (?:beef|chuck)/], ['meat_beef_steak', /steak|ribeye|sirloin/],
      ['meat_beef_roast', /brisket|beef roast|chuck roast|round roast|roast beef/], ['meat_prepared_chicken', /fried chicken|oven-roasted chicken|chicken tender|chicken bites?|chicken wrap|chicken sub|parmesan chicken/],
      ['meat_ground_chicken', /ground chicken/], ['meat_chicken_breast', /chicken breast|chicken cutlets?|chicken tenderloins?/],
      ['meat_chicken_thigh', /chicken drumsticks?|chicken thighs?/], ['meat_whole_chicken', /whole young chicken/],
      ['meat_bacon', /bacon/], ['meat_ground_pork', /ground pork/], ['meat_pork_tenderloin', /pork loin tenderloin/], ['meat_pork_chops', /pork loin chops?/], ['meat_pork_meatballs', /pork meatballs?/], ['meat_pulled_pork', /pulled pork/],
      ['meat_meatballs', /beef meatballs?|gourmet beef meatballs?/], ['meat_lamb', /lamb/], ['meat_sausage_deli', /sausage|pepperoni|ham|turkey breast|meat sticks?/],
    ],
    seafood: [['seafood_salmon_burgers', /salmon burgers?/], ['seafood_salmon', /salmon|sockeye/], ['seafood_shrimp', /shrimp|prawns?/], ['seafood_tuna_canned', /starkist|canned tuna/], ['seafood_tuna_fresh', /tuna|swordfish/]],
    dairy: [['dairy_yogurt', /yogurt|yoghurt|noosa|chobani|yoplait/], ['dairy_prepared_cheese', /breaded mozzarella/], ['dairy_cheese', /cheese|cheddar|havarti|mozzarella/], ['dairy_eggs', /eggs?/]],
    bakery: [['bakery_croissants', /croissants?/], ['bakery_pie', /pie/], ['bakery_cake', /cake|tarts?/], ['bakery_cookies', /cookies?/], ['bakery_bread', /bread|toast|breadsticks?|knots?/]],
    frozen: [['frozen_ice_cream', /ice cream|fruit bars?|popsicles?/], ['frozen_pizza', /pizza/], ['frozen_appetizers', /egg rolls?|dumplings?/]],
    pantry: [['pantry_rice_pasta', /rice|pasta|mac.*cheese/], ['pantry_cereal', /cereal|oatmeal|rice krispies/], ['pantry_beans', /beans?/], ['pantry_spreads', /peanut butter|jam|jelly/], ['pantry_sugar', /sugar|syrup/]],
    snacks: [['snacks_bars', /protein bar|fruit.*nut bar/], ['snacks_other', /oreo cakesters.*ritz|snack mix|cookie pudding|rice krispies treats?/], ['snacks_savory', /chips?|crisps?|pretzels?|crackers?|goldfish|popcorn|cheez-it|takis/], ['snacks_candy', /candy|chocolate|gummi|nerds|trolli|tootsie/]],
    drinks: [['drinks_beer', /beer/], ['drinks_wine', /wine|prosecco|moscato|cabernet|pinot|sauvignon/], ['drinks_coffee_tea', /coffee|k-cup|tea|cold brew/], ['drinks_enhancer', /water enhancer/], ['drinks_water', /water|bubly|bubbl'r/], ['drinks_juice', /juice|fruit punch|capri/], ['drinks_soft', /soda|sports drink|fountain drink|powerade|beverage/]],
    household: [['household_laundry', /laundry|tide|gain|oxi ?clean/], ['household_dishwasher', /dishwasher|powerball/], ['household_paper', /tissue|paper towels?|kleenex|puffs|charmin/]],
    personal: [['personal_oral', /toothpaste|sensodyne|colgate|crest/], ['personal_hair', /shampoo|conditioner|hair oil/], ['personal_body', /body wash|hand soap|body scrub|shave|razor|deodorant|antiperspirant/]],
    baby: [['baby_diapers', /diapers?|pampers|huggies/], ['baby_food', /oatmeal|baby food|formula/]],
    pet: [['pet_cat', /cat/], ['pet_dog', /dog/]],
  };
  return rules[categoryId]?.find(([, pattern]) => pattern.test(text))?.[0] || `${categoryId}_other`;
}

export function classifyFlippItem(name) {
  const text = String(name || '');
  if (NON_GROCERY_PATTERN.test(text)) return null;
  const match = PRODUCT_RULES.find(([, pattern]) => pattern.test(text));
  if (!match) return null;
  return { categoryId: match[0], comparisonGroup: atlantaComparisonGroup(text, match[0]), zhExplanation: match[2], evidenceBasis: 'original_name' };
}

function httpsUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === 'http:') url.protocol = 'https:';
    return url.toString();
  } catch {
    return null;
  }
}

export function buildFlippFlyerUrl(flyerId, { postalCode, locationSlug }) {
  const id = Number(flyerId);
  const postal = String(postalCode || '').trim();
  const location = String(locationSlug || '').trim().toLowerCase();
  if (!Number.isInteger(id) || id < 1) throw new Error('Flipp flyer URL requires a positive flyer ID');
  if (!/^\d{5}$/.test(postal)) throw new Error('Flipp flyer URL requires a 5-digit postal code');
  if (!/^[a-z0-9-]+$/.test(location)) throw new Error('Flipp flyer URL requires a safe location slug');
  return `https://flipp.com/en-us/${location}/flyer/${id}?postal_code=${postal}`;
}

export function buildFlippItemUrl(itemId, flyer, { postalCode, locationSlug }) {
  const id = Number(itemId);
  const postal = String(postalCode || '').trim();
  const location = String(locationSlug || '').trim().toLowerCase();
  const itemSlug = `${flyer?.merchant || ''}-${flyer?.name || ''}`
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!Number.isInteger(id) || id < 1) throw new Error('Flipp item URL requires a positive item ID');
  if (!/^\d{5}$/.test(postal)) throw new Error('Flipp item URL requires a 5-digit postal code');
  if (!/^[a-z0-9-]+$/.test(location)) throw new Error('Flipp item URL requires a safe location slug');
  if (!itemSlug) throw new Error('Flipp item URL requires flyer merchant and name');
  return `https://flipp.com/en-us/${location}/item/${id}-${itemSlug}?postal_code=${postal}`;
}

export function normalizeFlippItems(items, { storeId, flyer, seenAt, postalCode, locationSlug, productKnowledge = null }) {
  const flyerUrl = buildFlippFlyerUrl(flyer.id, { postalCode, locationSlug });
  const deduped = new Map();

  for (const item of items) {
    const name = String(item.name || '').trim();
    const price = Number(item.price);
    const knowledgeKey = flippKnowledgeKey(name);
    const knowledge = productKnowledge?.entries?.[knowledgeKey];
    const category = knowledge?.categoryId && knowledge?.descriptionZh
      ? { categoryId: knowledge.categoryId, comparisonGroup: knowledge.comparisonGroup, zhExplanation: knowledge.descriptionZh, evidenceBasis: 'codex_product_knowledge' }
      : classifyFlippItem(name);
    if (item.display_type !== 1 || !name || !Number.isFinite(price) || price <= 0 || !category) continue;

    // Retailer campaign URLs in print_id/ttm_url frequently land on a generic
    // promotion. Flipp's item ID opens the matching offer card directly while
    // the location slug and postal code keep the route pinned to Atlanta.
    const retailerUrl = httpsUrl(item.ttm_url) || httpsUrl(item.print_id);
    const itemUrl = buildFlippItemUrl(item.id, flyer, { postalCode, locationSlug });
    const key = `${normalized(name)}|${price}|${item.valid_from || flyer.valid_from}|${item.valid_to || flyer.valid_to}`;
    if (deduped.has(key)) continue;

    deduped.set(key, {
      canonicalKey: `flipp|${storeId}|${item.id}`,
      storeId,
      originalName: name,
      productNameZh: knowledge?.productNameZh || null,
      brand: item.brand || null,
      zhExplanation: category.zhExplanation,
      descriptionSource: knowledge ? 'codex_product_knowledge' : 'rules_fallback',
      descriptionAuthor: knowledge?.authoredBy || null,
      productKnowledgeKey: knowledgeKey,
      descriptionEvidence: {
        originalName: name,
        imageUrl: httpsUrl(item.cutout_image_url),
        imageReviewed: Boolean(knowledge?.imageReviewed),
      },
      categoryId: category.categoryId,
      comparisonGroup: category.comparisonGroup || `${category.categoryId}_other`,
      price,
      currency: 'USD',
      validFrom: item.valid_from || flyer.valid_from,
      validUntil: item.valid_to || flyer.valid_to,
      lastSeenAt: seenAt,
      status: 'current',
      imageUrl: httpsUrl(item.cutout_image_url),
      sourceUrl: itemUrl,
      retailerUrl,
      flyerUrl,
      flyerId: flyer.id,
      flyerName: flyer.name,
      itemId: Number(item.id),
      sourceLocation: {
        status: 'direct',
        pageNumber: null,
        positionLabel: 'Flipp 商品卡片',
        deepLink: itemUrl,
        verifiedAt: seenAt,
        method: 'flipp-item-id',
      },
    });
  }

  return [...deduped.values()];
}
