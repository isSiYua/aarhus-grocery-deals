const norm = value => String(value || '')
  .toLowerCase()
  .replace(/æ/g, 'ae')
  .replace(/ø/g, 'o')
  .replace(/å/g, 'aa')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const RULES = [
  ['chicken', 'chicken_thigh', /kyllinge?(overlaar|laar|underlaar)|chicken thigh/],
  ['chicken', 'chicken_breast', /kyllingebryst|brystfilet|inderfilet|chicken breast/],
  ['chicken', 'whole_chicken', /hel kylling|grillkylling/],
  ['chicken', 'chicken_minced', /hakket kylling|kyllingefars/],
  ['pork', 'pork_roast', /flaeskesteg|kamsteg|nakkesteg|ribbensteg/],
  ['pork', 'pork_chop', /kotelet|svinekotelet/],
  ['pork', 'pork_minced', /hakket gris|hakket svin|grisefars/],
  ['pork', 'sausages', /poelse|grillpoelse|medister|wiener/],
  ['beef', 'mixed_minced', /hakket okse.*gris|hakket gris.*okse|blandet fars/],
  ['beef', 'beef_minced', /hakket okse|oksefars/],
  ['beef', 'beef_steak', /okseboef|steak|entrecote|culotte|moerbrad/],
  ['seafood', 'salmon', /laks/],
  ['seafood', 'shrimp', /rejer|shrimp/],
  ['seafood', 'white_fish', /torsk|sej|roedspaette|fiskefilet/],
  ['eggs_dairy', 'eggs', /\baeg\b|eggs/],
  ['eggs_dairy', 'milk', /maelk/],
  ['eggs_dairy', 'yoghurt', /yoghurt|skyr|kefir/],
  ['eggs_dairy', 'cheese', /\bost\b|mozzarella|cheddar|feta/],
  ['vegetables', 'mushrooms', /champignon|svampe|shiitake/],
  ['vegetables', 'tomatoes', /tomat/],
  ['vegetables', 'cucumber', /agurk/],
  ['vegetables', 'potatoes', /kartoff/],
  ['vegetables', 'cabbage', /kaal|spidskaal|blomkaal|broccoli/],
  ['vegetables', 'onion_garlic', /loeg|hvidloeg|foraarsloeg|ingefaer/],
  ['vegetables', 'leafy_green', /salat|spinat|pak choi|choy sum/],
  ['fruit', 'apples_pears', /aeble|paere/],
  ['fruit', 'stone_fruit', /fersken|nektarin|blomme/],
  ['fruit', 'berries', /jordbaer|blaabaer|hindbaer/],
  ['fruit', 'tropical_fruit', /mango|avocado|ananas/],
  ['bread_grains', 'bread', /broed|rugbroed|boller|baguette/],
  ['bread_grains', 'rice', /\bris\b|jasminris|basmati/],
  ['bread_grains', 'pasta_noodles', /pasta|spaghetti|nudler|instant noodles/],
  ['frozen_ready', 'pizza_snacks', /pizza|pizza snack/],
  ['frozen_ready', 'dumplings', /dumpling|gyoza|wonton|foraarsrulle/],
  ['frozen_ready', 'ready_meal', /faerdigret|lasagne|taerte|suppe/],
  ['pantry', 'canned', /daase|hakkede tomater|boenner|kikaerter|majs/],
  ['pantry', 'sauces', /sauce|soja|ketchup|mayonnaise|dressing/],
  ['pantry', 'spices', /krydderi|spidskommen|chili|peber|salt/],
  ['snacks', 'chips', /chips|snack/],
  ['snacks', 'chocolate', /chokolade|slik|kiks/],
  ['household', 'paper', /toiletpapir|koekkenrulle|serviet/],
  ['household', 'cleaning', /vaskemiddel|opvask|rengoering|tabs/],
];

const DRINK_ALLOWED = /coca[- ]?cola zero|coke zero|sprite zero/;
const EXCLUDE = /oel|vin|whisky|vodka|gin|cigaret|tobak|plante|blomst|legetoej|vaerktoej|beklaedning|elektronik/;

export function classifyOffer(raw) {
  const text = norm(`${raw.heading || ''} ${raw.description || ''}`);
  if (EXCLUDE.test(text)) return null;
  if (/cola|sprite|sodavand|soft drink/.test(text)) {
    if (!DRINK_ALLOWED.test(text)) return null;
    return { categoryId: 'drinks', comparisonGroup: 'zero_soda' };
  }
  for (const [categoryId, comparisonGroup, regex] of RULES) {
    if (regex.test(text)) return { categoryId, comparisonGroup };
  }
  // Keep food-like and household offers, drop obvious non-food unknowns.
  if (/koed|fisk|frugt|groent|mad|gram|kg|ml|liter|stk|pak|food/.test(text)) {
    return { categoryId: 'pantry', comparisonGroup: 'other' };
  }
  return null;
}

export function normalizedText(value) { return norm(value); }
