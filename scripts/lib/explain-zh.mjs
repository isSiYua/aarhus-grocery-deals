const includes = (text, words) => words.some(w => text.includes(w));

const TEMPLATES = [
  [['kyllingebryst', 'brystfilet'], '鸡胸肉，脂肪少、肉味较清淡，适合切片快炒、煎制、咖喱或空气炸锅。注意不要加热过久，否则容易变柴。'],
  [['kyllingeoverlår', 'kyllingelår'], '鸡大腿肉或鸡腿块，脂肪和肉汁比鸡胸多，口感更嫩，适合红烧、照烧、炖煮或烤制。与中国常见鸡腿肉基本相同。'],
  [['hel kylling'], '整只鸡，通常需要烤、炖或拆分后烹调。价格适合按公斤比较，也可用于中式白切鸡、炖鸡汤或烤鸡。'],
  [['flæskesteg', 'kamsteg', 'ribbensteg'], '丹麦式带皮烤猪肉块，烤后追求表皮酥脆，肉味咸香。类似中国脆皮烧肉使用的大块猪肉，但丹麦做法通常香料更简单。'],
  [['grillpølse', 'pølse', 'medister'], '丹麦肉肠，通常以猪肉为主，味道咸香；若标有 røgsmag 或 røget 则带烟熏味。口感类似中国较粗的火腿肠或烤肉肠，但一般没有台式香肠那么甜。'],
  [['hakket oksekød'], '牛肉末，可做中式肉末炒菜、牛肉丸、汉堡肉或番茄肉酱。包装上的脂肪百分比越高，通常越多汁，但也更油。'],
  [['hakket kylling'], '鸡肉末，味道比猪牛肉末清淡，可做鸡肉丸、饺子馅、炒饭肉末或咖喱。'],
  [['laks'], '三文鱼，肉质较肥、味道鲜香，可煎、烤或做奶油焗鱼。若原名出现 røget，表示烟熏三文鱼，通常直接冷食。'],
  [['rejer'], '虾仁或小虾，适合炒饭、炒面、汤面、沙拉或火锅。若标有 kogte，表示已经煮熟，只需短暂加热。'],
  [['æg'], '鸡蛋。适合煎蛋、炒蛋、蒸蛋和烘焙；单位价格优先按每枚比较。'],
  [['skyr'], '冰岛风格高蛋白浓稠乳制品，质地接近很稠的酸奶，但通常脂肪较低、酸味更明显，适合早餐搭配水果或燕麦。'],
  [['yoghurt'], '酸奶。具体甜度和口味以商品原名为准；naturel 表示原味无额外水果口味。'],
  [['rugbrød'], '丹麦黑麦面包，质地扎实、略酸、谷物感强，通常切薄片搭配肉片、鸡蛋或奶酪，不像中国软面包那样松甜。'],
  [['pizza snack'], '冷冻或冷藏的迷你披萨点心，通常含番茄酱、奶酪和原名所写肉类口味，可用烤箱或空气炸锅加热。类似小号厚底披萨或咸味烤面包。'],
  [['pepperoni'], '意大利辣香肠口味，带咸味、香料味和轻微辣感，常用于披萨；与中国香肠不同，它更咸、更偏西式香料味。'],
  [['champignon'], '白蘑菇或褐蘑菇，适合炒肉、煎牛排配菜、煮汤或奶油炖菜。'],
  [['spidskål'], '尖头卷心菜，叶片比普通圆白菜嫩，甜味更明显，适合清炒、做汤或切丝凉拌。'],
  [['blomkål'], '花椰菜，也叫菜花，适合清炒、干锅、焯水凉拌或烤制。'],
  [['kartoff'], '土豆，可用于炒土豆丝、炖肉、烤土豆或土豆泥。丹麦常见品种有偏粉糯和偏蜡质两类。'],
  [['avocado'], '牛油果，成熟后果肉柔软、脂肪感明显，可拌沙拉、抹面包或加入卷饼；不是甜味水果。'],
  [['hakkede tomater'], '罐装切碎番茄，已经去皮并切碎，适合做番茄汤、意面酱、炖肉或番茄火锅汤底。'],
  [['kikærter'], '鹰嘴豆，口感粉糯，可做咖喱、沙拉、炖菜或鹰嘴豆泥；与中国黄豆不同，豆腥味较弱。'],
  [['toiletpapir'], '卫生纸。比较时除了总价，还应看卷数、每卷层数和纸张长度；促销单若缺少长度，单位价格只能按每卷估算。'],
  [['vaskemiddel', 'opvask'], '家庭清洁用品。需留意是洗衣液、洗衣粉、洗碗液还是洗碗机片，以及是否属于会员价或多件组合价。'],
  [['coca-cola zero', 'coke zero'], '可口可乐无糖版本，使用甜味剂代替糖，保留接近经典可乐的口味。仅在确有促销时出现在本页面。'],
  [['sprite zero'], '雪碧无糖版本，柠檬与青柠风味、无糖。仅在确有促销时出现在本页面。'],
];

const flavor = text => {
  const parts = [];
  if (includes(text, ['røget', 'røgsmag'])) parts.push('带烟熏味');
  if (includes(text, ['stærk', 'chili', 'spicy'])) parts.push('偏辣');
  if (includes(text, ['hvidløg'])) parts.push('带蒜香');
  if (includes(text, ['ost', 'cheese'])) parts.push('带奶酪味');
  if (includes(text, ['barbecue', 'bbq'])) parts.push('烧烤酱香味');
  return parts.length ? `原名显示它${parts.join('、')}。` : '';
};

export function explainInChinese(raw, classification) {
  const text = `${raw.heading || ''} ${raw.description || ''}`.toLowerCase();
  for (const [terms, explanation] of TEMPLATES) {
    if (terms.some(term => text.includes(term))) return `${explanation}${flavor(text)}`;
  }
  const generic = {
    chicken: '鸡肉类商品。请结合商品原名判断具体部位；通常可用于中式炒、炖、煎或烤。',
    pork: '猪肉类商品。中文解释依据原名中的部位和加工方式生成；加工肉通常更咸，鲜肉更适合中式烹调。',
    beef: '牛肉类商品。适合煎、炒、炖或制作肉末菜；不同脂肪比例和部位会明显影响口感。',
    seafood: '鱼虾海鲜类商品。请留意是新鲜、冷冻、熟制还是烟熏产品，加热方式可能不同。',
    eggs_dairy: '鸡蛋或乳制品。请留意脂肪含量、糖分、是否原味以及包装数量。',
    vegetables: '蔬菜类商品。可按中国家庭常见的清炒、煮汤、炖煮或烤制方式使用。',
    fruit: '水果类商品。价格会受包装重量、成熟度和产地影响。',
    bread_grains: '主食或面包类商品。请留意是否为全麦、黑麦、即食或需要烹煮。',
    frozen_ready: '冷冻或方便食品，通常可用烤箱、空气炸锅、平底锅或微波炉加热；具体口味以原名为准。',
    pantry: '常温食品或调料。可用于日常做饭，具体甜、咸、辣和使用方法以原名与包装说明为准。',
    snacks: '零食类商品。中文说明会保留原名中的主要口味，购买时注意包装大小和多件促销条件。',
    household: '家庭日用品。应同时比较包装数量、每件容量以及是否需要会员或购买多件。',
    drinks: '无糖可口可乐公司饮料；只有存在促销时才会显示。',
  };
  return `${generic[classification.categoryId] || '日常食品或家庭用品。'}${flavor(text)}`;
}
