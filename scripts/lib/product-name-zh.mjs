const normalize = value => String(value || '')
  .toLowerCase()
  .replace(/æ/g, 'ae')
  .replace(/ø/g, 'o')
  .replace(/å/g, 'aa')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const title = (pattern, nameZh) => [pattern, nameZh];

const DANISH_PRODUCT_FORM_TITLES = [
  title(/silvercrest elkedel.*smoothie maker/, 'SILVERCREST 电热水壶或随行搅拌机任选'),
  title(/depend neglefil.*kiss naturlige vipper/, '美甲锉或自然款假睫毛任选'),
  title(/murph proteinbar.*energi gel/, 'Murph 蛋白棒、麦片棒或运动能量胶任选'),
  title(/barebells proteinbar.*shake/, 'Barebells 蛋白棒或即饮蛋白奶昔任选'),
  title(/nutramino wafer.*proteinbar|proteinbar.*nutramino wafer/, '蛋白棒或高蛋白威化任选'),
  title(/murph proteinbar med kreatin/, 'Murph 肌酸蛋白棒'),
  title(/alesto proteinkugler/, 'ALESTO 蛋白球零食'),
  title(/protein lab protein snack/, 'Protein Lab 高蛋白零食'),
  title(/^surdejspizza .*prosciutto.*diavola/, '意式酸种火腿披萨或辣香肠披萨任选'),
  title(/kohberg smorbagt fastfoodbrod.*cafesandwich/, 'Kohberg 黄油烘焙快餐面包或三明治面包任选'),
  title(/^nye lammefjords kartofler/, '丹麦 Lammefjords 新土豆'),
  title(/anglamark.*kartofler.*brod/, 'Änglamark 有机土豆或面包任选'),
  title(/pepsi max.*faxe kondi.*booster energidrik/, 'Pepsi Max、Faxe Kondi 汽水或 Booster 能量饮料任选'),
  title(/faxe kondi.*pepsi max.*vitamin well/, 'Faxe Kondi 柠檬青柠汽水、Pepsi Max 无糖可乐或 Vitamin Well 维生素水任选'),
  title(/barebells.*nupo/, 'Barebells 或 Nupo 蛋白棒、代餐或蛋白奶昔任选'),
  title(/italiensk charcuteri.*gestus pizzabunde/, '意式冷切肉或 Gestus 披萨饼底任选'),
  title(/irma.*surdejspizzabund|premieur surdejspizzabund/, '酸种披萨饼底'),
  title(/il fornaio.*pizzadej/, 'Il Fornaio 有机披萨面团'),
  title(/protein lab protein brod/, 'Protein Lab 高蛋白面包'),
  title(/gelatelli high protein isbaeger/, 'GELATELLI 高蛋白杯装冰淇淋'),
  title(/trust gxt234 mikrofon/, 'Trust GXT234 发光游戏麦克风'),
  title(/^elmarked$/, '电器商品专区任选'),
  title(/breezer.*somersby.*schweppes.*red bull/, '预调酒、苹果酒、汤力水或能量饮料任选'),
  title(/neoprencover.*mobiloplader.*mus/, '14英寸电脑保护套、无线手机充电器或鼠标任选'),
  title(/harboe sodavand/, 'Harboe 多口味汽水'),
  title(/state.*xoxo sodavand/, 'State 功能饮料或 XOXO 汽水任选'),
  title(/^sodavand$/, '甜瓜、李子或金桔味汽水任选'),
  title(/jolly sodavand/, 'Jolly 多口味汽水'),
  title(/aarstiderne.*sodavand/, 'Aarstiderne 有机苹果莓果汽水'),
  title(/sol mar gazpacho/, 'SOL&MAR 西班牙冷番茄汤'),
  title(/protein lab protein sandwich/, 'Protein Lab 高蛋白高纤面包'),
  title(/protein cafe sandwich/, 'Protein Café 高蛋白三明治'),
  title(/murph pwo.*kreatin/, 'Murph 训练前补剂或肌酸粉任选'),
  title(/murph whey med kreatin/, 'Murph 乳清蛋白肌酸粉'),
  title(/baileys is.*triple chocolate/, 'Baileys 风味或三重巧克力冰淇淋任选'),
  title(/^slikaerter$/, '甜脆豌豆荚'),
  title(/toms guldkarameller.*kaempe skildpadder/, 'Toms 黄油焦糖或巧克力夹心糖任选'),
  title(/^fredagsslik$/, '周五自选散装糖果'),
  title(/twist.*marabou slikmarked/, 'Twist 或 Marabou 混合糖果任选'),
  title(/panda lakrids/, 'Panda 甘草糖'),
  title(/^daaselaag med sugeror$/, '易拉罐防洒盖与吸管（2件装）'),
  title(/^steamcleaner$/, 'Sjö 蒸汽清洁机'),
  title(/ben s sauce.*dolmio|dolmio.*ben s sauce/, 'Ben’s 或 Dolmio 意面烹调酱任选'),
  title(/karolines kokken sauce/, 'Karolines Køkken 奶油烹调酱'),
  title(/odense marcipan dessert sauce/, 'Odense Marcipan 甜点酱'),
  title(/k salat bearnaise|bearnaisesauce|sauce bearnaise/, '贝阿恩酱'),
  title(/jensens.*sauce/, 'Jensens Køkken 佐餐酱'),
  title(/vitasia asiatisk.*sauce/, 'VITASIA 亚洲风味烹调酱'),
  title(/vitasia sursod.*forarsrullesauce/, 'VITASIA 糖醋酱或春卷蘸酱任选'),
  title(/vitasia woksauce/, 'VITASIA 炒菜酱'),
  title(/middagsfrikadeller.*mini kodboller/, '丹麦煎肉饼或迷你肉丸任选'),
  title(/^salsiccia$/, '意式 Salsiccia 生香肠'),
  title(/vitasia slow cooked svineslag/, 'VITASIA 慢煮猪五花肉'),
  title(/pantene eller kleenex/, 'Pantene 洗护用品或 Kleenex 面巾纸任选'),
  title(/tulip pizzatopping/, 'Tulip 熟制披萨肉类配料'),
  title(/ristet sesamolie/, '烘香芝麻油'),
  title(/koldpresset rapsolie/, '有机冷榨菜籽油'),
  title(/super kraes kebab/, 'Super Kræs Kebab 调味烤肉条'),
  title(/^oksekebab$/, '牛肉 Kebab 烤肉条'),
  title(/^grillpolse$/, '烧烤香肠'),
  title(/santa maria indisk/, 'Santa Maria 印度风味酱料或调味料任选'),
  title(/santa maria tex mex|coop tex mex|banderos/, 'Tex-Mex 墨西哥风味酱料或调味商品'),
  title(/dipmix/, '蘸酱调味粉'),
  title(/dippies fruit dips/, '水果蘸酱'),
  title(/miracle whip/, 'Miracle Whip 蛋黄酱式调味酱'),
  title(/bahncke|gestus pebermix/, 'Bähncke 或 Gestus 调味酱'),
  title(/meyers spreads eller ostetern/, 'Meyers 抹酱或奶酪丁任选'),
  title(/antonius marked|grillmarked|rema 1000 dansk grillkod/, '多款调味烧烤肉任选'),
  title(/fredagstapas/, '熟食柜周五 Tapas 拼盘'),
  title(/italiensk antipasti|citterio italiensk charcuteri/, '意式冷切肉拼盘'),
  title(/charcuteri med troffel/, '松露风味冷切肉'),
  title(/den gronne slagter/, 'Den Grønne Slagter 熟制肉品任选'),
  title(/gestus topping|steff houlberg topping/, '熟制肉类配料'),
  title(/^cevapcici$/, '巴尔干风味烤肉条'),
  title(/vitasia chicken bites/, 'VITASIA 调味鸡肉块'),
  title(/^sucuk/, '土耳其辣味牛肉香肠'),
  title(/yakitori spyd/, '日式调味鸡肉串'),
  title(/dansk grillkam/, '丹麦调味猪外脊烧烤肉'),
  title(/bbq grillben/, 'BBQ 调味猪肋骨'),
  title(/krebinetter af fjerkrae/, '禽肉煎肉饼'),
  title(/premieur pommes gigant/, 'Premieur 大号冷冻薯条'),
  title(/velsmag tykstegsbof af gris/, '调味猪后腿肉排'),
  title(/parmaskinke eller antipasto misto/, '帕尔马火腿或意式冷切拼盘任选'),
  title(/filet a la morbrad/, '猪里脊式调味肉排'),
  title(/frilandsgris morbrad.*grillkoller/, '散养猪里脊或 BBQ 烧烤肉任选'),
  title(/marineret tomahawk/, 'BBQ 腌制 Tomahawk 牛排'),
  title(/grillfakler/, 'BBQ 调味螺旋肉串'),
  title(/ekstra jomfruolie/, '特级初榨橄榄油'),
  title(/magnum.*minecraft.*solero.*iskasse/, 'Magnum、Minecraft 或 Solero 盒装冰品任选'),
  title(/rose kyllingetopping/, 'Rose 熟制鸡肉配料'),
  title(/rahbek indbagt fisk/, 'Rahbek 冷冻裹面糊鱼制品'),
  title(/amanda yellowfin tun/, 'Amanda 黄鳍金枪鱼罐头'),
  title(/saeby makrel/, 'Sæby 鲭鱼罐头'),
  title(/protein kebab.*kyllinge.*oksekod/, '鸡牛混合或纯牛肉 Kebab 烤肉条任选'),
  title(/xxl kyllingefilet/, 'XXL 冷冻鸡胸肉'),
  title(/xxl kyllingestrimler/, 'XXL 鸡肉条'),
  title(/grillspyd med gris og grontsager/, '猪肉蔬菜烧烤串'),
  title(/coop kylling|rema 1000 dansk kylling/, '多款丹麦鸡肉任选'),
  title(/^kylling$/, '熟制鸡肉条、鸡肉片或鸡肉块'),
  title(/grillet kyllingefilet i strimler/, '熟制烤鸡胸肉条'),
  title(/hakket dansk kylling/, '丹麦鸡肉末'),
  title(/kyllinge polser.*kodpolse/, '鸡肉香肠或肉香肠任选'),
  title(/kyllinge brystfilet paalaeg/, '鸡胸肉冷切片'),
  title(/stegte kyllingegrillspyd/, '熟制鸡肉烧烤串'),
  title(/laarfilet med skind.*kylling/, '带皮丹麦鸡腿排'),
  title(/underlaar.*kylling/, '丹麦鸡小腿'),
  title(/brystfilet.*kylling/, '丹麦鸡胸肉'),
  title(/havblaa hel dorade/, '整条金头鲷'),
  title(/sol mar hele sardiner/, '整条冷冻沙丁鱼'),
  title(/thorfisk torskefileter/, '鳕鱼柳'),
  title(/glyngore tun i vand.*olie/, '水浸或油浸金枪鱼罐头'),
  title(/lykkeberg sild|gestus sild/, '腌渍鲱鱼'),
  title(/amanda rogn.*glyngore tun/, '鱼籽罐头或金枪鱼罐头任选'),
  title(/rema 1000 dansk rodfiskfilet.*kullerloins.*rodspaettefileter/, '红鱼柳、黑线鳕鱼里脊或鲽鱼柳任选'),
  title(/rema 1000 rogn.*kippers.*yellowfin tun/, '鱼籽、烟熏鲱鱼或黄鳍金枪鱼罐头任选'),
  title(/glyngore eller bornholms fiskemarked/, '鱼籽、鱼丸、鳕鱼肝、番茄鲭鱼或金枪鱼罐头任选'),
  title(/fiske eller skaldyrsmarked|^fiskemarked$/, '多款冷冻鱼类或海鲜任选'),
  title(/penalhus.*mobilholder.*drikkedunk/, '文具、学习用品、手机支架或水瓶任选'),
  title(/^o (?:20|24|28) cm\b/, '不锈钢陶瓷不粘煎锅'),
  title(/lekaform/, 'Lekaform 维生素或矿物质补充剂'),
  title(/la campagna udenlandske specialiteter/, 'La Campagna 萨拉米、火腿或肉酱等冷切任选'),
  title(/pakkemarked/, '腌制猪牛羊烧烤肉、肉串或汉堡肉饼任选'),
  title(/lun lordag/, '烤猪肉、丹麦肉饼、炸鱼柳或肝酱任选'),
  title(/f[oe]tex favoritter/, 'føtex 多品类门店精选商品'),
  title(/^(?:20.*alt urtekram|urtekram)$/, 'Urtekram 有机食品或个人护理用品任选'),
  title(/sagra.*butchers.*poussin/, 'Butterfly 童子鸡或黄皮童子鸡任选'),
  title(/dansk kalve flanksteak/, '丹麦小牛腹肉排（原味或腌制）'),
  title(/danske svinekoteletter/, '丹麦猪排（原味或腌制）'),
  title(/filet ala morbrad.*polser/, '调味猪里脊式肉排或多种香肠任选'),
  title(/koteletter.*grillsticks.*grillpolser/, '猪排、烧烤肉条或烧烤肠任选'),
  title(/mutti.*tomater.*pizzasauce/, 'Mutti 番茄罐头或披萨酱任选'),
  title(/nektariner.*ferskner.*blommer.*abrikoser/, '油桃、桃子、李子或杏任选'),
  title(/marinerede.*grillspyd.*lamm/, '腌制羊肉烧烤串'),
  title(/marinerede.*flanksteak/, '腌制牛腹肉排'),
  title(/bacontern/, '培根丁'),
  title(/skinkestrimler/, '火腿条'),
  title(/serranoskinke/, '西班牙塞拉诺风干火腿'),
  title(/skinke i skiver/, '切片火腿'),
  title(/grill.*pande.*wiener.*hotdogpolser/, '煎烤肠、维也纳肠或热狗肠任选'),
  title(/pizzasauce/, '披萨酱'),
  title(/kania.*chilisauce/, 'KANIA 辣椒酱'),
  title(/sursod.*foraarsrullesauce/, '糖醋酱或春卷蘸酱任选'),
  title(/vitasia.*woksauce/, 'VITASIA 炒菜酱'),
  title(/lambi classic papir/, 'Lambi 卫生纸或厨房纸任选'),
  title(/godt papir/, '卫生纸或厨房纸任选'),
  title(/paalaegsbokse/, '冷切食品收纳盒'),
  title(/citronella.*lys/, '香茅驱蚊蜡烛'),
  title(/frikadeller.*fiskefilet.*kamsteg/, '丹麦肉饼、炸鱼柳或烤猪肉片任选'),
  title(/morbrad.*kartoffel.*kyllingebryst.*flodekartof/, '猪里脊配土豆塔或奶酪鸡胸配奶油土豆任选'),
  title(/burnt ends.*hakket oksekod/, 'BBQ 熟牛肉块或牛肉末任选'),
  title(/shampoo.*balsam.*skifteunderlag/, '洗护用品或婴儿换尿垫任选'),
  title(/knorr.*pasta.*risretter.*hellmanns.*maille/, '方便意面/米饭、蛋黄酱或芥末酱任选'),
  title(/naturli.*smorbar.*iskaffe.*havre.*mandel.*drik/, '植物抹酱、冰咖啡或植物饮任选'),
  title(/burger boost/, 'Burger Boost 牛肉汉堡饼'),
  title(/vita d or.*solsikke.*rapsolie/, '葵花籽油或菜籽油任选'),
  title(/crosti.*basilikum.*hvidlog/, '罗勒蒜味烤面包脆片'),
  title(/maelkesnitter/, '牛奶夹心蛋糕'),
  title(/sol mar.*blaeksprutte.*chorizo/, '鱿鱼圈或 Chorizo 辣肠可乐饼任选'),
  title(/chef select.*kyllingenuggets/, 'PAW Patrol 造型裹粉鸡块'),
  title(/danpo tempura nuggets.*cordon bleu/, '天妇罗鸡块或鸡肉蓝带肉排任选'),
  title(/cordon bleu af fjerkrae/, '禽肉蓝带夹心肉排'),
  title(/kyllingeburger/, '裹粉鸡肉汉堡饼'),
  title(/ribsteak.*bbq/, 'BBQ 腌制猪肋排肉片'),
  title(/marineret morbrad.*gris/, '腌制猪里脊'),
  title(/marineret oksecuvette/, '腌制牛后臀尖肉'),
  title(/salsiccia/, '意式 Salsiccia 烧烤香肠'),
  title(/4 burgerboller.*6 polsebrod/, '4 个汉堡面包或 6 个热狗面包'),
  title(/tandpasta.*tandborster.*mundskyl/, '牙膏、牙刷或漱口水任选'),
  title(/pasteis de nata/, '葡式蛋挞'),
  title(/churros/, '西班牙吉事果'),
  title(/magdalenas/, '西班牙玛德琳小蛋糕'),
  title(/wienerstang/, '丹麦酥皮长条甜点'),
  title(/fransk hotdog/, '法式热狗'),
  title(/kyllingebryst.*laar|laar.*kyllingebryst/, '鸡胸肉或鸡腿肉任选'),
  title(/tomatkniv/, '番茄刀套装'),
  title(/tomatkonserves/, '番茄罐头'),
  title(/tomatpure.*pastasauce/, '番茄膏或意面酱'),
  title(/tomat ketchup.*sauce|tomatketchup.*sauce/, '番茄酱或烹调酱'),
  title(/\bketchup\b/, '番茄酱'),
  title(/opvaskemiddel/, '洗碗液'),
  title(/maskinopvask/, '洗碗机洗涤剂'),
  title(/jordbaer.*vaniljeis|vaniljeis.*jordbaer/, '草莓或香草冰淇淋'),
  title(/\bis\b|ispind|isvafler|isbaeger|iskasse|gelato|gelatelli/, '冰淇淋或冰品'),
  title(/sandwich kiks|\bkiks\b|smaakager|cookies|vafler/, '饼干或华夫点心'),
  title(/jordbaertaerte/, '草莓挞'),
  title(/jordbaerkage/, '草莓蛋糕'),
  title(/granola|musli|mysli|muesli|crusli|cruesli|havregryn|morgenmad/, '早餐谷物或燕麦'),
  title(/paalaegschokolade/, '面包用薄片巧克力'),
  title(/frugtpaalaeg|grinebidder/, '水果条/水果片零食'),
  title(/rejeost|skinkeost/, '虾味或火腿味奶油奶酪'),
  title(/mexitopping/, '墨西哥菜用刨丝奶酪'),
  title(/halloumi|grillost/, '哈罗米烧烤奶酪'),
  title(/feta|hvid ost/, '菲达式白奶酪'),
  title(/osteplatte/, '奶酪拼盘'),
  title(/friskost/, '新鲜奶油奶酪'),
  title(/smorcroissant/, '冷冻黄油可颂'),
  title(/smorrebrod/, '丹麦开放式三明治'),
  title(/paalaegssalat/, '三明治夹馅沙拉/抹酱'),
  title(/forarsruller|spring rolls|miniruller/, '冷冻春卷'),
  title(/asia cubes/, '冷冻亚洲风味小食'),
];

// These phrases are deliberately product-form first. They are maintained by
// Codex and materialized into the repository; the website never calls an AI or
// translation API at runtime.
const DANISH_TITLES = [
  title(/paalaegschokolade/, '面包用薄片巧克力'),
  title(/frugtpaalaeg|grinebidder/, '水果条/水果片零食'),
  title(/rejeost|skinkeost/, '虾味或火腿味奶油奶酪'),
  title(/smorcroissant/, '冷冻黄油可颂'),
  title(/smorrebrod/, '丹麦开放式三明治'),
  title(/burgerboller/, '汉堡面包胚'),
  title(/polsebrod|hotdogbrod/, '热狗面包'),
  title(/kyllingepopcorn/, '爆米花鸡块（裹粉小鸡块）'),
  title(/morliny.*classic.*crispy hot wings/, 'Morliny 原味或香辣脆皮鸡翅'),
  title(/kyllingeburger.*nuggets?/, '鸡肉汉堡饼或鸡块'),
  title(/kyllingespyd/, '调味鸡肉串'),
  title(/kyllingevinger/, '鸡翅'),
  title(/hot ?wings|buffalo wings|\bwings\b/, '调味鸡翅'),
  title(/kalkunoverlaar.*schnitzel.*bryst/, '火鸡大腿或火鸡胸薄片任选'),
  title(/paalaeg.*postej.*kalkunbacon/, '冷切、肝酱或火鸡培根任选'),
  title(/kalkunhakkebof/, '火鸡肉饼'),
  title(/cordon bleu.*kalkun/, '火鸡蓝带肉排'),
  title(/kalkunbryst/, '火鸡胸肉'),
  title(/kalkunoverlaar/, '火鸡大腿'),
  title(/kalkununderlaar/, '火鸡小腿'),
  title(/kalkunschnitz/, '火鸡胸薄片'),
  title(/kalkunstrimler/, '火鸡胸肉条'),
  title(/hakket kalkun/, '火鸡肉末'),
  title(/poussin/, '童子鸡'),
  title(/kyllingebryst.*inderfilet|inderfilet.*kylling/, '鸡胸肉或鸡里脊'),
  title(/kyllingebryst/, '鸡胸肉'),
  title(/kyllingeoverlaar|udbenede.*overlaar/, '鸡大腿肉'),
  title(/kyllingeunderlaar/, '鸡小腿'),
  title(/kyllingelaar|hele.*laar/, '整只鸡腿'),
  title(/hakket kylling/, '鸡肉末'),
  title(/hel kylling/, '整只鸡'),
  title(/kyllingemarked/, '多款鸡肉任选'),
  title(/fransk majskylling/, '法国玉米饲养鸡'),
  title(/kylling snack polser/, '鸡肉零食香肠'),
  title(/kyllingepolser/, '鸡肉香肠'),
  title(/grisemorbrad|moerbrad.*gris/, '猪里脊'),
  title(/flaeskesteg|ovnklar.*steg/, '丹麦脆皮烤猪肉块'),
  title(/ribbensteg/, '带皮猪肋烤肉'),
  title(/porchetta/, '意式香草烤猪肉卷'),
  title(/pulled pork/, '手撕猪肉'),
  title(/spareribs|long ribs/, '猪肋排'),
  title(/kamben/, '猪肋骨'),
  title(/nakkekotelet/, '猪梅花肉排'),
  title(/kamkotelet/, '猪里脊排'),
  title(/kotelet/, '猪排'),
  title(/stegeflaesk|flaesk i skiver/, '切片猪五花肉'),
  title(/hakket gris.*kalv|hakket kalv.*gris/, '猪肉与小牛肉混合肉末'),
  title(/hakket gris/, '猪肉末'),
  title(/frikadeller/, '丹麦肉丸饼'),
  title(/kodbol/, '肉丸'),
  title(/farsbrod/, '肉糜烤肉卷'),
  title(/bacon.*strimler/, '培根条'),
  title(/bacon.*skiver/, '培根片'),
  title(/\bbacon\b/, '培根'),
  title(/hamburgerryg/, '烟熏猪里脊冷切'),
  title(/leverpostej|\bpostej\b/, '丹麦肝酱'),
  title(/spegepolse|salami/, '萨拉米或风干香肠'),
  title(/chorizo/, '西班牙辣味香肠'),
  title(/medister/, '丹麦粗猪肉香肠'),
  title(/frankfurter/, '法兰克福香肠'),
  title(/bockwurst/, '德式博克香肠'),
  title(/krakauer|krainer/, '中欧烟熏香肠'),
  title(/grillpolser|\bpolser\b/, '烧烤香肠'),
  title(/italiensk paalaeg/, '意式冷切肉'),
  title(/\bpaalaeg\b/, '三明治冷切或抹酱'),

  title(/hakket okse.*gris|hakket gris.*okse/, '牛猪混合肉末'),
  title(/hakket okse/, '牛肉末'),
  title(/burgerboffer|hamburger af oksekod/, '牛肉汉堡饼'),
  title(/oksekod i tern/, '牛肉丁'),
  title(/oksekod i strimler/, '牛肉条'),
  title(/rumpsteak.*entrecote|entrecote.*rumpsteak/, '牛臀排或肋眼牛排'),
  title(/striploin.*ribeye roast|ribeye roast.*striploin/, '西冷或肋眼整块烤牛肉'),
  title(/striploin.*ribeye.*rumpsteak|rumpsteak.*ribeye.*striploin/, '西冷、肋眼或牛臀排'),
  title(/ribeye|rib eye/, '肋眼牛排'),
  title(/entrecote/, '西冷肋眼牛排'),
  title(/rumpsteak/, '牛臀排'),
  title(/flatsteak|flanksteak/, '牛腹肉排'),
  title(/culotte/, '牛臀尖烤肉'),
  title(/roastbeef/, '烤牛肉'),
  title(/striploin/, '纽约客/外脊牛排'),
  title(/tykstegsboffer/, '牛臀肉排'),
  title(/kalvesteak|kalvemarked/, '小牛肉或小牛排'),
  title(/oksesteak|\bsteak/, '牛排'),
  title(/lammeculotte/, '羊臀尖烤肉'),
  title(/lamme/, '羊肉'),

  title(/koldroget.*laks/, '冷熏三文鱼'),
  title(/varmroget.*laks/, '热熏三文鱼'),
  title(/roget.*laks|gravad.*laks/, '烟熏或腌渍三文鱼'),
  title(/hel laksefilet/, '整片带皮三文鱼柳'),
  title(/laksefilet|laksestykke/, '三文鱼柳'),
  title(/gronlandsrejer/, '格陵兰冷水虾'),
  title(/vannameirejer/, '南美白虾'),
  title(/kaemperejer|gambas/, '大虾'),
  title(/rejer i lage/, '盐水浸虾仁'),
  title(/torpedo rejer/, '裹粉蝴蝶虾'),
  title(/fiskepinde/, '裹粉鱼条'),
  title(/fiskefrikadeller/, '丹麦鱼肉饼'),
  title(/fiskefars/, '调味鱼肉糜'),
  title(/tunsteak/, '金枪鱼排'),
  title(/\btun\b/, '金枪鱼罐头或鱼排'),
  title(/torskefileter/, '鳕鱼柳'),
  title(/rodspaette/, '鲽鱼'),
  title(/makrel/, '鲭鱼'),
  title(/sardiner/, '沙丁鱼'),
  title(/dorade/, '金头鲷'),
  title(/blaeksprutteringe/, '鱿鱼圈'),
  title(/skagensalat/, '丹麦虾肉沙拉酱'),
  title(/fiskemarked|seafoodmix|skaldyrsmarked/, '多款鱼类或海鲜任选'),

  title(/rejeost|skinkeost/, '虾味或火腿味奶油奶酪'),
  title(/blaaskimmelost/, '蓝纹奶酪'),
  title(/flodeost/, '奶油奶酪'),
  title(/smelteost/, '加工融化奶酪'),
  title(/smoreost|smorbar ost/, '涂抹奶酪'),
  title(/hytteost/, '茅屋奶酪'),
  title(/revet mozzarella/, '刨丝马苏里拉奶酪'),
  title(/mozzarella/, '马苏里拉奶酪'),
  title(/grana padano|parmesan/, '帕达诺/帕玛森硬质奶酪'),
  title(/havarti/, '哈瓦蒂奶酪'),
  title(/danbo/, '丹麦 Danbo 奶酪'),
  title(/gouda.*cheddar|cheddar.*gouda/, '高达或切达奶酪'),
  title(/gouda/, '高达奶酪'),
  title(/cheddar/, '切达奶酪'),
  title(/skiveost/, '切片奶酪'),
  title(/skaereost/, '块状切片奶酪'),
  title(/salatost/, '沙拉白奶酪'),
  title(/\bost\b/, '奶酪'),
  title(/graesk yoghurt/, '希腊酸奶'),
  title(/drikkeyoghurt/, '饮用酸奶'),
  title(/\byoghurt\b/, '酸奶'),
  title(/\bskyr\b/, 'Skyr 高蛋白发酵乳'),
  title(/\bkefir\b/, '开菲尔发酵乳'),
  title(/\ba38\b/, 'A38 丹麦酸牛奶'),
  title(/koldskaal/, '丹麦冷甜酸奶汤'),
  title(/piskeflode/, '淡奶油/打发奶油'),
  title(/madlavningsflode/, '烹饪奶油'),
  title(/creme fraiche|\bfraiche\b/, '酸奶油'),
  title(/kakaomaelk/, '巧克力牛奶'),
  title(/kaernemaelk/, '酪乳'),
  title(/protein ?drik|proteinshake/, '蛋白乳饮料'),
  title(/laktosefri maelk/, '无乳糖牛奶'),
  title(/havredrik/, '燕麦饮'),
  title(/sojadrik/, '豆奶'),
  title(/skrabeaeg/, '平养鸡蛋'),
  title(/frilandsaeg/, '散养鸡蛋'),
  title(/okologiske aeg/, '有机鸡蛋'),
  title(/\baeg\b/, '鸡蛋'),
  title(/smorcroissant/, '冷冻黄油可颂'),
  title(/smorrebrod/, '丹麦开放式三明治'),
  title(/\bsmor\b|smorbar/, '黄油或涂抹黄油'),
  title(/margarine/, '人造黄油'),

  title(/purlog/, '细香葱'),
  title(/basilikum/, '罗勒'),
  title(/persille/, '欧芹'),
  title(/gulerod/, '胡萝卜'),
  title(/broccoli/, '西兰花'),
  title(/blomkaal/, '花椰菜'),
  title(/spidskaal/, '尖头卷心菜'),
  title(/bananer?/, '香蕉'),
  title(/hvidkaalssalat/, '卷心菜沙拉'),
  title(/icebergsalat/, '冰山生菜'),
  title(/hjertesalat/, '小颗罗马生菜'),
  title(/spinat/, '菠菜'),
  title(/champignon/, '口蘑/白蘑菇'),
  title(/snacktomat/, '小番茄'),
  title(/blommetomat/, '李形番茄'),
  title(/cocktailtomat/, '鸡尾酒番茄'),
  title(/tomater? paa stilk|stilktomat/, '带藤番茄'),
  title(/\btomat/, '番茄'),
  title(/snackpeber/, '甜味小彩椒'),
  title(/rod peber/, '红甜椒'),
  title(/agurk/, '黄瓜'),
  title(/majs(?:kolber?|kolbe)/, '鲜玉米棒'),
  title(/\bmajs\b/, '玉米'),
  title(/danske lose aerter/, '丹麦带荚鲜豌豆'),
  title(/\baerter\b/, '豌豆'),
  title(/kartoffelsalat/, '土豆沙拉'),
  title(/bagekartofler/, '烘烤用大土豆'),
  title(/nye.*kartofler/, '新季小土豆'),
  title(/grydeklare kartofler/, '已清洗可直接烹调的土豆'),
  title(/\bkartofler\b/, '新鲜土豆'),
  title(/pommes frites/, '冷冻薯条'),
  title(/kartoffelbaade/, '冷冻薯角'),
  title(/kartoffelkroket/, '土豆可乐饼'),
  title(/kartoffelgratin|flodekartof/, '奶油焗土豆'),
  title(/kartoffelrosti/, '瑞士土豆饼'),

  title(/jordbaer/, '草莓'),
  title(/blaabaer/, '蓝莓'),
  title(/solbaer/, '黑加仑'),
  title(/vandmelon/, '西瓜'),
  title(/honningmelon/, '蜜瓜'),
  title(/kantalup|cantaloupe/, '网纹甜瓜'),
  title(/vindruer|\bdruer\b/, '葡萄'),
  title(/nektarin.*fersken|fersken.*nektarin/, '桃或油桃'),
  title(/nektarin/, '油桃'),
  title(/fersken/, '桃子'),
  title(/sveskeblommer/, '西梅李'),
  title(/\bblomme\b/, '李子'),
  title(/abrikoser/, '杏'),
  title(/kirsebaer/, '樱桃'),
  title(/pink lady.*aebler/, 'Pink Lady 苹果'),
  title(/\baebler\b/, '苹果'),
  title(/mango/, '芒果'),
  title(/avocado/, '牛油果'),
  title(/ananas/, '菠萝'),
  title(/melonmix|frugtmix/, '切配水果拼盘'),

  title(/forarsruller|spring rolls|miniruller/, '冷冻春卷'),
  title(/asia cubes/, '冷冻亚洲风味小食'),
  title(/pierogi|pelmeni|wareniki/, '东欧馅饺'),
  title(/kartoffel dumplings/, '土豆团子'),
  title(/\bdumplings\b/, '冷冻饺子'),
  title(/\bpizza\b/, '冷冻或即食披萨'),
  title(/lasagne|lasagnette/, '千层面方便餐'),
  title(/biksemad/, '丹麦土豆肉丁杂烩'),
  title(/bami goreng/, '印尼炒面方便餐'),
  title(/borsjtj/, '东欧甜菜根汤'),
  title(/pokebowl/, '夏威夷风味盖饭碗'),
  title(/panini/, '帕尼尼热压三明治'),
  title(/falafel/, '炸鹰嘴豆丸'),
  title(/faerdigret/, '预制方便餐'),
  title(/ispind/, '冰棒'),
  title(/isvafler/, '蛋筒冰淇淋'),
  title(/sandwichis/, '冰淇淋三明治'),
  title(/mochi/, '麻薯冰淇淋'),
  title(/isbaeger/, '杯装冰淇淋'),
  title(/\bis\b|gelato|gelatelli/, '冰淇淋'),

  title(/rugbrod/, '丹麦黑麦面包'),
  title(/fladbrod/, '扁面包'),
  title(/schwarzbrod/, '德式深色黑麦面包'),
  title(/fodselsdagsboller/, '丹麦生日甜面包'),
  title(/fuldkornskrydderboller/, '全麦香料小面包'),
  title(/burgerboller/, '汉堡面包胚'),
  title(/polsebrod|hotdogbrod/, '热狗面包'),
  title(/rundstykker/, '丹麦早餐小圆面包'),
  title(/baguette|flutes/, '法棍面包'),
  title(/pitabrod/, '皮塔饼'),
  title(/focaccia/, '佛卡夏面包'),
  title(/ciabatta/, '恰巴塔面包'),
  title(/brioche/, '布里欧修黄油面包'),
  title(/kanelsnegl/, '肉桂卷'),
  title(/\bbrod\b/, '面包'),
  title(/spaghetti/, '意大利细面'),
  title(/lasagneplader/, '千层面片'),
  title(/aegnudler/, '鸡蛋面'),
  title(/cup noodles|kopnudler/, '杯装方便面'),
  title(/nudler|noodles/, '面条或方便面'),
  title(/gnocchi/, '意式土豆团子'),
  title(/pasta/, '意大利面'),
  title(/jasminris/, '茉莉香米'),
  title(/basmati/, '印度香米'),
  title(/\bris\b/, '大米'),
  title(/tortilla|wraps/, '墨西哥卷饼皮'),
  title(/filodej/, '菲洛薄酥皮'),
  title(/pizzamel|tipo 00/, '披萨用 00 号面粉'),
  title(/\bmel\b/, '面粉'),

  title(/granola|musli|mysli|muesli|crusli/, '什锦早餐谷物'),
  title(/havregryn/, '燕麦片'),
  title(/morgenmad/, '早餐谷物'),
  title(/\bgrod\b/, '即食粥'),
  title(/instant kaffe/, '速溶咖啡'),
  title(/hele kaffebonner|helbonner/, '整粒咖啡豆'),
  title(/formalet kaffe/, '研磨咖啡粉'),
  title(/iskaffe/, '冰咖啡饮料'),
  title(/kaffe/, '咖啡'),
  title(/marmelade/, '果酱'),
  title(/peanutbutter/, '花生酱'),
  title(/nutella/, '榛子巧克力酱'),
  title(/honning/, '蜂蜜'),

  title(/hakkede tomater|tomatkonserves/, '番茄罐头'),
  title(/kikaerter/, '鹰嘴豆'),
  title(/\bbonner\b/, '豆类罐头'),
  title(/kokosmaelk/, '椰奶罐头'),
  title(/ketchup/, '番茄酱'),
  title(/mayonnaise/, '蛋黄酱'),
  title(/remoulade/, '丹麦酸黄瓜蛋黄酱'),
  title(/sennep/, '芥末酱'),
  title(/dressing/, '沙拉酱'),
  title(/bearnaise/, '贝阿恩酱'),
  title(/pesto/, '青酱'),
  title(/hummus/, '鹰嘴豆泥'),
  title(/\bsauce\b/, '烹调酱料'),
  title(/olivenolie/, '特级初榨橄榄油'),
  title(/bouillon|\bfond\b/, '高汤块或浓缩高汤'),
  title(/krydderi/, '混合香料'),
  title(/ristede log/, '炸洋葱酥'),
  title(/\bsesam\b/, '芝麻'),
  title(/vaniljesukker/, '香草糖'),
  title(/rorsukker/, '蔗糖'),
  title(/\bsukker\b/, '白砂糖'),
  title(/syltede agurker/, '腌黄瓜'),
  title(/syltede rodlog/, '腌红洋葱'),
  title(/sauerkraut/, '德式酸菜'),
  title(/\boliven\b/, '橄榄'),
  title(/ajvar|pindur/, '巴尔干烤椒酱'),

  title(/paalaegschokolade/, '面包用薄片巧克力'),
  title(/frugtpaalaeg|grinebidder/, '水果条/水果片零食'),
  title(/bananchips/, '香蕉片'),
  title(/mikrobolgeovns popcorn/, '微波炉爆米花'),
  title(/\bpopcorn\b/, '爆米花'),
  title(/pretzels/, '椒盐脆饼'),
  title(/\bchips\b|doritos|bugles/, '薯片或玉米脆片'),
  title(/cashewnodder/, '腰果'),
  title(/valnodder/, '核桃'),
  title(/pistacienodder/, '开心果'),
  title(/mandler/, '杏仁'),
  title(/peanuts|jordnodder/, '花生'),
  title(/noddeblanding|noddemix/, '混合坚果'),
  title(/rosiner/, '葡萄干'),
  title(/svesker/, '西梅干'),
  title(/torrede tranebaer/, '蔓越莓干'),
  title(/frysetor/, '冻干水果'),
  title(/pandekage/, '煎饼或煎饼粉'),
  title(/majskiks/, '玉米米饼'),
  title(/kammerjunkere/, '丹麦脆小饼干'),
  title(/kanelgifler/, '迷你肉桂卷'),
  title(/jordbaertaerte/, '草莓挞'),
  title(/lagkage/, '夹层奶油蛋糕'),
  title(/kanelsnegl/, '肉桂卷'),
  title(/småkager|smaakager|\bkiks\b|cookies/, '饼干'),
  title(/donut/, '甜甜圈'),
  title(/\bkage\b/, '蛋糕'),
  title(/proteinbar/, '蛋白棒'),
  title(/flodeboller/, '巧克力包裹蛋白霜甜点'),
  title(/bolcher/, '硬糖'),
  title(/familieposer/, '家庭装混合糖果'),
  title(/mentos/, '曼妥思薄荷糖/水果糖'),
  title(/sesambar/, '芝麻糖棒'),
  title(/chokolade/, '巧克力'),
  title(/slikpose|\bslik\b/, '糖果'),

  title(/vaskekapsler/, '洗衣凝珠'),
  title(/vaskemiddel/, '洗衣液或洗衣粉'),
  title(/skyllemiddel/, '衣物柔顺剂'),
  title(/maskinopvask/, '洗碗机洗涤剂'),
  title(/toiletrengoring/, '马桶清洁剂'),
  title(/rengoringsmiddel/, '家用清洁剂'),
  title(/affaldsposer/, '垃圾袋'),
  title(/fryseposer/, '食品冷冻袋'),
  title(/genluksposer/, '密封保鲜袋'),
  title(/toiletpapir/, '卫生纸'),
  title(/kokkenrulle/, '厨房纸'),
  title(/vaadservietter/, '湿巾'),
  title(/servietter/, '餐巾纸'),
  title(/bleer|buksebleer/, '婴儿纸尿裤/拉拉裤'),
  title(/babypleje/, '婴儿护理用品'),
  title(/babymad/, '婴幼儿辅食'),
  title(/grodpouch/, '袋装婴儿谷物粥'),
  title(/solcreme/, '防晒霜'),
  title(/aftersun/, '晒后修护乳'),
  title(/shampoo|balsam/, '洗发水或护发素'),
  title(/tandpasta|mundpleje/, '口腔护理用品'),
  title(/deodorant/, '止汗除味剂'),
  title(/hudpleje|serum|ansigtscreme/, '面部护肤品'),
  title(/kosttilskud|mae?lkesyrebakterier/, '益生菌或营养补充剂'),
  title(/cola|pepsi|fanta|sprite|sodavand/, '汽水或软饮'),
  title(/juice|smoothie|nektar/, '果汁或果味饮料'),
  title(/danskvand|mineralvand|kildevand/, '饮用水或气泡水'),
  title(/energidrik|energy drink/, '能量饮料'),
  title(/saft|ribena|opblanding/, '浓缩兑水饮料'),
  title(/\bol\b|beer|carlsberg|tuborg|heineken|corona/, '啤酒'),
  title(/vin|wine|prosecco|champagne|cava/, '葡萄酒或起泡酒'),
  title(/vodka|whisky|rom\b|gin\b|likor|snaps/, '烈酒或利口酒'),
  title(/cider|alcopop|ready to drink/, '苹果酒或即饮调制酒'),
  title(/kattemad|kattefoder|godbidder.*kat/, '猫粮或猫零食'),
  title(/hundemad|hundefoder|godbidder.*hund|strimler.*hund/, '狗粮或狗零食'),
  title(/led.*paere|paere.*led/, 'LED 灯泡'),
  title(/brodrister/, '烤面包机'),
  title(/kaffemaskine/, '咖啡机'),
  title(/gryde|kasserolle|stegepande/, '锅具'),
  title(/skoreol|opbevaring|reol/, '家居收纳用品'),
  title(/t shirt|troje|bukser|jakke/, '服装'),
  title(/blomster|buket/, '鲜花或花束'),
  title(/plante|potteplante/, '盆栽植物'),
  title(/legetoj|bamser?|spil/, '玩具或游戏'),
  title(/notesbog|kuglepen|blyant|kontorartikler/, '文具'),
  title(/cigaret|tobak/, '烟草制品'),
  title(/nikotin/, '尼古丁产品'),
];

const GROUP_DEFAULTS = {
  chicken_thigh: '鸡腿肉', chicken_breast: '鸡胸肉', whole_chicken: '整只鸡', chicken_minced: '鸡肉末',
  chicken_wings: '鸡翅', chicken_breaded: '裹粉鸡肉小食', chicken_skewers: '鸡肉串', chicken_sausages: '鸡肉香肠', chicken_mixed_offer: '多款鸡肉任选', chicken_other: '鸡肉商品',
  turkey_breast: '火鸡胸肉', turkey_thigh: '火鸡腿肉', turkey_minced: '火鸡肉末', turkey_processed: '火鸡加工肉品', turkey_mixed_offer: '多款火鸡部位任选', poultry_deli_mixed: '禽肉冷切多品项任选', other_poultry: '其他禽肉',
  pork_roast: '烤猪肉块', pork_tenderloin: '猪里脊', pork_ribs: '猪肋排', pork_chop: '猪排或猪肉片', pork_minced: '猪肉末', sausages: '香肠', bacon_deli: '肉类冷切', prepared_meatballs: '肉丸或肉糜制品', pork_mixed_offer: '多款猪肉任选', deli_spreads: '三明治夹馅沙拉/抹酱',
  beef_minced: '牛肉末', mixed_minced: '混合肉末', beef_ribeye: '肋眼牛排', beef_striploin: '外脊牛排', beef_flat_steak: '腹肉薄切牛排', beef_rump_steak: '牛臀排', beef_bone_steak: '带骨牛排', beef_steak: '其他牛排', beef_burgers: '牛肉汉堡饼', beef_diced: '牛肉丁或牛肉条', beef_roast: '整块烤牛肉', beef_deli: '牛肉熟食', beef_mixed_offer: '多款牛肉部位任选', prepared_beef_mixed_offer: '原味或腌制牛肉任选', mixed_meat_offer: '跨肉种多品项任选', lamb_other: '羊肉',
  salmon_fresh: '生鲜三文鱼', salmon_smoked: '烟熏或腌渍三文鱼', salmon: '三文鱼', shrimp: '虾', white_fish: '鱼类商品', seafood_mixed_offer: '多款鱼虾海鲜任选', seafood_breaded: '裹粉或面糊鱼制品', seafood_tuna_canned: '金枪鱼罐头', seafood_canned_fish: '鱼类罐头', seafood_herring_pickled: '腌渍鲱鱼', seafood_other: '多款海鲜或加工海鲜', prepared_chicken_cooked: '熟制鸡肉', eggs: '鸡蛋', milk: '牛奶或乳饮料', plant_drinks: '植物奶', cream: '奶油', mixed_dairy: '多款乳制品任选', yoghurt: '酸奶或发酵乳', cheese: '奶酪',
  cheese_grated: '刨丝奶酪', cheese_sliced: '切片奶酪', cheese_spreadable: '涂抹奶酪', cheese_cottage_ricotta: '茅屋奶酪或 Ricotta', cheese_mozzarella_burrata: 'Mozzarella 或 Burrata', cheese_feta_white: 'Feta 或白奶酪', cheese_grilling: '煎烤奶酪', cheese_soft_mould: '软质或蓝纹奶酪', cheese_aged_hard: '熟成硬奶酪', cheese_danish_table: '丹麦餐桌奶酪', cheese_mixed_offer: '多款奶酪任选', cheese_other: '其他奶酪', butter: '黄油或涂抹脂',
  mushrooms: '蘑菇', cauliflower: '花椰菜', broccoli: '西兰花', lettuce: '生菜', spinach: '菠菜', chives: '细香葱', basil: '罗勒', parsley: '欧芹', mixed_fresh_herbs: '多款鲜香草任选', fresh_herbs: '鲜香草', carrots: '胡萝卜', root_vegetables: '根茎蔬菜', peppers: '甜椒或辣椒', peas: '豌豆', corn: '玉米', vegetable_mix: '蔬菜组合', mixed_produce: '多款果蔬任选', prepared_salad: '预制沙拉', potatoes_fresh: '新鲜土豆', potato_salad: '土豆沙拉', potato_sides: '加工土豆配菜', tomatoes: '番茄', cucumber: '黄瓜', cabbage: '卷心菜', onion_garlic: '葱姜蒜或洋葱', leafy_green: '叶菜', vegetables_other: '其他蔬菜',
  apples: '苹果', pears: '梨', strawberries: '草莓', blueberries: '蓝莓', other_berries: '莓果', watermelon: '西瓜', melon: '甜瓜', grapes: '葡萄', apricots: '杏', plums: '李子', cherries: '樱桃', peaches_nectarines: '桃或油桃', mixed_stone_fruit: '多款核果任选', pineapple: '菠萝', mango: '芒果', avocado: '牛油果', bananas: '香蕉', prepared_fruit: '切配水果', mixed_fruit: '多款水果任选',
  bread: '面包', mixed_bakery: '多款烘焙食品任选', rice: '大米', pasta_noodles: '意面或面条', flour_baking: '面粉或饼皮', pizza_snacks: '披萨', dumplings: '冷冻饺子或春卷', ready_meal: '预制方便餐', plant_based_meat: '植物肉或素香肠', frozen_vegetables: '冷冻蔬菜', ice_cream: '冰淇淋或冰品', cereal: '早餐谷物', coffee_tea: '咖啡或茶', spreads_jam: '果酱、蜂蜜或抹酱', mixed_grocery_offer: '跨类别食品任选', canned: '罐头食品', sauces: '酱料', spices: '香料或调味料', oil_vinegar: '食用油或醋', oil_mixed_offer: '多种食用油任选', baking_ingredients: '烘焙原料', pickled_vegetables: '腌菜或橄榄', chips: '咸味零食', chocolate: '巧克力或糖果', biscuits: '饼干或蛋糕', nuts: '坚果', dried_fruit: '果干',
  paper: '纸品', cleaning: '清洁用品', trash_bags: '垃圾袋或保鲜袋', kitchen_consumables: '厨房耗材', diapers: '纸尿裤', baby_care: '婴儿护理用品', baby_food: '婴幼儿食品', hair_body: '个人洗护用品', personal_hair_care: '洗发或护发用品', personal_skin_care: '洁面或护肤用品', personal_body_care: '沐浴或身体护理用品', personal_deodorant: '止汗除味用品', personal_oral_care: '口腔护理用品', personal_makeup: '彩妆用品', personal_shaving: '剃须用品', personal_appliances: '个人护理电器', personal_appliances_mixed_offer: '多种个人护理电器任选', personal_accessories: '个人护理辅助用品', personal_health_devices: '健康检测或护理设备', personal_care_mixed_offer: '多种个人护理用品任选', sun_care: '防晒用品', hygiene: '卫生护理用品', supplements: '营养补充剂', supplement_sports_snack: '蛋白零食与运动能量补给', zero_soda: '无糖可乐或雪碧',
  drink_soda: '汽水或软饮', drink_juice: '果汁或果味饮料', drink_water: '饮用水或气泡水', drink_energy: '能量饮料', drink_sports: '运动饮料', drink_mixed_offer: '汽水与能量饮料任选', drink_concentrate: '浓缩兑水饮料', drink_other: '其他饮料',
  alcohol_beer: '啤酒', alcohol_wine: '葡萄酒', alcohol_wine_red: '红葡萄酒', alcohol_wine_white: '白葡萄酒', alcohol_wine_rose: '桃红葡萄酒', alcohol_wine_sparkling: '起泡酒', alcohol_wine_mixed_offer: '多种葡萄酒任选', alcohol_wine_other: '葡萄酒（类型未明确）', alcohol_spirits: '烈酒或利口酒', alcohol_cider_rtd: '苹果酒或即饮调制酒', alcohol_mixed_offer: '跨酒种任选', alcohol_other: '其他酒类',
  pet_cat: '猫粮或猫用品', pet_dog: '狗粮或狗用品', pet_other: '其他宠物用品', flower_bouquet: '鲜花或花束', plants: '盆栽或园艺植物',
  home_appliances: '家用小电器', home_cookware: '锅具或厨房工具', home_tableware: '餐具或饮具', home_storage: '家居收纳用品', home_furniture: '家具', home_textiles: '床品或家用纺织品', home_bath: '浴室用品或毛巾', home_tools: '家用工具', home_garden: '园艺或户外家居用品', home_decor: '家居装饰用品', home_other: '其他家居用品',
  electronics_audio: '音频设备', electronics_computing: '数码产品或配件', electronics_tv: '电视或投影设备', electronics_mobile: '手机、平板或智能手表', electronics_computer: '电脑或数码配件', electronics_monitor: '电脑显示器', electronics_computer_accessory: '电脑配件', electronics_print_photo: '打印或影像设备', electronics_gaming: '游戏设备或游戏', electronics_charging: '充电器或线材', electronics_lighting: '电子照明用品', electronics_other: '其他电子电器',
  clothing_adult: '成人服饰鞋袜', clothing_children: '儿童服饰鞋袜', clothing_other: '其他服饰配件', clothing_adult_tops: '成人上衣', clothing_adult_bottoms: '成人裤装或裙装', clothing_adult_dresses: '成人连衣裙', clothing_adult_outerwear: '成人外套或雨具', clothing_adult_underwear: '成人内衣', clothing_adult_socks: '成人袜子', clothing_adult_footwear: '成人鞋靴', clothing_adult_accessories: '成人服饰配件', clothing_children_tops: '儿童上衣', clothing_children_bottoms: '儿童裤装或裙装', clothing_children_outerwear: '儿童外套或雨具', clothing_children_underwear: '儿童内衣或睡衣', clothing_children_socks: '儿童袜子', clothing_children_footwear: '儿童鞋靴', clothing_children_accessories: '儿童服饰配件', clothing_mixed_offer: '服饰多品项任选',
  leisure_toys: '玩具或游戏', leisure_stationery: '文具用品', leisure_books: '图书或杂志', leisure_bicycles: '自行车或电助力自行车', leisure_bike_accessories: '骑行护具或配件', leisure_ride_on: '儿童电动骑乘玩具', leisure_outdoor_play: '户外游乐设施', leisure_sports: '运动或户外装备', leisure_camping: '露营或节庆户外用品', leisure_bags: '书包或背包', leisure_crafts_learning: '手工或学习用品', leisure_gaming: '电子游戏或软件', leisure_other: '其他休闲用品',
  tobacco_cigarettes: '烟草制品', tobacco_nicotine: '尼古丁产品', tobacco_other: '其他烟草相关商品', other_offer: '其他促销商品',
};

const ORIGINAL_NAME_FALLBACK_GROUPS = new Set([
  'drink_soda', 'drink_juice', 'drink_water', 'drink_energy', 'drink_sports', 'drink_mixed_offer', 'drink_concentrate', 'drink_other',
  'alcohol_beer', 'alcohol_wine', 'alcohol_wine_red', 'alcohol_wine_white', 'alcohol_wine_rose', 'alcohol_wine_sparkling', 'alcohol_wine_mixed_offer', 'alcohol_wine_other', 'alcohol_spirits', 'alcohol_cider_rtd', 'alcohol_mixed_offer', 'alcohol_other',
  'pet_cat', 'pet_dog', 'pet_other', 'flower_bouquet', 'plants',
  'home_appliances', 'home_cookware', 'home_storage', 'home_decor', 'home_other',
  'electronics_audio', 'electronics_computing', 'electronics_lighting', 'electronics_other',
  'clothing_adult', 'clothing_children', 'clothing_other', 'leisure_toys', 'leisure_stationery', 'leisure_books', 'leisure_other',
  'tobacco_cigarettes', 'tobacco_nicotine', 'tobacco_other', 'other_offer',
]);

const SPECIFIC_DESCRIPTIONS = [
  [/silvercrest elkedel.*smoothie maker/, '这是两种厨房电器任选：2200 W、1.7 L 的电热水壶用于烧水；300 W 随行搅拌机用于把水果、酸奶等打成 smoothie。两者功能完全不同，应按实际需要和包装中的杯具配件选择。'],
  [/depend neglefil.*kiss naturlige vipper/, '这是美甲锉或自然款假睫毛任选。美甲锉用于修整指甲边缘，假睫毛用于眼妆并需搭配适用胶水；购买时确认所选款式、是否含胶及一次性或可重复使用说明。'],
  [/murph proteinbar.*energi gel/, '这是 Murph 蛋白棒、麦片能量棒或运动能量胶任选。蛋白棒侧重便携补充蛋白质，麦片棒侧重碳水零食，能量胶适合长时间耐力运动中快速补充碳水；三者不是同一种营养品，应按包装查看每份蛋白质、糖和咖啡因。'],
  [/barebells proteinbar.*shake/, '这是 Barebells 蛋白棒或瓶装即饮蛋白奶昔任选。蛋白棒便于随身加餐，奶昔更容易饮用；两者都主要用于在日常饮食不足时方便补充蛋白质，应比较每份蛋白质、能量、糖和乳成分，不能保证增肌。'],
  [/nutramino wafer.*proteinbar|proteinbar.*nutramino wafer/, '这是普通蛋白棒或 Nutramino 高蛋白威化任选。威化口感更酥脆、通常更像甜点，蛋白棒质地可能更扎实；应比较每份蛋白质、糖和总能量，而不是把两种形态当作同一零食。'],
  [/murph proteinbar med kreatin/, '这是加入肌酸的 Murph 蛋白棒，兼作便携蛋白加餐和肌酸补充。它的便利性在于无需冲泡，但应核对每条实际蛋白质、肌酸、糖和能量；肌酸更适合力量或反复高强度训练并需按标签持续使用，不会自动带来增肌效果。'],
  [/^proteinbar$|kramer s proteinbar|barebells proteinbar/, '这是高蛋白零食棒，适合在正餐间或训练后作为便携加餐。选择时重点看每条蛋白质、糖、总能量和过敏原；“高蛋白”只是营养组成，不代表吃一条就会增肌或替代正常饮食。'],
  [/alesto proteinkugler/, '这是 ALESTO 小颗粒蛋白零食，适合随身作为加餐；它不是肌酸或乳清粉。实际蛋白质、糖、脂肪、坚果及乳成分需查看营养表，不能把“高蛋白”理解成保证增肌。'],
  [/protein lab protein snack/, '这是 Protein Lab 便携高蛋白零食，用于日常或训练后的方便加餐；具体是脆片、棒或其他形态以包装正面为准，并应比较每份蛋白质、能量和糖，而不是只看“protein”字样。'],
  [/^surdejspizza .*prosciutto.*diavola/, '这是酸种披萨成品，可选 Prosciutto 火腿口味或 Diavola 辣香肠口味；前者偏咸香，后者通常更辛辣。按包装用烤箱加热至饼底酥脆，它不是单独售卖的披萨饼底。'],
  [/kohberg smorbagt fastfoodbrod.*cafesandwich/, '这是以黄油烘焙的快餐面包或咖啡馆式三明治面包任选，可夹汉堡肉、鸡肉、奶酪和蔬菜。名称中的 smørbagt 表示黄油烘焙风味，商品主体是面包，不是黄油。'],
  [/^nye lammefjords kartofler/, '这是丹麦 Lammefjorden 地区的新土豆，表皮薄、口感细嫩，适合带皮水煮、拌黄油香草或作为鱼肉配菜；Lammefjords 是产地名，商品不是羊肉。'],
  [/anglamark.*kartofler.*brod/, '这是 Änglamark 有机土豆或有机面包的跨类别任选促销。土豆用于煮、烤或做配菜，面包可直接作早餐或三明治；应按卡片图片和包装选择实际商品，二者不能比较同一单位价。'],
  [/pepsi max.*faxe kondi.*booster energidrik/, '这是 Pepsi Max 无糖可乐、Faxe Kondi 柠檬青柠味汽水或 Booster 能量饮料任选。前两种是汽水；Booster 含咖啡因、用于提神，不适合儿童，孕妇及对咖啡因敏感者应谨慎。'],
  [/faxe kondi.*pepsi max.*vitamin well/, '这是三种不同饮料任选：Faxe Kondi 是清爽柠檬青柠味汽水，Pepsi Max 是无糖可乐，Vitamin Well 是添加维生素的果味水。购买时按想要的可乐味、柑橘汽水或较淡果味选择，并查看糖、甜味剂和咖啡因标示。'],
  [/barebells.*nupo/, '这是 Barebells 或 Nupo 的蛋白棒、One Meal 代餐或瓶装蛋白奶昔任选。蛋白棒便于加餐，奶昔便于直接饮用，代餐会更强调一餐的能量和营养组成；三者形态和用途不同，应比较蛋白质、糖、总能量和每份大小。'],
  [/italiensk charcuteri.*gestus pizzabunde/, '这是意式冷切肉或 Gestus 披萨饼底的跨类别任选。冷切肉可直接做三明治、冷盘或披萨配料；披萨饼底需要加酱料、奶酪和配菜后烘烤。两者不能当作同一种面包或肉制品比较。'],
  [/irma.*surdejspizzabund|premieur surdejspizzabund/, '这是已经成形的酸种披萨饼底，带发酵面香；铺番茄酱、奶酪和喜欢的配料后放入烤箱烘烤。它不是已经带馅料的成品披萨，也不是普通早餐切片面包。'],
  [/il fornaio.*pizzadej/, '这是有机披萨生面团，两份装；需要擀开或拉伸、加酱料和配菜后烘烤。它比现成披萨饼底多一步整形，也不是已经可以直接吃的面包。'],
  [/protein lab protein brod/, '这是 Protein Lab 高蛋白面包，可像普通切片面包一样做早餐吐司和三明治。优势是更方便从主食中补充蛋白质，但应核对每 100 克蛋白质、纤维、盐和总能量，不能把它等同于蛋白粉。'],
  [/gelatelli high protein isbaeger/, '这是 GELATELLI 杯装高蛋白冰淇淋，仍属于冷冻甜品，但配方会比普通冰淇淋更强调蛋白质。适合想吃甜品同时关注蛋白质的人；应比较每杯蛋白质、糖和总能量，“高蛋白”不代表可以无限量食用。'],
  [/trust gxt234 mikrofon/, '这是 Trust GXT234 带灯效的游戏或直播麦克风，用于语音聊天、直播和录音。促销文字未给出接口、指向性和是否含支架，购买时应以包装型号规格为准；它不是电脑主机。'],
  [/^elmarked$/, '这是门店“电器商品专区”任选活动，公开促销只说明有多种电器可选，没有列出具体型号，不能负责任地编造某一种功能。到店后应按实际商品标签比较用途、功率、尺寸和保修。'],
  [/breezer.*somersby.*schweppes.*red bull/, '这项促销跨越含酒精和不含酒精饮料：Breezer 是果味预调酒，Somersby 是果味苹果酒，Schweppes Tonic 是带奎宁苦味的汤力水，Red Bull 是含咖啡因能量饮料。购买时必须按包装区分，含酒精款仅供达到法定年龄者。'],
  [/neoprencover.*mobiloplader.*mus/, '这是三种电脑或手机配件任选：14 英寸氯丁橡胶电脑保护套用于防刮和轻微碰撞，无线手机充电器用于兼容设备充电，鼠标用于操作电脑。三者用途不同，应按设备尺寸、充电兼容性或连接方式选择。'],
  [/bodylab whey/, 'Bodylab 乳清蛋白粉，用水或牛奶冲调，用于在日常饮食蛋白质不足时补充蛋白质；乳清消化较快，适合训练后或作为加餐。具体蛋白质含量、口味和甜味剂以包装为准；优势应看每克蛋白价格，而不是把它当成会自动增肌的产品。'],
  [/optimum nutrition kreatin/, 'Optimum Nutrition 肌酸补充剂，多种包装或口味任选。肌酸适合进行力量、冲刺等反复高强度训练并愿意每日持续补充的人；重点核对是否为肌酸一水合物、每份剂量和添加成分，它不是即时提神剂。'],
  [/murph whey proteinpulver med kreatin/, 'Murph 乳清蛋白肌酸粉，香草或巧克力口味。乳清蛋白用于补充蛋白质，肌酸适合力量及反复高强度训练；两者合装较方便，但应核对每份各自含量，不能代替正常饮食。'],
  [/kramer s creatin pulver/, 'Kramer’s 肌酸粉，适合力量、冲刺或其他反复高强度训练人群按包装建议长期补充。选购时重点看是否为肌酸一水合物、每份克数和是否含调味或其他成分；它不会像咖啡因一样立即提神。'],
  [/harboe sodavand/, 'Harboe 多口味汽水促销，品牌系列通常包含可乐、橙味和柠檬青柠等常见口味；本期文字未列出全部瓶身口味，选购时按实际标签确认含糖或无糖款。'],
  [/state.*xoxo sodavand/, '可选 State、State Vitamin 或 XOXO 饮料。State 系列偏运动或维生素功能饮料，XOXO 为汽水；不同款的糖分、咖啡因和维生素配方不同，不能只当成一种普通汽水。'],
  [/^sodavand$/, '亚洲风味果味汽水，可选甜瓜、李子或 calamondin 四季橘/金桔风味。三种都带气泡和明显果香，适合想尝试不同于可乐、雪碧的水果汽水的人；冰镇饮用更清爽。'],
  [/jolly sodavand/, 'Jolly 多口味汽水，常见系列包含可乐、橙味或柠檬等款式；本期为多种口味任选，购买时按瓶身确认具体风味以及含糖或无糖版本。'],
  [/aarstiderne.*sodavand/, 'Aarstiderne 有机水果汽水，可选苹果蓝莓或苹果覆盆子口味。以苹果果香为基底，分别带蓝莓或覆盆子的酸甜莓果味，适合喜欢果味明显、不同于普通可乐的汽水。'],
  [/sol mar gazpacho/, 'SOL&MAR Gazpacho 是西班牙式冷番茄蔬菜汤，通常以番茄、黄瓜、甜椒、橄榄油和醋调味，冷藏后直接喝或盛碗食用；口感清爽微酸，不需要用烤箱或平底锅加热。'],
  [/protein lab protein sandwich/, 'Protein Lab 高蛋白高纤面包，商品原文说明面包含较高蛋白质并是膳食纤维来源。可像普通切片面包一样做三明治或早餐吐司；它不是已经夹好馅料的即食三明治，也不是必须微波加热的预制菜。'],
  [/protein cafe sandwich/, 'Protein Café 高蛋白三明治，四件装，适合作为便携早餐或加餐。具体夹馅、是否需冷藏及过敏原必须以包装为准；商品是三明治，不是泛称的“预制方便餐”。'],
  [/murph pwo.*kreatin/, 'Murph 运动补剂二选一：PWO 是训练前冲调粉，配方常含咖啡因等提神成分；另一款是肌酸粉，适合进行力量或高强度训练、希望长期按建议剂量补充肌酸的人。两类成分和用途不同，应看包装配料与每份剂量；对咖啡因敏感者尤其要核对 PWO 标签。'],
  [/murph whey med kreatin/, 'Murph 乳清蛋白粉加入肌酸，香草或可可口味。乳清蛋白用于补充日常蛋白质，肌酸适合力量及反复高强度训练；可用水或牛奶冲调，也可拌入燕麦。它把两种补充剂合在一袋，是否适合你取决于总蛋白摄入和每份肌酸剂量，不能代替正常饮食。'],
  [/baileys is.*triple chocolate/, '这是 Baileys 风味冰淇淋或 Triple Chocolate 三重巧克力冰淇淋任选，均为冷冻甜品。前者模仿 Baileys 奶油甜酒的奶香甜味，后者突出多层巧克力风味；商品不是一瓶烈酒，实际是否含酒精及过敏原以包装为准。'],
  [/targus computertaske/, 'Targus 15.6 英寸笔记本电脑包，用于装入并携带兼容尺寸的笔记本电脑及充电器等小配件。购买时主要核对电脑外形尺寸、包内隔层和肩带配置；它不是电脑或网络设备本体。'],
  [/targus 2 i 1 stylus pen/, 'Targus 二合一触控笔兼普通书写笔：触控端可在兼容电容触摸屏上点按、书写或绘图，另一端用于纸面书写。它是输入配件，不是电脑本体；精细压感、掌托防误触等能力不能从本期促销资料确认。'],
  [/acer sa242yh1bi/, 'Acer SA242YH1bi 23.8 英寸电脑显示器，Full HD 1080p、VA LCD 面板、100 Hz 刷新率、4 ms 响应时间并支持 VESA 壁挂。适合日常办公、网页和影音；它是外接显示器，不是笔记本电脑。'],
  [/acer nitro 34.*skaerm/, 'Acer Nitro 34 英寸曲面超宽电竞显示器，3440×1440 WQHD、21:9、1500R 曲率、120 Hz、1 ms VRB，并支持 FreeSync Premium 和 HDR10。适合想要宽视野与较流畅游戏画面的用户；这是显示器，不是电脑主机。'],
  [/acer predator 27.*skaerm/, 'Acer Predator 27 英寸电竞显示器，2560×1440 WQHD IPS 面板、200 Hz、0.5 ms GtG，并标注 HDR400。适合更看重高刷新率和动作清晰度的游戏用户；需另接电脑或游戏设备。'],
  [/acer pd3 series.*dobbelt skaerm/, 'Acer PD3 Series 15.6 英寸便携双屏显示器，Full HD IPS，可 315° 折叠，并通过 Mini HDMI 或 USB-C 连接电脑和手机。适合移动办公时扩展桌面；它是双屏外接显示器，不是笔记本电脑或充电器。'],
  [/acer pm1 series.*touch skaerm/, 'Acer PM1 Series 15.6 英寸便携触控显示器，Full HD IPS、10 点触控、60 Hz，可用 USB-C 单线连接兼容电脑、手机或平板。适合移动办公、演示和触控操作；它不是智能手机。'],
  [/borne gamerstol/, '儿童电竞椅，高约 95–102 厘米，PVC 皮面、PU 脚轮，最大承重 120 公斤，并带 USB 供电的 RGB 灯。灯光可外接电源或移动电源，但商品主体是供儿童在电脑桌前就坐的椅子，移动电源不随附。'],
  [/^daaselaag med sugeror$/, '这是可重复使用的易拉罐盖和吸管二件套，把盖子压在已开封的饮料罐上，可减少泼洒并挡住黄蜂等昆虫；材质为 ABS、PP 和硅胶，可放洗碗机清洗。'],
  [/^steamcleaner$/, '这是 Sjö 蒸汽清洁机，用约 100°C、4 bar 高压蒸汽清洁厨房、浴室、瓷砖缝、窗户和织物等表面；功率 1500 W，水箱 1450 ml，约 15 秒预热，并附 8 种刷头和刮具。'],
  [/ben s sauce.*dolmio|dolmio.*ben s sauce/, '这是 Ben’s 或 Dolmio 瓶装烹调酱任选，可加入煎熟的肉类、蔬菜、米饭或意面快速完成一餐；不同款可能偏意式番茄或其他风味。'],
  [/karolines kokken sauce/, '这是 Karolines Køkken 冷藏或常温烹调酱，通常以奶油为基底，可加热后搭配肉类、意面、土豆或蔬菜。'],
  [/odense marcipan dessert sauce/, '这是 Odense Marcipan 甜点淋酱，可淋在冰淇淋、蛋糕、水果、煎饼或其他甜点上；商品主体是甜酱，不是杏仁膏。'],
  [/k salat bearnaise|bearnaisesauce|sauce bearnaise/, '这是贝阿恩酱，带黄油、龙蒿和微酸风味，适合搭配牛排、猪排、薯条和烤蔬菜；可按包装冷食或加热。'],
  [/jensens.*sauce/, '这是 Jensens Køkken 佐餐酱，常见款可搭配牛排、猪排、汉堡、薯条或烤肉；按包装说明冷食或加热。'],
  [/vitasia asiatisk.*sauce/, '这是 VITASIA 亚洲风味烹调酱，可与肉类、豆腐、蔬菜和面条一起炒热，快速做成一份炒菜或拌面。'],
  [/vitasia sursod.*foraarsrullesauce/, '这是 VITASIA 糖醋酱或春卷蘸酱任选，前者可炒肉和蔬菜，后者适合蘸春卷、炸物和小吃。'],
  [/vitasia woksauce/, '这是 VITASIA 炒菜酱，倒入炒熟的肉类、豆腐、蔬菜或面条中翻炒即可调味；不同款的辣度和风味不同。'],
  [/middagsfrikadeller.*mini kodboller/, '这是丹麦煎肉饼或迷你肉丸任选，均为肉糜成型制品，可按包装直接复热，搭配土豆、意面、酱汁或三明治。'],
  [/^salsiccia$/, '这是意式 Salsiccia 生香肠，通常用猪肉、盐和香料制成，需彻底煎烤；可配意面、烩饭、披萨或烤蔬菜。'],
  [/vitasia slow cooked svineslag/, '这是 VITASIA 亚洲风味慢煮猪五花肉，肥瘦相间并已长时间熟制，复热后可配米饭、面条或蔬菜；商品主体是猪肉，不是葡萄酒。'],
  [/pantene eller kleenex/, '这是 Pantene 洗发水或护发素与 Kleenex 面巾纸的跨类别任选促销；一个用于清洁护理头发，另一个是擦拭用纸，不能当作同类商品理解。'],
  [/tulip pizzatopping/, '这是 Tulip 已切碎的熟制肉类披萨配料，撒在披萨、意面或焗饭上后加热食用；商品主体是加工肉，不是奶酪。'],
  [/ristet sesamolie/, '这是烘香芝麻油，香气浓、通常在炒菜出锅、凉拌、蘸料或汤面中少量增香；不是适合大量高温煎炸的普通食用油。'],
  [/koldpresset rapsolie/, '这是有机冷榨菜籽油，保留较明显的籽香，适合凉拌、调酱和中低温烹调；高温用途按瓶身耐温说明使用。'],
  [/super kraes kebab|^oksekebab$/, '这是调味 Kebab 烤肉条，平底锅充分加热后可夹皮塔饼、卷饼，或搭配薯条、米饭和沙拉。'],
  [/^grillpolse$/, '这是适合煎烤的香肠，可用烤架、平底锅或热水充分加热后夹热狗面包或配土豆；具体肉种见包装配料。'],
  [/santa maria indisk/, '这是 Santa Maria 印度风味烹调酱、香料或餐食配料任选，用于咖喱和印度风味菜肴；各选项的辣度和使用步骤不同。'],
  [/santa maria tex mex|coop tex mex|banderos/, '这是 Tex-Mex 墨西哥风味酱料或调味商品，可用于塔可、墨西哥卷、玉米片和蘸酱；促销可能包含不同辣度与用途的选项。'],
  [/dipmix/, '这是蘸酱调味粉，通常与酸奶油、Skyr 或其他基底拌匀后，搭配薯片、蔬菜条或烤肉食用。'],
  [/dippies fruit dips/, '这是给苹果、草莓、香蕉等水果蘸食的甜味蘸酱，可作零食或甜点搭配；商品主体是酱料，不是桃子或其他鲜果。'],
  [/miracle whip/, '这是 Miracle Whip 蛋黄酱式调味酱，口味比普通蛋黄酱更甜酸，可用于三明治、汉堡、土豆沙拉和凉拌菜。'],
  [/bahncke|gestus pebermix/, '这是佐餐调味酱，可搭配热狗、汉堡、薯条、烤肉或三明治；具体款式可能是芥末、番茄、胡椒或其他口味。'],
  [/meyers spreads eller ostetern/, '这是 Meyers 涂抹酱或奶酪丁任选；涂抹酱可配面包和蔬菜，奶酪丁可直接加入沙拉或冷盘。'],
  [/antonius marked|grillmarked|rema 1000 dansk grillkod/, '这是多款调味烧烤肉任选，可能包含不同肉种、部位、肉串或肉排；均需彻底加热，适合烤架、烤箱或平底锅。'],
  [/fredagstapas/, '这是熟食柜制作的周五 Tapas 拼盘，通常由多种冷切、奶酪或小食组合，可直接作为分享冷盘食用。'],
  [/italiensk antipasti|citterio italiensk charcuteri|parmaskinke eller antipasto misto/, '这是意式冷切肉或 Antipasti 拼盘，常含火腿、萨拉米等熟成肉，可直接配面包、奶酪、橄榄和沙拉食用。'],
  [/charcuteri med troffel/, '这是加入松露风味的熟成冷切肉，切片后可直接用于三明治、奶酪拼盘或 Tapas 冷盘。'],
  [/den gronne slagter/, '这是 Den Grønne Slagter 系列熟制肉品任选，可用于三明治、冷盘或简单加热后的热餐；不同包装可能是冷切片、肉丸或其他加工肉。'],
  [/gestus topping|steff houlberg topping/, '这是已切丁、切条或切片的熟制肉类配料，可撒在披萨、沙拉、三明治、意面或焗饭上再加热食用。'],
  [/^cevapcici$/, '这是巴尔干风味调味肉糜条，外形像无肠衣小香肠，需煎烤至熟，常配皮塔饼、洋葱、Ajvar 红椒酱和沙拉。'],
  [/vitasia chicken bites/, '这是 VITASIA 调味鸡肉块，属于需要按包装充分加热的亚洲风味方便肉食，可配米饭、面条或蘸酱。'],
  [/^sucuk/, '这是 Sucuk 土耳其辣味牛肉香肠，蒜香和香料味较重，可切片煎香后配鸡蛋、面包、披萨或炖菜。'],
  [/yakitori spyd/, '这是日式酱汁调味鸡肉串，需充分加热，可作烧烤小食并搭配米饭、沙拉或照烧汁。'],
  [/dansk grillkam/, '这是丹麦猪外脊部位的调味烧烤肉，肉质较瘦，可整块烤后切片，或按包装分切煎烤；需彻底熟制。'],
  [/bbq grillben/, '这是 BBQ 调味猪肋骨或肋排段，适合烤箱或烤架慢烤至软嫩；带骨且酱料含糖时需避免表面烤焦。'],
  [/krebinetter af fjerkrae/, '这是用禽肉肉糜压成的煎肉饼，需用平底锅、烤箱或空气炸锅彻底加热；可配土豆、蔬菜和酱汁。'],
  [/premieur pommes gigant/, '这是 Premieur 大号冷冻薯条，条形较粗，适合烤箱、空气炸锅或油炸加热至外脆内软。'],
  [/velsmag tykstegsbof af gris/, '这是猪后腿或外侧部位切成的调味猪肉排，可平底锅煎或烤架烧烤；属于生肉，需彻底加热。'],
  [/filet a la morbrad/, '这是用猪肉制成并调味的“里脊式”肉排，可煎、烤或切片配饭；它是加工成型肉，不等同于整条猪里脊。'],
  [/frilandsgris morbrad.*grillkoller/, '这是散养猪里脊或 BBQ 调味烧烤肉任选；猪里脊较瘦，烧烤肉通常已腌制，两者都需彻底加热。'],
  [/marineret tomahawk/, '这是 BBQ 腌制 Tomahawk 牛排，保留长肋骨并带肋眼肉，适合高温煎烤后静置切片；厚度较大时需控制中心熟度。'],
  [/grillfakler/, '这是把调味肉条缠绕成螺旋状的烧烤串，带 BBQ 香料，可用烤架、烤箱或平底锅充分加热。'],
  [/ekstra jomfruolie/, '这是特级初榨橄榄油，带橄榄果香，适合凉拌、蘸面包、做酱汁和中温烹调；不同款的产地和风味会不同。'],
  [/grillspyd med gris og grontsager/, '这是猪肉和蔬菜串成的烧烤串，适合烤架、烤箱或平底锅加热；商品主体是需要彻底熟制的调味猪肉串，不是单独蔬菜。'],
  [/salling eller michelle kristensen faerdigret i glas/, '这是玻璃罐装即食餐任选，每罐约 625 克；打开后按包装说明加热即可作为一餐，商品主体是预制菜，不是玻璃杯。'],
  [/vitasia foraarsruller.*samosa.*dessert i glas/, '这是亚洲风味春卷、咖喱角或杯装甜点任选；前两种是需要加热的咸味点心，杯装甜点可按包装直接食用，三者不是同一种商品。'],
  [/vitasia dessert i glas/, '这是 Vitasia 杯装亚洲风味甜点，按包装冷藏或常温保存并直接食用；商品主体是甜品，不是饮水玻璃杯。'],
  [/flerfarvet krysantemum i skaal/, '这是多色菊花盆栽组合，连同花盆售卖，株高约 23–29 厘米；适合阳台、门前或庭院摆放，需要按天气和盆土情况浇水。'],
  [/lillebror ostehaps.*flodehavarti/, '这是儿童奶酪条或丹麦奶油 Havarti 奶酪任选；奶酪条可直接作零食，Havarti 质地柔软、奶香较浓，适合切片夹面包。'],
  [/mammen skaereost.*danablu/, '这是丹麦切片用餐桌奶酪或 Danablu 蓝纹奶酪任选；前者口味较温和，后者咸香浓烈并带蓝纹霉菌，适合奶酪盘或酱汁。'],
  [/castello aged havarti.*gouda/, '这是熟成 Havarti 或 Gouda 奶酪任选，均可切片夹面包、配饼干或做奶酪拼盘；熟成时间和风味强度不同。'],
  [/castello kant.*glod.*ikon|^castello$/, '这是 Castello 系列餐桌奶酪任选，可能包含不同熟成度或霉菌类型；可配面包、饼干和水果作冷盘，风味从温和到浓郁不等。'],
  [/ostehaps|danbo|skaereost|skæreost|flodehavarti|havarti|dronning dagmar|fætter kras|tilsiter/, '这是可切片或单条食用的丹麦餐桌奶酪，常见类型包括 Danbo、Havarti、Samsø、Tilsiter 或儿童奶酪条；可夹黑麦面包、做三明治，也可直接作奶酪零食。'],
  [/flodeost|smoreost|smelteost|philadelphia|rygeost/, '这是质地柔软的涂抹奶酪，可直接抹面包、贝果和饼干，也可做三明治馅、蘸酱或烘焙配料；需冷藏保存。'],
  [/\bdressing\b|fastfood dressing/, '这是沙拉或快餐用调味酱，可淋在生菜沙拉、汉堡、薯条或烤肉上；不同款可能是奶油、油醋、蒜味或辣味。'],
  [/aubergine/, '这是新鲜茄子，果肉吸味、加热后柔软，适合红烧、鱼香做法、煎烤、咖喱或烤箱料理。'],
  [/grontsagsblanding|grontsager/, '这是蔬菜混合装或多款蔬菜任选，常用于快炒、炖菜、汤或配菜；促销通常覆盖不同配方和包装重量。'],
  [/danske radiser/, '这是带叶丹麦樱桃萝卜，口感清脆微辣，可生吃、拌沙拉、蘸酱，也可快速腌渍；叶子新鲜时也可炒食。'],
  [/magnum.*minecraft.*solero.*iskasse/, '这是 Magnum、Minecraft 联名冰品或 Solero 水果风味冰品的盒装任选促销，均为冷冻甜品；具体支数、口味和单支大小由所选包装标明。'],
  [/rose kyllingetopping/, '这是已切小块或切条的熟制鸡肉配料，可用于披萨、沙拉、三明治或方便餐；有多种调味款，不是未经处理的生鸡肉。'],
  [/rahbek indbagt fisk/, '这是冷冻裹面糊或裹皮鱼制品，通常用烤箱或空气炸锅加热至外层酥脆；商品主体是加工鱼排，不是生鲜鱼柳。'],
  [/amanda yellowfin tun/, '这是黄鳍金枪鱼罐头，开罐沥干后可拌沙拉、夹三明治或拌意面；属于熟制罐头，不是生鲜金枪鱼排。'],
  [/saeby makrel/, '这是 Sæby 鲭鱼罐头，鱼肉已经熟制并装罐，可直接配黑麦面包、沙拉或热饭食用；不是生鲜鲭鱼。'],
  [/protein kebab.*kyllinge.*oksekod/, '这是调味 Kebab 烤肉条任选，可选鸡牛混合肉或纯牛肉；通常用于平底锅加热后夹皮塔饼、卷饼或配沙拉，不是生鲜整块肉。'],
  [/xxl kyllingefilet/, '这是 2.5 kg 大包装冷冻鸡胸肉，肉质较瘦，可解冻后煎、烤、炒或做咖喱；必须彻底加热，不是熟食。'],
  [/xxl kyllingestrimler/, '这是 2.5 kg 大包装鸡肉条，已切成适合快炒、咖喱、卷饼或沙拉配料的形状；需按包装确认是否冷冻并彻底加热。'],
  [/coop kylling|rema 1000 dansk kylling/, '这是多款丹麦鸡肉任选促销，包装重量覆盖不同部位或切法；均为需要彻底加热的鸡肉，具体部位由所选包装正面标明。'],
  [/^kylling$/, '这是已经熟制并切成条、片或小块的鸡肉，可直接用于沙拉和三明治，也可短暂复热后加入卷饼、意面或热饭。'],
  [/grillet kyllingefilet i strimler/, '这是已经烤熟并切条的鸡胸肉，解冻或复热后可用于沙拉、卷饼、三明治和意面；不是生鲜鸡胸。'],
  [/hakket dansk kylling/, '这是丹麦鸡肉末，可做肉丸、肉饼、饺子馅或番茄肉酱；属于生肉末，烹调时需彻底加热。'],
  [/kyllinge polser.*kodpolse/, '这是鸡肉香肠或普通肉香肠任选，均为成型肉制品，可煎、烤或煮热后食用；具体肉种按所选包装区分。'],
  [/kyllinge brystfilet paalaeg/, '这是熟制鸡胸肉冷切片，可直接夹面包、卷饼或搭配沙拉；商品主体是冷切肉，不是生鲜鸡胸。'],
  [/stegte kyllingegrillspyd/, '这是已经煎烤熟制的鸡肉串，冷冻大包装共约 25 串/2 kg；充分复热后可作聚餐、烧烤或配饭。'],
  [/laarfilet med skind.*kylling/, '这是带皮丹麦鸡腿排，去除大骨后保留鸡皮，油脂和风味比鸡胸更足，适合煎烤或空气炸锅。'],
  [/underlaar.*kylling/, '这是丹麦鸡小腿，带骨带皮，适合烤箱、空气炸锅、炖煮或红烧；需彻底加热至中心熟透。'],
  [/brystfilet.*kylling/, '这是丹麦鸡胸肉，脂肪较少，可切片快炒、整块煎烤、做咖喱或沙拉；属于需要彻底加热的生鲜鸡肉。'],
  [/havblaa hel dorade/, '这是整条金头鲷，肉质细嫩、刺较集中，适合清蒸、烤箱烤或香煎；售卖单位按半公斤计价。'],
  [/sol mar hele sardiner/, '这是整条冷冻沙丁鱼，油脂较丰富，可解冻后煎、烤或油炸；不是沙丁鱼罐头。'],
  [/thorfisk torskefileter/, '这是鳕鱼柳，去除大骨后的白身鱼片，适合煎、烤、蒸或做鱼汤；仍需留意可能残留的小刺。'],
  [/glyngore tun i vand.*olie/, '这是水浸或油浸金枪鱼罐头任选，开罐沥干后可拌沙拉、夹三明治或做意面；油浸口感更润，水浸脂肪更低。'],
  [/lykkeberg sild|gestus sild/, '这是腌渍鲱鱼，有原味腌汁、咖喱或香料口味，可直接配黑麦面包、鸡蛋和洋葱食用；属于冷藏熟成鱼制品，不是需要煎烤的生鱼。'],
  [/amanda rogn.*glyngore tun/, '这是午餐鱼籽罐头或水浸/油浸金枪鱼罐头任选，可直接配黑麦面包、沙拉或三明治；鱼种和口感不同。'],
  [/rema 1000 dansk rodfiskfilet.*kullerloins.*rodspaettefileter/, '这是红鱼柳、黑线鳕鱼里脊或鲽鱼柳任选，都是白身鱼但鱼种、厚度和口感不同；可煎、烤或蒸，需留意残留小刺。'],
  [/rema 1000 rogn.*kippers.*yellowfin tun/, '这是鱼籽、烟熏鲱鱼或黄鳍金枪鱼罐头任选，均可作冷餐或三明治配料，但鱼种、烟熏味和浸泡液不同。'],
  [/glyngore eller bornholms fiskemarked/, '这是鱼类罐头多品项任选，包含鱼籽、鱼丸、鳕鱼肝、番茄酱鲭鱼和金枪鱼；均为开罐即食或可简单加热的熟制食品。'],
  [/fiske eller skaldyrsmarked|^fiskemarked$/, '这是多款冷冻鱼类或海鲜任选，选项可能包含不同鱼种、贝类或加工海鲜；烹调方法由具体包装决定，不应把它们当作同一种鱼比较。'],
  [/penalhus.*mobilholder.*drikkedunk/, '这是跨类别小商品任选，包含铅笔盒、钥匙扣烫印贴、黑板贴、粉笔笔、奖励计划表、手机支架、水瓶、笔记本和涂色活动书；各选项用途不同，不是一种统一商品。'],
  [/^o (?:20|24|28) cm\b/, '这是不锈钢煎锅，锅内为陶瓷不粘涂层，可使用金属厨具，耐烤箱高温并适用于含电磁炉在内的各类炉灶；当前促销按 20、24 或 28 cm 直径分别标价。'],
  [/lekaform/, '这是 Lekaform 营养补充剂任选，促销图片包含维生素 D、钙加维生素 D，以及含多种维生素和矿物质的片剂；不同配方不能互相替代，应按自身需要和包装剂量选择。'],
  [/la campagna udenlandske specialiteter/, '这是 La Campagna 冷切肉任选，图片包含萨拉米、Mortadella、熟火腿、风干火腿、鸭肉酱和迷你风干肠等；均可作三明治或冷盘，但肉种、熟制方式和包装重量不同。'],
  [/pakkemarked/, '这是多款烧烤肉任选，图片包含 BBQ 猪排、腌制羊后臀肉、猪肉烧烤条、腌制猪颈肉、猪肋排、牛猪混合肉串和汉堡肉饼；均需彻底加热，肉种和形态不同。'],
  [/lun lordag/, '这是熟食柜的烤猪肉片、丹麦肉饼、裹粉炸鱼柳或肝酱任选；它们的肉种、形态和食用方式不同，不是一种统一商品。'],
  [/f[oe]tex favoritter/, '这是 føtex 门店精选的多品类商品合集，当前促销图片同时列出烘焙面包和甜点、肉饼、切配水果、鲜花、熟食与果汁，各商品分别标价；不是一个可统一比较的单品。'],
  [/^(?:20.*alt urtekram|urtekram)$/, '这是 Urtekram 全品牌跨品类会员折扣，清单同时包含橄榄油、面粉、披萨酱、葡萄干、椰糖，以及沐浴露、面霜、洗手液和身体乳；具体折后价按所选商品计算。'],
  [/filet ala morbrad.*polser/, '这是调味猪里脊式肉排，或法兰克福、普斯塔等多种香肠任选。均属于调味肉制品，但形态和烹调时间不同，购买时按包装选择。'],
  [/koteletter.*grillsticks.*grillpolser/, '这是猪排、烧烤肉条或烧烤肠任选，肉块与香肠形态不同；均需按包装说明彻底加热，并按想做的菜选择。'],
  [/mutti.*tomater.*pizzasauce/, '这是 Mutti 番茄罐头或披萨酱任选。番茄罐头适合炖菜、汤和意面，披萨酱可直接涂饼底；用途不同。'],
  [/nektariner.*ferskner.*blommer.*abrikoser/, '这是油桃、桃子、李子或杏任选，均为带核水果，可直接吃或做甜点；品种、成熟度和包装重量需按实际商品确认。'],
  [/frikadeller.*fiskefilet.*kamsteg/, '这是 3 个丹麦肉饼、3 片裹粉鱼柳或 3 片烤猪肉三选一的熟食促销。三种商品的肉种和用途不同，购买时按柜台标签确认。'],
  [/morbrad.*kartoffel.*kyllingebryst.*flodekartof/, '这是两款需加热的组合餐任选：猪里脊配土豆塔，或马苏里拉鸡胸配奶油土豆。它不是单独出售的生鲜猪肉或鸡胸。'],
  [/burnt ends.*hakket oksekod/, '这是 BBQ 熟制牛肉块或生牛肉末任选。前者加热即可配饭或夹面包，后者需彻底煮熟，可做肉酱、肉丸或汉堡。'],
  [/shampoo.*balsam.*skifteunderlag/, '促销选项横跨洗发/护发用品与婴儿一次性换尿垫；购买时必须按包装原名确认具体商品，不应把换尿垫理解为洗护液。'],
  [/knorr.*pasta.*risretter.*hellmanns.*maille/, '这是 Knorr 方便意面或米饭、Hellmann’s 蛋黄酱、Maille 芥末酱等跨类别任选促销。主食和酱料用途不同，购买时按包装原名确认。'],
  [/naturli.*smorbar.*iskaffe.*havre.*mandel.*drik/, '这是 Naturli 植物抹酱、冰咖啡、燕麦饮或杏仁饮任选。抹酱用于面包和烹饪，饮品可直接喝；需按包装确认具体一种。'],
  [/vita d or.*solsikke.*rapsolie/, '这是葵花籽油或菜籽油二选一，均可用于日常炒菜和烘焙；具体高温用途与容量按瓶身说明确认。'],
  [/sol mar.*blaeksprutte.*chorizo/, '这是裹粉鱿鱼圈或 Chorizo 西班牙辣肠可乐饼任选，通常需烤箱、空气炸锅或油炸加热；海鲜和肉类口味不同。'],
  [/crosti.*basilikum.*hvidlog/, '罗勒蒜味 Crosti 烤面包脆片，可直接当零食，也可配汤、沙拉或蘸酱；商品主体是烤面包，不是新鲜罗勒。'],
  [/maelkesnitter/, '牛奶奶油夹心小蛋糕，属于冷藏甜点，可直接食用；名称虽含“牛奶”，商品主体不是饮用奶。'],
  [/pasteis de nata/, '葡式蛋挞，是酥皮包裹蛋奶馅的烘焙甜点；可直接吃或稍微复烤，类似中国常见葡式蛋挞，不是冰淇淋。'],
  [/4 burgerboller.*6 polsebrod/, '这是 4 个汉堡面包或 6 个热狗面包二选一的促销，可夹汉堡肉、香肠或其他馅料；商品主体是面包，不是香肠。'],
  [/kyllingepopcorn/, '爆米花鸡块，是一口大小的裹粉鸡肉块；这款配甜辣蘸酱，并由熟食柜热售。可直接食用或按门店说明复热，类似中国常见盐酥鸡块，不是玉米爆米花。'],
  [/morliny.*classic.*crispy hot wings/, 'Morliny 冷冻鸡翅，有原味和香辣脆皮两种。适合烤箱或空气炸锅充分加热；这是 2 kg 大包装鸡翅，不是普通未调味鸡肉块。'],
  [/kalkunoverlaar.*schnitzel.*bryst/, '这是火鸡大腿肉或火鸡胸肉薄片二选一的促销，两者部位、带骨比例和烹调时间不同，购买时可按做法选择。'],
  [/kalkunbrystfilet/, '火鸡胸肉，脂肪较少、肉块通常比鸡胸大，可切片快炒、煎烤或做咖喱；这是火鸡肉，不是鸡胸肉。'],
  [/kalkunschnitz|kalkunstrimler/, '火鸡胸肉薄片或肉条，适合快速煎炒、做咖喱或卷饼；商品主体是火鸡胸，不是鸡胸或火鸡腿。'],
  [/kalkununderlaar/, '火鸡小腿，通常带骨且个头比鸡小腿大，肉质紧实，适合慢烤、炖煮或红烧。'],
  [/hakket kalkun/, '火鸡肉末，脂肪通常较少，可做肉丸、汉堡肉饼、饺子馅或肉酱。'],
  [/paalaegschokolade/, '丹麦面包用薄片巧克力，通常把薄巧克力片直接铺在面包上吃；不是肉类冷切。'],
  [/frugtpaalaeg|grinebidder/, '压制水果条或水果片零食，可直接食用；丹麦语 frugtpålæg 虽含 pålæg，但这里不是肉类冷切。'],
  [/rejeost|skinkeost/, '虾味或火腿味涂抹奶酪，可抹面包、饼干或做三明治；商品主体是奶酪，不是虾或火腿冷切。'],
  [/smorcroissant/, '冷冻黄油可颂，需按包装用烤箱或空气炸锅加热；“smør”表示黄油风味，但商品主体是面包。'],
  [/smorrebrod/, '丹麦开放式三明治，在一片面包上放肉、鱼、蛋或沙拉等配料，通常作为午餐直接食用；名称中的 smørrebrød 不是黄油商品。'],
  [/forarsruller|spring rolls|miniruller/, '冷冻春卷或迷你春卷，通常用烤箱、空气炸锅或油炸加热；具体馅料和加热时间以包装为准。'],
  [/asia cubes/, '冷冻亚洲风味一口小食，需加热后食用；具体馅料需按包装图片确认，不是冰淇淋。'],
];

const LOW_PRIORITY_GROUP = /^(?:drink_|alcohol_|pet_|flower_|plants$|home_|electronics_|clothing_|leisure_|personal_|hair_body$|sun_care$|hygiene$|supplements$|supplement_sports_snack$|tobacco_|other_offer$)/;

const CLOTHING_TYPE_RULES = [
  [/regnjakke.*bukser/, ['雨衣或雨裤任选', '分别用于上身和下身的雨天防风防水']],
  [/strikcardigan.*bukser/, ['针织开衫或针织裤任选', '可选上衣或裤装，适合换季保暖']],
  [/(?:sweatshirt|sweatbluse|sweattroje).*bukser/, ['卫衣或运动裤任选', '可选休闲上衣或柔软运动裤']],
  [/(?:musselinbluse|ribbluse).*(?:leggings|bukser)/, ['上衣或裤装任选', '可选儿童上衣、紧身裤或长裤']],
  [/regnsaet/, ['雨衣雨裤套装', '用于雨天防风防水']],
  [/regnjakke/, ['雨衣外套', '用于雨天防风防水']],
  [/regnbukser/, ['防水雨裤', '用于雨天户外穿着']],
  [/skjortejakke/, ['衬衫式外套', '可作轻薄外套或叠穿']],
  [/sweatshirt|sweatbluse|hoodie|sweattroje/, ['卫衣', '适合日常休闲穿着']],
  [/strikcardigan|cardigan/, ['针织开衫', '适合叠穿和换季保暖']],
  [/\bstrik\b/, ['针织上衣', '适合换季或室内保暖']],
  [/t shirt/, ['T恤', '短袖上衣，适合日常穿着']],
  [/croptop/, ['短款背心', '下摆较短的无袖上衣，可作内搭或单穿']],
  [/stroptop/, ['细肩带背心', '带细肩带的贴身或夏季上衣']],
  [/tanktop|undertroje|herreundertroje/, ['背心', '贴身或单穿的无袖上衣']],
  [/skjorte/, ['衬衫', '有领上衣，可单穿或叠穿']],
  [/\bbluse\b/, ['上衣', '日常穿着的套头或长袖上衣']],
  [/smaekbukser/, ['背带裤', '带肩带的连体裤装']],
  [/joggingbukser|sweatbukser/, ['运动长裤', '柔软休闲裤装']],
  [/suitpants/, ['西装风长裤', '版型偏正式的长裤']],
  [/jeans/, ['牛仔裤', '丹宁面料长裤']],
  [/capribukser/, ['七分裤', '裤长约到小腿位置']],
  [/leggings|caprileggings/, ['紧身裤', '弹性贴身裤装']],
  [/denimshorts/, ['牛仔短裤', '丹宁面料短裤']],
  [/cykelshorts/, ['骑行短裤', '贴身弹性短裤']],
  [/badeshorts|badebukser/, ['泳裤', '游泳或海滩穿着']],
  [/\bshorts\b|sweatshorts/, ['短裤', '日常休闲短裤']],
  [/\bbukser\b/, ['长裤', '日常长裤']],
  [/nederdel/, ['半身裙', '裙装下装']],
  [/\bkjole\b/, ['连衣裙', '上下连为一体的裙装']],
  [/natdragt/, ['连体睡衣', '睡眠时穿着的连体衣']],
  [/\bbody\b/, ['婴幼儿连体衣', '包住上身并在裆部扣合，适合婴幼儿日常打底']],
  [/nattoj/, ['睡衣', '睡眠时穿着的衣物']],
  [/\bbh\b/, ['文胸', '女性胸部支撑内衣']],
  [/boxershorts/, ['平角内裤', '贴身平角内衣']],
  [/hipsters/, ['低腰平角内裤', '贴身短款内衣']],
  [/g streng/, ['丁字裤', '贴身内衣']],
  [/trusser/, ['内裤', '贴身下装内衣']],
  [/tights med ekstra benlaengde/, ['加长款连裤袜', '贴身弹性袜裤']],
  [/\btights\b/, ['贴身打底裤或平角内裤', '具体形态由原促销名和包装决定']],
  [/sneakerstromper|footies/, ['隐形短袜', '鞋口较低，适合运动鞋']],
  [/stromper/, ['袜子', '日常穿着的袜类']],
  [/gummistovler/, ['雨靴', '防水橡胶靴']],
  [/texstovler/, ['防水保暖靴', '适合湿冷天气']],
  [/lyssko/, ['带灯童鞋', '走动时可发光的儿童鞋']],
  [/sneakers|skechers/, ['运动休闲鞋', '适合日常行走']],
  [/sandaler/, ['凉鞋', '露脚或透气鞋款']],
  [/slippers|flip flops|clogs/, ['拖鞋', '居家、泳池或夏季穿着']],
  [/ballerina/, ['芭蕾平底鞋', '浅口平底鞋']],
  [/solbriller/, ['太阳镜', '遮挡强光和紫外线的眼镜']],
  [/kasket/, ['棒球帽', '带帽檐的休闲帽']],
  [/bollehat/, ['渔夫帽', '圆顶软檐帽']],
  [/straahat/, ['草帽', '夏季遮阳帽']],
  [/pandebaand/, ['发带或头带', '用于固定头发或装饰']],
  [/baeltetaske/, ['腰包', '系在腰间或斜挎的小包']],
  [/\bbaelte\b/, ['腰带', '用于固定裤腰或搭配造型']],
  [/torklaede/, ['围巾或方巾', '用于保暖或搭配']],
  [/halskaede/, ['项链', '颈部饰品']],
  [/oreringe/, ['耳环', '耳部饰品']],
  [/haarklemme|haarspaende|haarpynt/, ['发饰', '用于固定或装饰头发']],
];

const PERSONAL_TYPE_RULES = [
  [/blodtryksmaaler.*airstyler.*massageapparat/, ['血压计、吹风造型器或拔罐按摩器任选', '可按需要选择测量血压、吹干造型或热敷按摩的电器']],
  [/infrarodt? (?:ore)?termometer|termometer/, ['红外体温计', '通过红外感应测量体温；使用方式和测量部位以说明书为准']],
  [/menopause test/, ['更年期检测棒', '通过检测尿液中的 FSH 水平辅助判断是否进入更年期']],
  [/insektstik healer/, ['虫咬热敷止痒器', '对虫咬部位短时加热，帮助缓解瘙痒和刺痛']],
  [/eltandborste/, ['电动牙刷', '用电动刷头清洁牙齿；替换刷头需确认接口型号']],
  [/tandborstehoveder|ekstra borstehoveder/, ['电动牙刷替换刷头', '安装在兼容电动牙刷手柄上清洁牙齿']],
  [/tandpasta.*tandborst|tandborst.*tandpasta|mundpleje|tandpleje/, ['牙膏、牙刷或其他口腔护理用品任选', '促销包含用途或规格不同的口腔清洁用品']],
  [/tandpasta|^zendium\b|sensodyne/, ['牙膏', '配合牙刷清洁牙齿和口腔']],
  [/tandborster?|borntandborster/, ['手动牙刷', '用于日常刷牙；购买时可按刷毛软硬度和适用年龄选择']],
  [/mundskyl/, ['漱口水', '刷牙后用于漱口和辅助清洁口腔']],
  [/soft picks/, ['齿间清洁棒', '用于清洁牙刷不易触及的牙缝']],
  [/shampoo.*balsam|balsam.*shampoo|haarpleje|harpleje|h?rpleje/, ['洗发水、护发素或护发用品任选', '用于清洁、柔顺或护理头发']],
  [/torshampoo/, ['干洗发喷雾', '喷在发根吸附油脂，无需用水冲洗']],
  [/haarolie/, ['护发油', '涂在发中和发尾帮助柔顺并减少毛躁']],
  [/hair styling/, ['头发造型用品', '用于定型、增加蓬松度或整理发型']],
  [/shampoo.*(?:bad|shower)/, ['洗发沐浴二合一', '可用于清洗头发和身体']],
  [/\bshampoo\b|antiskael/, ['洗发水', '用于清洁头发和头皮']],
  [/\bbalsam\b/, ['护发素', '洗发后用于柔顺和护理头发']],
  [/haartorrer|hartorrer/, ['吹风机', '吹干头发并辅助造型']],
  [/glattejern/, ['直发器', '用加热夹板拉直头发并辅助造型']],
  [/bolgejern/, ['卷发波浪造型器', '用加热造型棒制作卷发或波浪发型']],
  [/airstyler|flexstyle|coconut serien|remington/, ['吹风造型器', '用于吹干、卷发、拉直或增加头发蓬松度']],
  [/haarklipper/, ['理发器', '用不同限位梳修剪头发长度']],
  [/skaegtrimmer.*ekstra skaer|trimmer.*ekstra skaer/, ['胡须修剪器或替换刀头任选', '可选择修剪胡须的电器或与指定型号兼容的替换刀头']],
  [/skaegtrimmer|oneblade|multitrimmer|3 i 1 trimmer/, ['胡须或多用途修剪器', '用于修整胡须、鼻毛、眉毛或身体毛发，具体用途以型号为准']],
  [/skraber|barberblad|comfortglide|hybrid 5 flex/, ['手动剃须刀或刀片', '用于剃除面部或身体毛发']],
  [/micellar water.*ansigtscreme|renseprodukter|cleansing wipes/, ['卸妆洁肤或面部护理用品任选', '用于卸妆、清洁面部或日常保湿']],
  [/micellar/, ['卸妆洁肤水', '用化妆棉擦拭面部，帮助卸妆和清洁']],
  [/ansigtscreme|dagcreme|collagen jelly cream|sorbet cream/, ['面霜', '涂在面部用于保湿和日常皮肤护理']],
  [/serum/, ['面部精华液', '洁面后涂在面部，进行保湿或针对性皮肤护理']],
  [/eye patch/, ['眼膜贴', '贴在眼周用于保湿和护理']],
  [/master patch/, ['痘痘贴', '覆盖在痘痘表面，保护局部皮肤']],
  [/maskansigt|real deep mask|ansigtsmaske/, ['面膜', '敷在面部进行保湿或针对性皮肤护理']],
  [/hudpleje|ansigts eller kropspleje/, ['面部或身体护肤用品任选', '用于保湿、清洁或护理面部和身体皮肤']],
  [/hand treatment|laebepomade/, ['护手霜或润唇膏任选', '用于滋润手部或唇部皮肤']],
  [/kropspleje|body creme|shower cream|body wash|haandsaebe|palmolive/, ['沐浴、洗手或身体护理用品任选', '用于清洁或滋润身体和双手']],
  [/deodorant.*(?:shower|haandsaebe|haarpleje)|(?:shower|haandsaebe|haarpleje).*deodorant/, ['止汗剂、沐浴或洗护用品任选', '促销包含用途不同的个人清洁护理用品']],
  [/deodorant|deo roll on|\bdeo\b/, ['止汗除味剂', '涂抹或喷在腋下等部位，帮助减少汗味']],
  [/mascara/, ['睫毛膏', '涂在睫毛上，使睫毛颜色更明显并帮助定型']],
  [/brow lift/, ['眉部定型胶或妆前乳任选', '用于整理眉毛或在上妆前打底']],
  [/cheek paint/, ['腮红', '涂在面颊增加色彩']],
  [/makeupspejl/, ['带灯化妆镜', '用镜面和补光灯辅助化妆或面部护理']],
  [/vatrondeller.*vatpinde/, ['化妆棉或棉签任选', '用于卸妆、清洁或局部涂抹护理用品']],
  [/vatrondeller/, ['化妆棉', '配合卸妆水、爽肤水等擦拭皮肤']],
  [/vatpinde/, ['棉签', '用于局部清洁或涂抹护理用品；不要深入耳道']],
  [/orepropper/, ['隔音耳塞', '塞在外耳道入口处降低环境噪声']],
  [/brysttape/, ['胸部固定贴', '贴在皮肤上固定和支撑胸部，穿露背或低领服装时使用']],
  [/solcreme.*aftersun|solpleje/, ['防晒霜或晒后护理用品任选', '外出前涂防晒产品，晒后护理产品用于舒缓和保湿']],
  [/aftersun/, ['晒后舒缓乳', '日晒后涂在皮肤上帮助舒缓和保湿']],
  [/solcreme/, ['防晒霜', '日晒前涂在暴露皮肤上，并按包装提示补涂']],
  [/whey.*kreatin/, ['乳清蛋白粉加肌酸', '冲调饮用，用于补充蛋白质和肌酸']],
  [/whey|proteinpulver/, ['乳清蛋白粉', '加水或牛奶冲调，用于补充蛋白质']],
  [/kreatin|creatin/, ['肌酸粉', '冲调食用的运动营养补充剂']],
  [/kollagen|collagen/, ['胶原蛋白粉', '冲调食用的胶原蛋白补充剂']],
  [/maelkesyrebakterier|lacto seven|vita biosa/, ['益生菌补充剂', '用于补充乳酸菌等微生物成分']],
  [/lactrase/, ['乳糖酶片', '食用含乳糖食品时补充乳糖酶']],
  [/elektrolytter/, ['电解质补充剂', '冲调饮用，用于补充电解质']],
  [/basic gummies|yummylab brus/, ['维生素软糖或泡腾片', '按包装标明的每日用量补充维生素或矿物质']],
  [/4her|nordbo menopause|rodklovertabletter/, ['女性营养补充剂', '用于补充包装标明的营养成分；适用人群和用量以包装为准']],
  [/aktivt kul/, ['活性炭片', '口服活性炭补充剂；用量及与药物同服的注意事项以包装为准']],
  [/perikon draaber/, ['贯叶连翘滴剂', '含贯叶连翘成分的口服滴剂；用量和药物相互作用以包装为准']],
  [/protein lab marked/, ['运动营养食品或饮料任选', '促销包含蛋白类食品、饮料或其他运动营养商品']],
  [/b vitamin/, ['维生素 B 补充剂', '用于补充 B 族维生素']],
  [/c vitamin/, ['维生素 C 补充剂', '用于补充维生素 C']],
  [/d3 vitamin/, ['维生素 D3 补充剂', '用于补充维生素 D3']],
  [/folsyre/, ['叶酸补充剂', '用于补充叶酸']],
  [/magnesium/, ['镁补充剂', '用于补充镁元素']],
  [/vitaminer|mineraler|livol|multi tabs|multiplus|longo vital|futura|lekaform/, ['维生素或矿物质补充剂', '用于补充包装标明的维生素和矿物质']],
  [/bind|tampax|trusseindlaeg|tena|libresse|always/, ['卫生巾、棉条或失禁护理用品任选', '按经期或失禁护理需要选择具体类型、吸收量和规格']],
];

const GENERAL_TYPE_RULES = [
  [/targus computertaske|computertaske/, ['笔记本电脑包', '装入并携带兼容尺寸的笔记本电脑和小配件']],
  [/targus 2 i 1 stylus pen|stylus pen/, ['二合一触控笔', '在兼容触摸屏上点按书写，并可用于纸面书写']],
  [/click in case/, ['平板电脑保护壳', '保护兼容型号的平板并提供支撑']],
  [/hyperdrive.*hub|usb c .*hub/, ['USB-C 多功能扩展坞', '给电脑增加显示、USB 或存储卡等接口']],
  [/graestrimmer/, ['电动割草修边机', '用于修剪草坪边缘和割草机不易到达的位置']],
  [/robotstovsuger/, ['扫拖或扫地机器人', '自动在地面吸尘；部分型号还能湿拖或自动集尘']],
  [/ledningsfri stovsuger.*gulvvasker|gulvvasker/, ['洗地机', '吸走污水并清洗硬质地面']],
  [/stovsuger med pose|bosch stovsuger|miele stovsuger|nilfisk stovsuger/, ['有尘袋吸尘器', '用可更换尘袋收集地面灰尘']],
  [/poselos stovsuger|hoover/, ['无尘袋吸尘器', '把灰尘收集到可清空的集尘盒']],
  [/batteridreven cyklonstovsuger|ledningsfri stovsuger|cyklonstovsuger/, ['无线手持吸尘器', '用充电电池吸除地面和家具灰尘']],
  [/\bstovsuger\b/, ['吸尘器', '吸除地板、地毯或家具表面的灰尘']],
  [/damprenser|steamcleaner/, ['蒸汽清洁机', '用高温蒸汽清洁瓷砖、缝隙、玻璃或织物表面']],
  [/dampmoppe/, ['蒸汽拖把', '用蒸汽和拖布清洁硬质地面']],
  [/steamer med sugefunktion/, ['蒸汽清洁吸洗机', '一边喷蒸汽一边吸走污物和水分']],
  [/luftblaeser.*varm.*kold/, ['冷热风扇', '夏季送凉风、冬季作为暖风机使用']],
  [/luftkoler/, ['蒸发式冷风机', '通过水箱和冷却元件送出较凉空气']],
  [/ventilator/, ['电风扇', '促进室内空气流动并送风']],
  [/affugter/, ['除湿机', '从空气中凝结并收集水分，降低室内湿度']],
  [/purifier|luftrenser/, ['空气净化器', '过滤室内空气中的颗粒物并循环送风']],
  [/kole fryseskab|koleskab.*fryse|køle fryseskab/, ['冷藏冷冻组合冰箱', '上部或独立区域冷藏，另一区域冷冻食品']],
  [/fryseskab/, ['立式冷冻柜', '低温冷冻并储存食品']],
  [/koleskab/, ['冰箱', '冷藏食品和饮料']],
  [/vinkoleskab/, ['恒温酒柜', '按设定温度存放葡萄酒']],
  [/torretumbler/, ['滚筒式烘干机', '把洗后的衣物滚筒烘干']],
  [/vaskemaskine/, ['滚筒洗衣机', '自动清洗和脱水衣物']],
  [/mikroovn|mikrobolgeovn/, ['微波炉', '快速加热、解冻或烹调食物']],
  [/pizzaovn/, ['披萨烤炉', '以高温烘烤披萨饼底和配料']],
  [/\bovn\b/, ['烤箱', '烘烤、焙烤或加热食物']],
  [/gasgrill/, ['燃气烧烤炉', '使用燃气在户外烧烤肉类和蔬菜']],
  [/airfryer/, ['空气炸锅', '用循环热风烤制食物，适合薯条、鸡块和烤蔬菜']],
  [/sandwichtoaster/, ['三明治压烤机', '夹热并压烤三明治；带替换烤盘的型号也可煎烤']],
  [/toastmaskine.*vaffeljern.*brodrister/, ['三明治机、华夫饼机或烤面包机任选', '分别用于压烤三明治、烤华夫饼或烘烤面包片']],
  [/toastmaskine.*vaffeljern/, ['三明治机或华夫饼机', '用于压烤三明治或烤制华夫饼']],
  [/toastmaskine|brodrister/, ['烤面包机', '把切片面包烘烤至表面酥脆']],
  [/elkedel/, ['电热水壶', '快速烧开饮用水']],
  [/kaffemaskine/, ['滴滤咖啡机', '用咖啡粉冲煮滤泡咖啡']],
  [/espressomaskine/, ['全自动咖啡机', '研磨咖啡豆并制作意式浓缩或奶咖']],
  [/kokkenmaskine/, ['厨师机', '用搅拌、打发或揉面配件处理烘焙原料']],
  [/stavblender/, ['手持搅拌棒套装', '在杯或锅中搅打浓汤、酱料和果昔']],
  [/glas blender|\bblender\b|smoothie maker/, ['台式搅拌机', '用高速刀头搅打果昔、汤汁或碎冰']],
  [/multihakker|minihakker|elektrisk hakker/, ['电动切碎机', '快速切碎蔬菜、坚果、香草或少量肉类']],
  [/multiskaerer/, ['电动切片切丝机', '把蔬果切片、切丝或刨碎']],
  [/kodhakker/, ['电动绞肉机', '把肉类绞碎；部分型号带灌肠或制丸配件']],
  [/juicepresser/, ['榨汁机', '压榨水果或蔬菜制作果汁']],
  [/riskoger/, ['迷你电饭煲', '自动煮饭并保温']],
  [/frituregryde/, ['电炸锅', '在控温热油中炸制薯条或其他食物']],
  [/kontaktgrill/, ['双面接触式烤炉', '上下烤盘同时加热三明治、肉类或蔬菜']],
  [/dobbelt kogeplade|kogeplade/, ['电炉盘', '提供一个或多个电加热灶面用于烹调']],
  [/vakuumpakker/, ['真空封口机', '抽出包装袋空气并热封，延长食材保存时间']],
  [/plastruller til vakuumpakker/, ['真空封口袋卷', '裁剪后配合真空封口机包装食材']],
  [/slush ice.*soft ice maker/, ['冰沙和软冰淇淋机', '制作冰沙、软冰淇淋或其他冷冻甜品']],
  [/ismaskine/, ['冰淇淋机', '搅拌并冷冻原料制作冰淇淋或雪葩']],
  [/varmtvandsdispenser/, ['即热饮水机', '按需快速输出热水']],
  [/dampstrygejern/, ['蒸汽熨斗', '用加热底板和蒸汽熨平衣物褶皱']],
  [/digital kokkenvaegt|kokkenvaegt/, ['电子厨房秤', '称量烹饪和烘焙食材']],
  [/brita.*vandfilter|vandfilter kande/, ['滤水壶', '通过可更换滤芯过滤自来水']],
  [/vandfilterpatroner/, ['净水壶替换滤芯', '安装到兼容滤水壶中用于过滤自来水']],
  [/cocktail shaker/, ['鸡尾酒摇壶', '加入冰块和饮料后摇匀鸡尾酒']],
  [/wok/, ['炒锅', '圆弧深锅，适合中式快炒和翻炒']],
  [/kasserolle|maelkegryde/, ['单柄小奶锅', '适合煮酱汁、牛奶或少量食物']],
  [/grydesaet|gryde st/, ['锅具套装', '包含多个汤锅或奶锅，用于煮、炖和焯烫']],
  [/\bgryde\b/, ['汤锅', '用于煮汤、炖菜、煮面或焯烫']],
  [/pandesaet/, ['煎锅套装', '包含不同尺寸煎锅，用于煎炒食物']],
  [/serveringspande/, ['带柄深煎锅', '可煎炒、焖煮并直接上桌']],
  [/stegepande|\bpande\b/, ['煎锅', '用于煎蛋、煎肉或炒菜']],
  [/santoku kniv/, ['日式三德刀', '用于切肉、切菜和切片']],
  [/knivblok/, ['厨房刀具收纳座', '集中收纳多把厨房刀具']],
  [/\bkniv\b/, ['厨房刀', '用于切片、切丁或处理食材']],
  [/y skraeller/, ['Y形削皮器', '削去土豆、胡萝卜等蔬果外皮']],
  [/skaerebraet/, ['砧板', '垫在食材下方用于切配']],
  [/dorslag/, ['滤水篮', '沥干意面、蔬菜或洗净食材的水分']],
  [/saet med sier|\bsier\b/, ['滤筛套装', '过滤液体、筛粉或沥干小颗粒食材']],
  [/ovnfast fad|stegegryde/, ['烤箱用烤盘或烤皿', '盛装食材后放入烤箱烘烤']],
  [/grillbakke/, ['烧烤托盘', '放在烤架上承托较小食材并减少掉落']],
  [/grillbriketter/, ['烧烤炭块', '在炭火烧烤炉中作为燃料']],
  [/forklaede/, ['厨房围裙', '烹饪时保护衣物免受油水污渍']],
  [/kokkenredskab|kokkenartikler|kokkentilbehor/, ['厨房工具', '用于翻炒、夹取、盛取或处理食材']],
  [/madkasse.*drikkedunk|drikkedunk.*madkasse/, ['饭盒或水瓶', '用于携带午餐、零食或饮水']],
  [/snackboks|minibokse/, ['小号食物收纳盒', '分装零食、配料或少量食物']],
  [/madkasse/, ['饭盒', '分格或密封携带午餐和零食']],
  [/drikkedunk|drikkeflaske|vanddunk/, ['便携水瓶', '盛装并携带冷饮或饮用水']],
  [/skoreol|skoskab/, ['鞋架或鞋柜', '在玄关或衣帽区收纳鞋子']],
  [/vasketojskurv/, ['脏衣篮', '集中收纳待洗衣物']],
  [/indkobskurv/, ['购物篮', '在购物或搬运小件物品时手提使用']],
  [/foldekasser?/, ['折叠收纳箱', '展开后装物，空置时可折叠节省空间']],
  [/glasbeholder med hane/, ['带龙头饮料罐', '盛装冷饮并通过底部龙头取用']],
  [/kulsyremaskine/, ['家用气泡水机', '向饮用水注入二氧化碳制作气泡水']],
  [/bestikbakke/, ['餐具抽屉分隔盒', '放在抽屉内分类收纳刀、叉和勺']],
  [/termoflaske/, ['保温瓶', '真空保温结构可盛装冷热饮']],
  [/termokrus|termokop/, ['保温杯', '带盖携带并保温咖啡、茶或冷饮']],
  [/shotsglas/, ['烈酒小杯', '小容量杯具，用于盛装烈酒或小份饮品']],
  [/papkrus/, ['一次性纸杯', '聚会时盛装冷饮或温热饮品']],
  [/paptallerken/, ['一次性纸盘', '聚会或野餐时盛放食物']],
  [/skaalesaet|glasskaale|skaale med laag/, ['碗具套装', '盛装、搅拌或密封保存食物']],
  [/stege.*af glas/, ['玻璃烤皿', '耐热玻璃容器，可在烤箱中烘烤食物']],
  [/\bglas\b/, ['饮水杯', '盛装水、果汁或其他饮料']],
  [/borneservice/, ['儿童餐具套装', '供儿童吃饭使用的杯、碗、盘或餐具组合']],
  [/flergangsservice/, ['可重复使用餐具', '野餐或聚会后可清洗再次使用']],
  [/loungesaet/, ['户外休闲桌椅套装', '包含沙发、椅子和桌子，用于庭院休闲']],
  [/loungesofa/, ['户外休闲沙发', '供多人在庭院或露台就坐']],
  [/halvhoj seng/, ['儿童半高床', '床面抬高并配梯子，下方可留作游戏或收纳空间']],
  [/natbord/, ['床头柜', '放在床边收纳或摆放灯具和随身物品']],
  [/sofabord|sidebord|cafebord/, ['茶几或边桌', '放在沙发、座椅或阳台旁摆放小物']],
  [/skammel/, ['矮凳', '无靠背矮座，也可临时搁脚']],
  [/\bpuf\b/, ['软包脚凳', '可坐、搁脚或作为小型软装家具']],
  [/soundbar/, ['回音壁音箱', '连接电视后增强对白、音乐和电影声效']],
  [/party hojttaler|sound tower/, ['派对音箱', '大功率便携音箱，适合聚会播放音乐']],
  [/bluetooth.*hojttaler|tradlos.*hojtaler|tradlos.*hojttaler/, ['蓝牙音箱', '通过蓝牙播放手机或电脑中的音频']],
  [/in ear|earbuds|airpods/, ['入耳式耳机', '塞入耳道使用的便携耳机']],
  [/over ear|on ear|hovedtelefon|horetelefon/, ['头戴式耳机', '佩戴在耳部或包耳使用']],
  [/gaming headset|pc headset|\bheadset\b/, ['游戏耳麦', '带麦克风的耳机，适合游戏和语音']],
  [/clock radio/, ['收音机闹钟', '兼具 FM 收音、时钟和闹铃功能']],
  [/dab.*radio|\bradio\b/, ['收音机', '接收 DAB+ 或 FM 广播']],
  [/pladespiller/, ['黑胶唱片机', '用于播放黑胶唱片']],
  [/cd afspiller/, ['CD 播放机', '用于播放 CD 和兼容音频源']],
  [/smart tv|qled|oled|\btv\b/, ['电视', '用于观看电视、流媒体和外接视频']],
  [/projektor/, ['投影仪', '把视频画面投射到墙面或幕布']],
  [/dvd afspiller/, ['DVD 播放机', '用于播放 DVD 光盘']],
  [/streaming box|google tv stick/, ['电视流媒体播放器', '通过 HDMI 给电视增加流媒体与智能电视功能']],
  [/tv vaegbeslag/, ['电视壁挂架', '把指定尺寸和承重范围的电视固定到墙面']],
  [/ipad|android tablet|\btablet\b/, ['平板电脑', '触控屏移动设备，适合影音、学习和轻办公']],
  [/iphone|smartphone|galaxy a|redmi|zte blade|doro aurora|doro leva|realme/, ['智能手机', '用于通话、上网、拍照和安装应用']],
  [/apple watch|smartwatch|garmin|galaxy fit/, ['智能手表', '记录运动与健康数据，并显示手机通知']],
  [/gaming skaerm|pc skaerm|baerbar skaerm|touch skaerm|dobbelt skaerm/, ['电脑显示器', '为电脑或兼容设备提供外接显示画面']],
  [/stationaer pc|aio computer/, ['台式电脑', '桌面电脑，适合固定场所办公或娱乐']],
  [/chromebook|macbook|baerbar.*pc|\bpc\b/, ['笔记本电脑', '便携式电脑，适合学习、办公或游戏']],
  [/harddisk/, ['外置硬盘', '用于备份和扩展电脑存储空间']],
  [/microsd|flashdrive|flash drive/, ['存储卡或U盘', '用于扩展存储或传输文件']],
  [/printer|laserjet|deskjet|smart tank/, ['打印一体机', '用于打印；部分型号还可扫描和复印']],
  [/instax.*kamera/, ['拍立得相机', '拍摄后直接输出实体照片']],
  [/overvagningskamera|smart kamera/, ['监控摄像头', '用于查看和记录室内外画面']],
  [/digital.*fotoramme|frameo/, ['数码相框', '通过屏幕循环显示数码照片']],
  [/gaming mus|tradlos mus|\bmus\b/, ['电脑鼠标', '用于操作电脑光标']],
  [/gaming keyboard|\bkeyboard\b|tastatur/, ['电脑键盘', '用于电脑文字输入和快捷操作']],
  [/controller/, ['游戏手柄', '用于兼容游戏平台的操控']],
  [/nintendo switch|ps5|playstation/, ['游戏主机或游戏', '用于对应游戏平台']],
  [/router|mesh|wifi extender|wi fi extender|mobil wifi/, ['无线路由或网络扩展设备', '用于建立或扩大 Wi‑Fi 网络']],
  [/powerbank/, ['移动电源', '给手机等 USB 设备临时充电']],
  [/biloplader/, ['车载充电器', '从汽车电源接口给 USB 设备充电']],
  [/tradlos oplader/, ['无线充电器', '给兼容 Qi 无线充电的设备充电']],
  [/oplader|stromforsyning/, ['电源适配器', '给兼容设备供电或充电']],
  [/ladekabel|usb.*kabel|\bkabel\b/, ['充电或数据线', '连接并给兼容设备充电或传输数据']],
  [/ladestander|lader til elbil|11kw lader/, ['电动汽车充电设备', '通过 Type 2 等接口给兼容电动车充电']],
  [/led.*paere/, ['LED 灯泡', '用于室内照明']],
  [/led.*bordlampe/, ['LED 台灯', '用于桌面阅读或局部照明']],
  [/led.*standerlampe/, ['LED 落地灯', '用于房间局部或氛围照明']],
  [/infrarodt termometer/, ['红外额温计', '非接触测量体温，当前型号量程为 35–42°C']],
  [/armbaandsur/, ['儿童教学腕表', '表盘用不同指针帮助儿童学习辨认小时和分钟']],
  [/mobilholder/, ['车载手机支架', '安装在汽车出风口，用于固定手机导航']],
  [/^batterier\b/, ['电池', '为兼容设备供电，需按 AA、AAA 或 CR2032 等型号选择']],
  [/symaskine/, ['机械缝纫机', '用于直线、包缝等家庭缝纫']],
  [/fodmassageapparat/, ['足部按摩器', '通过按摩程序放松足部']],
  [/raclettegrill/, ['Raclette 奶酪烧烤炉', '可在上层煎烤食材、下层小盘融化奶酪']],
  [/koleboks/, ['电动冷藏箱', '接电后为饮料和食物保冷']],
  [/plaeneklipper/, ['汽油割草机', '用于修剪草坪']],
  [/haekkeklipper/, ['电动绿篱机', '用于修剪树篱和较细枝条']],
  [/brusesaet/, ['淋浴花洒套装', '包含顶喷、手持花洒和相关杆件或龙头']],
  [/gamerbord/, ['电竞桌', '为显示器、键鼠和游戏配件提供桌面空间']],
  [/gamerstol/, ['电竞椅', '带靠背和可调部件的电脑椅']],
  [/foldebord/, ['折叠桌', '可折叠收纳的临时餐桌或活动桌']],
  [/havestol|loungestol|spisebordsstol|barstol|foldestol/, ['椅子', '供就坐使用的餐椅、花园椅或休闲椅']],
  [/loungebord|spisebord|havebord|bord baenke saet/, ['桌子或桌椅组合', '用于用餐、庭院休闲或儿童户外活动']],
  [/boxmadrasseng|boxmadras|\bmadras\b/, ['床垫或箱式床', '用于睡眠承托，需按床面尺寸选择']],
  [/hyndeboks/, ['户外坐垫收纳箱', '用于存放花园坐垫和其他户外物品']],
  [/madkasse.*drikkeflaske|drikkeflaske.*madkasse/, ['饭盒或水瓶', '用于携带午餐、零食或饮水']],
  [/opbevaringsbotter|opbevaringsbokse|opbevaring/, ['收纳盒', '用于分装和整理食品或家居小物']],
  [/vandfilterpatroner/, ['净水壶滤芯', '替换兼容净水壶中的过滤芯']],
  [/slibesten/, ['双面磨刀石', '用于磨利刀具和剪刀']],
  [/multifunktionssaet.*aluminium/, ['铝制多功能锅具套装', '可煮、煎、炖、炸或蒸']],
  [/bordskaner|bordskaaner/, ['隔热锅垫', '放在热锅与桌面之间隔热防烫']],
  [/haandklaede|viskestykke/, ['毛巾或厨房擦布', '用于擦干身体、双手或厨房器具']],
  [/filtpuder/, ['家具防刮毛毡垫', '粘在桌椅脚或小家具底部，减少划伤地板和移动噪音']],
  [/termodyne|silkedyne|silkesommerdyne|naturfyldspude|dyne|pude/, ['被子或枕芯', '用于睡眠保暖或头颈承托']],
  [/rullemadras/, ['床垫保护垫', '铺在床垫上增加舒适度并保护床垫']],
  [/siddehynde|bokshynde|havehynder|\bhynde\b/, ['坐垫', '放在椅子、长凳或地面上增加舒适度']],
  [/picnictaeppe/, ['防潮野餐垫', '铺在草地或沙滩上坐卧，背面可防潮']],
  [/strandmaatte.*ryglaen/, ['带靠背折叠沙滩垫', '展开后铺在沙滩、草地或公园，并用内置靠背支撑坐姿']],
  [/fleeceplaid|rejsetaeppe|vattaeppe|varmetaeppe|\btaeppe\b/, ['毯子', '用于保暖、旅行或铺垫']],
  [/dormaatte/, ['门垫', '放在门口刮除鞋底灰尘和水分']],
  [/skuffemaatte/, ['抽屉或橱柜防滑垫', '铺在抽屉、橱柜或冰箱隔层防滑防污']],
  [/strygebraetbetraek/, ['熨衣板罩', '套在兼容尺寸的熨衣板表面']],
  [/torrestativ/, ['晾衣架', '展开后晾晒衣物，可折叠收纳']],
  [/kokkentekstiler|karklude/, ['厨房布艺用品', '用于隔热、擦拭或餐桌布置']],
  [/sengesaet|sengetoj/, ['床品套装', '用于被子和枕头的外罩']],
  [/damaskdug|\bdug\b/, ['桌布', '铺在餐桌上防污并装饰']],
  [/glasvase/, ['玻璃花瓶', '用于插放鲜花或作家居装饰']],
  [/\brammer\b/, ['相框', '用于装裱照片、海报或画作']],
  [/blomsterkrukke|plantekrukke/, ['花盆', '用于种植或套放盆栽']],
  [/selvvandingskrukke/, ['自浇水花盆', '带蓄水结构，帮助盆栽持续吸水']],
  [/potteskjuler|\bkrukke\b/, ['装饰花盆套', '套在植物原盆外或作家居装饰']],
  [/bloklys|stagelys|fyrfadslys|havelys|citronella lys/, ['蜡烛', '用于室内外照明或营造氛围；使用时远离易燃物']],
  [/duftlys/, ['香薰蜡烛', '燃烧时散发香味，用于室内氛围']],
  [/pearlwax lys/, ['蜡烛颗粒和烛芯套装', '把蜡粒倒入耐热容器并插入烛芯制作蜡烛']],
  [/fletlanterner|lanterne/, ['装饰灯笼', '放置蜡烛或灯源用于室内外装饰']],
  [/duftolie/, ['香薰油', '用于兼容香薰扩香器或香薰炉']],
  [/gavepapir/, ['礼品包装纸', '用于包裹礼物']],
  [/kort med kuvert/, ['贺卡和信封', '用于写祝福、邀请或留言']],
  [/koleskabsmagneter/, ['冰箱磁贴', '吸附在冰箱等磁性表面，当前款含字母、数字或押韵词']],
  [/sommerpynt|sommerhavenisse/, ['夏季家居装饰', '用于室内、阳台或花园摆设']],
  [/akustiske traepaneler/, ['吸音木饰面板', '安装在墙面用于装饰并改善室内声学']],
  [/ophaengningstilbehor/, ['墙面悬挂配件套装', '用于测平、固定和悬挂相框或其他轻型物品']],
  [/^stige\b/, ['梯子', '用于登高取物；使用时应放在平整地面并确认承重和适配用途']],
  [/\bbojler\b/, ['衣架', '用于悬挂上衣、裤装或其他衣物']],
  [/vinkoler/, ['葡萄酒快速冰镇套', '预先放入冷冻室，使用时套在酒瓶外帮助快速降温']],
  [/klaebefolie/, ['自粘装饰膜', '贴在柜门、墙面或其他平整表面翻新装饰']],
  [/uraeske/, ['手表收纳盒', '用于分格收纳和保护手表']],
  [/kokken.*kurve|kurve til kokkenskab/, ['橱柜收纳篮', '放在橱柜或冰箱中分类收纳']],
  [/fluesmaekker/, ['苍蝇拍', '用于拍打室内飞虫']],
  [/hvepsefaelde/, ['黄蜂诱捕器', '放在户外诱捕黄蜂']],
  [/rustfanger/, ['洗碗机防锈吸附器', '放入洗碗机中帮助减少餐具锈斑']],
  [/skruetraekker|tang|krogesortiment|somsortiment|vaerktoj/, ['家用工具或紧固件套装', '用于简单安装和维修']],
  [/strikkepinde/, ['编织针', '用于手工编织毛线']],
  [/sytraad/, ['缝纫线', '用于手缝或缝纫机缝制']],
  [/\bgarn\b/, ['编织毛线', '用于针织、钩编或其他纤维手工']],
  [/elcykel|\be[- ](?:city|cargo|fresh|gravel|metropolis|modern|mtb|patron|short john|street|stylish|uni|browse)/, ['电助力自行车', '由电机辅助骑行的自行车']],
  [/tandem/, ['双人自行车', '供两人前后共同踩踏']],
  [/lobecykel|loebecykel/, ['儿童平衡车', '无脚踏，儿童用脚蹬地练习平衡']],
  [/\bcykel\b|\b\d{2}[”"] hjul.*(?:stel|bremse)/, ['自行车', '脚踏骑行的两轮车']],
  [/cykelhjelm|skaterhjelm/, ['骑行头盔', '骑车或滑行时保护头部']],
  [/elbil|rideon|offroader|buggy|\batv\b/, ['儿童电动骑乘车', '儿童乘坐并由电机驱动的玩具车']],
  [/festivaltelt|pop up \d|easy up \d|\btelt\b|\btipi\b/, ['帐篷', '用于露营或节庆活动，需按容纳人数、尺寸和防水等级选择']],
  [/pavillon|gazebo/, ['户外凉棚', '用于节庆、庭院或活动时遮阳挡小雨']],
  [/festivalstol/, ['折叠露营椅', '可折叠携带，适合露营、节庆或户外活动']],
  [/traekvogn/, ['折叠拖车', '用于搬运野餐、露营、购物或花园物品']],
  [/luftmadras/, ['充气床垫', '充气后用于临时睡眠或露营']],
  [/\bpool\b/, ['充气或支架水池', '供户外戏水使用，儿童必须由成年人看护']],
  [/udekokken/, ['儿童户外玩具厨房', '供儿童进行过家家和户外角色扮演']],
  [/stige.*trampolin|stormsikring|overtraek.*stige/, ['蹦床配件', '用于进出、覆盖或固定兼容尺寸的蹦床']],
  [/trampolin/, ['蹦床', '带弹力面的户外跳跃游乐设施']],
  [/gyngestativ|babygynge|\bgynge\b/, ['秋千或秋千架', '供儿童坐在摆座上前后摆动']],
  [/legetaarn/, ['户外儿童游乐塔', '组合攀爬、秋千或沙坑等户外玩法']],
  [/rutsjebane/, ['儿童滑梯', '供儿童从斜面滑下玩耍']],
  [/sandkasse/, ['儿童沙坑', '用于户外玩沙']],
  [/fodboldmaal/, ['足球球门', '用于足球射门练习']],
  [/sup board/, ['充气桨板', '用于水面站立划行']],
  [/skoletaske|rygsaek/, ['书包或背包', '用于携带书本、电脑或出行用品']],
  [/penalhus/, ['铅笔盒', '用于收纳笔、尺和橡皮']],
  [/skolesaet/, ['文具套装', '包含多件书写、绘画或课堂用品']],
  [/geometrisaet|kompassersaet/, ['几何绘图工具套装', '用于画直线、角度、圆和几何图形']],
  [/skoleaccessories/, ['书包或文具小配件', '当前选项包含包挂、闪粉笔、DIY 尺等小件']],
  [/staedtler/, ['STAEDTLER 文具', '铅笔、彩笔、马克笔或其他书写绘画用品']],
  [/beer bong/, ['啤酒漏斗饮用器具', '节庆聚会用软管漏斗，不是啤酒本身']],
  [/twinmarkers|dualmarkers|brushpens/, ['双头马克笔', '用于绘画、上色和手账']],
  [/notesbog|spiralhaefte/, ['笔记本', '用于书写课堂、工作或日常记录']],
  [/kuglepen/, ['圆珠笔', '用于日常书写']],
  [/grafitblyant|\bblyant\b/, ['石墨铅笔', '用于书写、草图或几何作图']],
  [/viskelaeder/, ['橡皮擦', '擦除铅笔字迹']],
  [/bogbind/, ['书皮或包书膜', '包裹课本封面，减少磨损和污渍']],
  [/skrivesaet.*stempel/, ['书写工具或印章套装', '包含笔类或儿童图案印章']],
  [/skriveartikler|skriveredskaber/, ['书写文具组合', '包含笔、铅笔、橡皮或其他书写用品']],
  [/pegebog med lyd/, ['有声翻翻启蒙书', '儿童翻开机关并聆听动物等主题声音']],
  [/kogebog/, ['食谱书', '提供菜谱、用料和烹饪步骤']],
  [/\bbog\b|afdelingen for magisk taenkning|den fantastiske bus|\bstyx\b/, ['书籍', '供阅读的小说、儿童读物或主题图书']],
  [/hama.*perler|perleboks|perleplader/, ['拼豆手工材料', '把彩色塑料珠排列在模板上制作图案']],
  [/diamond art/, ['钻石贴画手工', '把彩色树脂钻贴到图案上完成装饰画或小物']],
  [/laeringscomputer/, ['儿童学习机', '通过丹麦语和英语练习数字、字母、语言和词汇']],
  [/laeringskort/, ['儿童学习卡', '练习数字、字母、算术或迷宫题']],
  [/opgavebog/, ['儿童练习册', '包含学习任务并配奖励贴纸']],
  [/fodbold/, ['足球', '用于踢球训练或比赛']],
  [/basketstander/, ['可调高度篮球架', '用于投篮练习']],
  [/maalmandshandsker/, ['守门员手套', '守门时增加抓握并保护手掌']],
  [/padelbolde/, ['板式网球用球', '用于 Padel 板式网球运动']],
  [/sjippetov/, ['跳绳', '用于跳跃训练和儿童户外活动']],
  [/airtrack/, ['充气体操垫', '为翻滚、体操和跳跃练习提供缓冲']],
  [/saebebobler/, ['泡泡玩具', '蘸取泡泡液后吹出或挥出肥皂泡']],
  [/uno flex/, ['UNO Flex 卡牌游戏', '带特殊弹性规则的 UNO 多人卡牌游戏']],
  [/funko pop|minions.*samlefigur|samlefigur/, ['收藏摆件公仔', '用于陈列或角色收藏']],
  [/kalender|ugeplan|dagsplan|belonningstavle|rutine/, ['计划板或日程工具', '用于安排日期、任务或儿童日常流程']],
  [/dagen i dag tavle/, ['儿童日期与天气学习板', '用磁贴认识星期、月份、季节和天气']],
  [/puslespil/, ['拼图', '把拼图片组合成完整图案']],
  [/bamse|plys/, ['毛绒玩具', '柔软填充玩具']],
  [/legetojsbiler/, ['玩具车', '供儿童推行或情景游戏']],
  [/sanselegetoj|aktivitetslegetoj/, ['婴幼儿感官玩具', '通过抓握、声音、镜面或活动部件进行感官游戏']],
  [/\blegetoj\b|\bspil\b/, ['玩具或游戏', '用于儿童玩耍或多人游戏']],
];

const GROUP_TYPE_FALLBACK = {
  drink_soda: ['汽水', '可直接饮用的碳酸软饮'], drink_juice: ['果汁或果味饮料', '可直接饮用的果汁或果味饮品'],
  drink_water: ['饮用水或气泡水', '用于日常补水'], drink_energy: ['能量饮料', '通常含咖啡因的提神饮料'],
  drink_sports: ['运动或功能饮料', '用于补水或补充电解质'], drink_mixed_offer: ['汽水与能量饮料任选', '包含普通汽水和含咖啡因能量饮料'], drink_concentrate: ['浓缩兑水饮料', '按比例兑水后饮用'],
  drink_other: ['非酒精饮料', '可直接饮用或按包装方式冲调'], alcohol_beer: ['啤酒', '以麦芽发酵制成的含酒精饮料'],
  alcohol_wine: ['葡萄酒', '以葡萄酿制的含酒精饮料'], alcohol_wine_red: ['红葡萄酒', '用深色葡萄带皮发酵制成'], alcohol_wine_white: ['白葡萄酒', '以白葡萄或去皮葡萄汁酿制'], alcohol_wine_rose: ['桃红葡萄酒', '颜色介于红白葡萄酒之间，通常冷藏后饮用'], alcohol_wine_sparkling: ['起泡酒', '含有气泡的葡萄酒，具体甜度和类型以酒标为准'], alcohol_wine_mixed_offer: ['多种葡萄酒任选', '促销包含红、白、桃红或起泡等不同类型'], alcohol_wine_other: ['葡萄酒（类型未明确）', '公开促销资料未明确标出颜色或起泡类型'], alcohol_spirits: ['烈酒或利口酒', '酒精度较高的蒸馏酒或甜味酒'],
  alcohol_cider_rtd: ['苹果酒或预调酒', '水果发酵酒或已调配好的即饮酒'], alcohol_mixed_offer: ['跨酒种任选', '包含啤酒、葡萄酒、烈酒或预调酒中的多种类型'], alcohol_other: ['含酒精饮料', '含酒精的饮品'],
  pet_cat: ['猫粮或猫零食', '供猫食用的主粮、湿粮或零食'], pet_dog: ['狗粮或狗零食', '供犬只食用的主粮或零食'],
  pet_other: ['宠物用品', '供宠物使用或食用的商品'], flower_bouquet: ['鲜花或花束', '用于瓶插、家居摆放或送礼'],
  plants: ['盆栽植物', '带盆售卖、需要光照和浇水养护的植物'], tobacco_cigarettes: ['烟草制品', '含烟草并具有健康风险的产品'],
  tobacco_nicotine: ['尼古丁产品', '含尼古丁并可能导致依赖的产品'], tobacco_other: ['烟草相关商品', '与烟草或尼古丁有关的商品'],
  home_appliances: ['家用电器', '通过电力完成烹饪、清洁、空气处理或衣物护理'],
  home_cookware: ['锅具或厨房工具', '用于切配、煎炒、蒸煮、烘烤或盛取食物'],
  home_tableware: ['餐具或饮具', '用于盛装、饮用或上桌食物和饮料'],
  home_storage: ['家居收纳用品', '用于分装食物、整理衣物或收纳家居小物'],
  home_furniture: ['家具', '供就坐、睡眠、置物或收纳使用'],
  home_textiles: ['家纺用品', '用于床铺、保暖、擦拭或家居软装'],
  home_bath: ['浴室或清洁布艺用品', '用于擦干、浴室防滑或收纳洗漱用品'],
  home_tools: ['家用工具', '用于安装、粘接、紧固、标记或简单维修'],
  home_garden: ['花园与户外维护用品', '用于修剪、浇灌、除虫或整理户外空间'],
  home_decor: ['家居装饰品', '用于照明、摆设、节庆装饰或营造室内氛围'],
  home_other: ['家居生活用品', '用于居家收纳、布置、维护或日常使用'],
  electronics_audio: ['音频设备', '用于播放、收听或录制声音'],
  electronics_tv: ['电视或家庭影音设备', '用于显示和播放电视、流媒体或外接视频'],
  electronics_mobile: ['手机、平板或穿戴设备', '用于通讯、移动应用或运动健康记录'],
  electronics_computer: ['电脑或网络设备', '用于学习、办公、存储或网络连接'],
  electronics_monitor: ['电脑显示器', '连接电脑或兼容设备显示画面'],
  electronics_computer_accessory: ['电脑配件', '配合电脑、平板或触摸屏使用'],
  electronics_print_photo: ['打印或影像设备', '用于打印、拍摄或展示照片'],
  electronics_gaming: ['电子游戏设备', '用于对应平台的电子游戏和操控'],
  electronics_charging: ['充电与供电配件', '给兼容电子设备连接电源或传输数据'],
  electronics_lighting: ['电气照明用品', '用于室内局部、工作或氛围照明'],
  electronics_other: ['电子产品或配件', '通过电池或电源工作，用于供电、控制、测量或其他电子功能'],
  leisure_toys: ['玩具', '用于儿童游戏、角色扮演或收藏'],
  leisure_stationery: ['文具用品', '用于书写、绘画、包书或课堂办公'],
  leisure_books: ['书籍或杂志', '供阅读、学习或查阅'],
  leisure_bicycles: ['自行车', '用于脚踏或电助力骑行'],
  leisure_bike_accessories: ['骑行配件', '用于骑行防护、维护或携带'],
  leisure_ride_on: ['儿童骑乘玩具', '供儿童乘坐、滑行或电动驾驶'],
  leisure_outdoor_play: ['户外游乐设施', '供儿童攀爬、滑行、跳跃或戏水'],
  leisure_sports: ['运动器材', '用于球类、体操或户外运动'],
  leisure_camping: ['露营或节庆用品', '用于户外就坐、遮蔽、睡眠或搬运'],
  leisure_bags: ['包袋', '用于携带书本、电脑或随身物品'],
  leisure_crafts_learning: ['手工或学习用品', '用于动手制作、认知练习或课堂学习'],
  leisure_gaming: ['电子游戏或软件', '用于对应游戏平台和设备'],
  leisure_other: ['休闲用品', '用于兴趣、聚会、学习或户外活动'],
  personal_hair_care: ['洗发或护发用品', '用于清洁、护理或造型头发'],
  personal_skin_care: ['洁面或护肤用品', '用于清洁面部、保湿或针对性护理皮肤'],
  personal_body_care: ['沐浴或身体护理用品', '用于清洁、保湿或护理身体和双手'],
  personal_deodorant: ['止汗除味用品', '用于腋下或身体其他部位减少汗味'],
  personal_oral_care: ['口腔护理用品', '用于清洁牙齿、牙缝、舌面或护理口腔'],
  personal_makeup: ['彩妆用品', '用于面部、眼部、眉部或唇部化妆'],
  personal_shaving: ['剃须用品', '用于剃除或修整面部和身体毛发'],
  personal_appliances: ['个人护理电器', '用于刷牙、吹干造型、理发或修整毛发'],
  personal_appliances_mixed_offer: ['多种个人护理电器任选', '促销包含用途不同的健康或理容电器'],
  personal_accessories: ['个人护理辅助用品', '用于清洁、化妆、隔音或其他日常护理'],
  personal_health_devices: ['健康检测或护理设备', '用于测量、检测或辅助日常健康护理'],
  personal_care_mixed_offer: ['多种个人护理用品任选', '促销包含清洁、护肤、洗护或其他不同用途的个人护理商品'],
  hair_body: ['个人洗护用品', '用于头发、面部或身体的清洁护理'],
  sun_care: ['防晒或晒后护理用品', '用于减少紫外线伤害或舒缓晒后皮肤'],
  hygiene: ['卫生护理用品', '用于经期、失禁或其他个人卫生护理'],
  supplements: ['营养补充剂', '用于补充维生素、矿物质、蛋白质或其他膳食成分'],
  supplement_sports_snack: ['蛋白零食或运动能量补给', '作为便携加餐或运动中的碳水补给'],
  other_offer: ['跨品类促销组合', '同一促销卡包含不同类型的商品，不能当作一个单品理解'],
};

function sodaIdentity(originalName) {
  const text = normalize(originalName);
  if (/faxe kondi booster/.test(text)) return { titleZh: 'Faxe Kondi Booster 能量饮料', descriptionZh: 'Faxe Kondi Booster 是含咖啡因的碳酸能量饮料，用于提神，不是普通 Faxe Kondi 柠檬青柠汽水。具体水果口味、含糖或无糖版本以罐身为准；不适合儿童，孕妇及对咖啡因敏感者应谨慎。' };
  if (/monster(?: energy)?/.test(text)) return { titleZh: 'Monster 能量饮料', descriptionZh: 'Monster 是含咖啡因的碳酸能量饮料，多种口味任选，可能有含糖和无糖款。它用于提神而不是补水，选购时看罐身的口味、糖和每罐咖啡因；不适合儿童，孕妇及对咖啡因敏感者应谨慎。' };
  if (/red bull/.test(text) && !/breezer|somersby|schweppes/.test(text)) return { titleZh: 'Red Bull 能量饮料', descriptionZh: 'Red Bull 是含咖啡因和牛磺酸的碳酸能量饮料，原味偏甜酸；不同颜色罐可能是水果风味或无糖款。用于提神而不是补水，不适合儿童，孕妇及对咖啡因敏感者应谨慎。' };
  if (/coop ice tea/.test(text)) return { titleZh: 'Coop 冰茶饮料', descriptionZh: '这是可直接冰镇饮用的茶味饮料，常见为柠檬或桃味，带茶香和果味；具体口味及含糖或无糖版本以瓶身为准，不是碳酸汽水。' };
  if (/blue keld/.test(text)) return { titleZh: 'Blue Keld 果味气泡水', descriptionZh: 'Blue Keld 是带水果风味的气泡水，口感比可乐轻，适合喜欢有气泡但不想要浓重可乐味的人；不同款的果味和是否含糖需看瓶身。' };
  if (/vitamin well|\bnobe\b|valsollille vitamin/.test(text)) return { titleZh: '维生素风味水', descriptionZh: '这是添加维生素并带水果风味的瓶装饮料，可冰镇直接饮用。不同款的维生素、甜味剂、糖和咖啡因配方不同，不能把饮料当作治疗或代替均衡饮食。' };
  if (/capri sun/.test(text)) return { titleZh: 'Capri-Sun 果味饮料', descriptionZh: 'Capri-Sun 是袋装果味饮料，多种水果口味任选，适合随身携带冰镇饮用；购买时看具体果汁含量和糖分，它不等同于百分百纯果汁。' };
  if (/san pellegrino|perrier/.test(text)) return { titleZh: 'San Pellegrino 或 Perrier 气泡矿泉水', descriptionZh: '这是天然矿泉气泡水，气泡明显、无普通汽水的可乐或果糖风味；部分包装可能是调味款，需按瓶身确认。适合佐餐、加柠檬饮用或作为调酒用苏打水。' };
  if (/cacao|kakaomaelkedrik|iskaffe/.test(text)) return { titleZh: '巧克力奶或冰咖啡饮料', descriptionZh: '这是可直接饮用的巧克力奶或冰咖啡任选。巧克力奶偏可可奶香，冰咖啡带咖啡与乳香；两者的咖啡因、糖和乳成分不同，应按实际包装选择。' };
  if (/yopro.*proteindrikkeyoghurt|activia kefirdrik/.test(text)) return { titleZh: '高蛋白酸奶饮或开菲尔发酵乳任选', descriptionZh: 'Yopro 是偏高蛋白的酸奶饮，Activia kefir 是带发酵酸香的开菲尔乳饮；两者都需冷藏、可直接饮用，但蛋白质和菌种侧重点不同。' };
  if (/alkoholfri ol/.test(text)) return { titleZh: '无酒精啤酒', descriptionZh: '这是保留麦芽、啤酒花香和轻微苦味的无酒精啤酒，适合想要啤酒风味但避免普通啤酒酒精的人；不同品牌从清爽拉格到较浓麦芽味不等，仍应核对瓶罐标示的实际酒精度。' };
  if (/alkoholfri cocktail|nozeco|maximillian/.test(text)) return { titleZh: '无酒精鸡尾酒或起泡饮料', descriptionZh: '这是无酒精鸡尾酒或无酒精起泡饮料，通常带水果、花香或气泡感，适合冰镇作为开胃饮品；具体甜度与风味以瓶身为准，购买时仍应核对是否标注 0.0%。' };
  const options = [];
  const add = value => { if (!options.includes(value)) options.push(value); };
  if (/coca cola/.test(text)) add(/zero/.test(text) ? 'Coca-Cola 无糖可乐' : 'Coca-Cola 可乐');
  if (/pepsi max/.test(text)) add('Pepsi Max 无糖可乐');
  else if (/\bpepsi\b/.test(text)) add('Pepsi 可乐');
  if (/\bfanta\b/.test(text)) add('Fanta 果味汽水');
  if (/tuborg squash/.test(text)) add('Tuborg Squash 橙味汽水');
  if (/faxe kondi/.test(text) && !/booster/.test(text)) add('Faxe Kondi 柠檬青柠味汽水');
  if (/\bsprite\b|\b7 up\b/.test(text)) add('柠檬青柠味汽水');
  if (/schweppes/.test(text)) add('Schweppes 汽水或汤力水');
  if (/ramlosa/.test(text)) add('Ramlösa 气泡矿泉水');
  if (/fuze/.test(text)) add('Fuze 茶饮');
  if (!options.length) return null;
  const titleZh = options.length === 1 ? options[0] : `${options.join('、')}任选`;
  const optionText = options.join('；');
  return {
    titleZh,
    descriptionZh: `${optionText}。可乐带焦糖与香料型可乐风味；Fanta 或 Tuborg Squash 偏果香，Faxe Kondi、Sprite 和 7 Up 偏清爽柠檬青柠味。标有 Max、Zero 或 0 kalorier 的款式为无糖或零糖版本；混合促销应按实际包装选择。`,
  };
}

function alcoholIdentity(originalName, originalDescription, comparisonGroup) {
  const text = normalize(`${originalName} ${originalDescription}`);
  if (comparisonGroup === 'alcohol_mixed_offer') return {
    titleZh: '啤酒、葡萄酒、烈酒或预调酒跨酒种任选',
    descriptionZh: '这是跨酒种任选促销，可能同时包含清爽微苦的啤酒、果香和单宁不同的葡萄酒、酒感较强的烈酒，以及甜酸有气泡的果味预调酒。它们味道、饮法和酒精度差异很大，应按原名先选酒种，再看具体品牌与风味，不能用同一模板概括。',
  };
  if (comparisonGroup === 'alcohol_spirits') {
    if (/jack daniels/.test(text)) return {
      titleZh: 'Jack Daniel’s 田纳西威士忌',
      descriptionZh: 'Jack Daniel’s Old No. 7 风格的田纳西威士忌，典型为焦糖、香草和橡木香，口感偏圆润微甜。适合喜欢美式威士忌甜香的人，可加冰、加可乐或用于经典威士忌调酒；40% 酒精度，未成年人及驾车前后不要饮用。',
    };
    if (/baileys/.test(text) && !/whisky|vodka|gin|rom|spiritusmarked/.test(text)) return {
      titleZh: 'Baileys 奶油利口酒',
      descriptionZh: 'Baileys 奶油利口酒带甜润奶油、可可和香草风味，酒感通常比纯威士忌柔和。适合喜欢甜酒、奶咖或甜点风味的人，可加冰、加入咖啡或调制甜味鸡尾酒；含乳成分与酒精。',
    };
    if (/whisky|whiskey/.test(text)) return { titleZh: '威士忌', descriptionZh: '威士忌通常带麦芽或谷物甜香、焦糖、香草、香料和橡木味；苏格兰款可能更干、更有烟熏感。适合喜欢木桶香和较温暖酒感的人，可纯饮、加冰、加水或调酒；具体风味仍取决于原名中的酒款。' };
    if (/vodka/.test(text)) return { titleZh: '伏特加', descriptionZh: '伏特加通常酒体清爽、味道较中性，适合不想要明显木桶味、主要用于兑果汁、汽水或调鸡尾酒的人；若是调味款会带包装标明的水果或香草味。' };
    if (/\bgin\b|gordon s/.test(text)) return { titleZh: '金酒', descriptionZh: '金酒以杜松子香为核心，常带柑橘、草本和香料气息。适合喜欢清爽草本风味的人，最常配汤力水和柠檬，也可用于 Martini 等鸡尾酒。' };
    if (/\brom\b|rum|captain morgan|bacardi/.test(text)) return { titleZh: '朗姆酒', descriptionZh: '朗姆酒以甘蔗原料酿制，常有焦糖、香草、热带水果或香料感；白朗姆较清爽，深色或香料朗姆更甜暖。适合兑可乐、果汁或调制 Mojito 等鸡尾酒。' };
    if (/aperol/.test(text)) return { titleZh: 'Aperol 橙味开胃酒', descriptionZh: 'Aperol 带橙皮、草本和轻微苦甜味，酒精感相对温和。适合喜欢清爽苦甜开胃酒的人，常与起泡酒和苏打水调成 Aperol Spritz。' };
    if (/cognac/.test(text)) return { titleZh: '干邑白兰地', descriptionZh: '干邑白兰地通常带葡萄干、杏干、香草、香料和橡木香，陈年时间会影响圆润度。适合喜欢果干与木桶香的人，可小口纯饮、加冰或用于经典鸡尾酒。' };
    if (/tequila/.test(text)) return { titleZh: '龙舌兰酒', descriptionZh: 'Blanco 龙舌兰酒通常带熟龙舌兰、柑橘、胡椒和草本气息，口感直接清爽。适合喜欢植物与辛香风味的人，可配青柠小饮或调制 Margarita、Paloma。' };
    if (/akvavit|aquavit/.test(text)) return { titleZh: '北欧香料烈酒', descriptionZh: 'Akvavit 是北欧谷物或土豆蒸馏酒，常用葛缕子、莳萝等香料调味，风味干爽辛香。适合喜欢草本香料味的人，丹麦常冰镇后配鲱鱼、冷盘和节日餐。' };
    if (/fernet|bitter|gammel dansk|underberg/.test(text)) return { titleZh: '草本苦味酒', descriptionZh: '草本苦味酒通常以多种香草、根茎和香料浸制，带明显苦味、药草和辛香，有些款还带薄荷或柑橘。适合喜欢餐后苦甜草本风味的人，可少量纯饮或加冰。' };
    return { titleZh: '多种烈酒或利口酒任选', descriptionZh: '这项促销包含酒种或风味不同的烈酒、苦味酒或利口酒。选购时应先按原名区分偏中性的伏特加、杜松草本型金酒、木桶香威士忌、甘蔗甜香朗姆或甜润利口酒，再决定纯饮还是调酒；不同酒种不能用同一种味道概括。' };
  }
  if (comparisonGroup.startsWith('alcohol_wine')) {
    if (comparisonGroup === 'alcohol_wine_mixed_offer') {
      const styles = [];
      const addStyle = (label, taste) => { if (!styles.some(([existing]) => existing === label)) styles.push([label, taste]); };
      if (/sauvignon blanc|sancerre|pouilly fume/.test(text)) addStyle('长相思白葡萄酒', '柑橘、醋栗和草本香，酸度清爽');
      if (/chardonnay|chablis|macon/.test(text)) addStyle('霞多丽白葡萄酒', '苹果、柑橘或白桃味，橡木桶款更圆润');
      if (/riesling/.test(text)) addStyle('雷司令白葡萄酒', '青苹果、柑橘和白花香，甜度可能从干到甜');
      if (/pinot grigio|pinot gris/.test(text)) addStyle('灰皮诺白葡萄酒', '梨、苹果和柠檬味，通常轻盈清爽');
      if (/prosecco|cava|cremant|champagne|mousseux|spumante/.test(text)) addStyle('起泡葡萄酒', '苹果、梨和柑橘香，带清爽气泡');
      if (/rose|rosado|rosé/.test(text)) addStyle('桃红葡萄酒', '草莓、覆盆子或柑橘果香，适合冰镇');
      if (/primitivo|zinfandel|appassimento|amarone/.test(text)) addStyle('浓郁果香型红酒', '熟黑莓、李子、葡萄干和甜香料味');
      if (/pinot noir|spatburgunder/.test(text)) addStyle('黑皮诺红酒', '红樱桃、草莓和轻香料味，单宁较柔');
      if (/cabernet|merlot|malbec|shiraz|syrah|tempranillo|rioja|chianti|sangiovese|ripasso/.test(text)) addStyle('配餐型红葡萄酒', '红黑水果、香料和不同程度的单宁');
      if (styles.length) return {
        titleZh: `${styles.map(([label]) => label).join('、')}任选`,
        descriptionZh: `本期可选${styles.map(([label, taste]) => `${label}（${taste}）`).join('；')}。白酒和起泡酒适合海鲜、沙拉及轻食，红酒更适合披萨、烤肉和炖菜；应按想要的甜度、酸度和单宁选择具体酒款。`,
      };
      return { titleZh: '多款葡萄酒任选', descriptionZh: '这是多款葡萄酒任选，但公开文字没有完整列出每款的颜色、葡萄品种和甜度，不能负责任地编造一种统一味道。应先从原名和图片确认红、白、桃红或起泡类型，再按红酒的果味与单宁、白酒的酸香或起泡酒的清爽气泡选择。' };
    }
    if (/rueda verdejo/.test(text)) return {
      titleZh: '西班牙 Rueda Verdejo 干白葡萄酒',
      descriptionZh: 'Rueda 产区 Verdejo 干白通常酸度清爽，带柠檬、青柠、白桃和茴香或青草般的草本香。适合喜欢不甜、清新、有一点草本感白葡萄酒的人，可冷藏后配海鲜、沙拉、白肉或亚洲清淡菜。',
    };
    if (/sauvignon blanc/.test(text) && /new zealand/.test(text)) return {
      titleZh: '新西兰长相思白葡萄酒',
      descriptionZh: '新西兰 Sauvignon Blanc（长相思）典型酸度鲜明，带葡萄柚、青柠、醋栗、百香果和青草或甜椒香。适合喜欢香气奔放、清爽干型白葡萄酒的人，可冷藏后配贝类、白身鱼、沙拉或带柠檬和香草的菜。',
    };
    if (/sauvignon blanc/.test(text)) return { titleZh: '长相思白葡萄酒', descriptionZh: 'Sauvignon Blanc（长相思）通常是清爽干型，常见柑橘、醋栗和青草香。适合喜欢酸度明快、果香和草本感的人，冷藏后可配海鲜、沙拉和山羊奶酪。' };
    if (/chardonnay/.test(text)) return { titleZh: '霞多丽白葡萄酒', descriptionZh: 'Chardonnay（霞多丽）常见苹果、柑橘、桃子或热带水果味；若经过橡木桶还可能更圆润并带香草、烘烤感。适合喜欢果味柔和到较饱满白葡萄酒的人，可配鸡肉、奶油意面或烤鱼。' };
    if (/riesling/.test(text)) return { titleZh: '雷司令白葡萄酒', descriptionZh: 'Riesling（雷司令）通常香气明亮，带青苹果、柑橘、白花或桃子味，甜度可能从干型到甜型。适合喜欢高香气和清爽酸度的人；微甜款尤其适合辛辣亚洲菜。' };
    if (/pinot grigio|pinot gris/.test(text)) return { titleZh: '灰皮诺白葡萄酒', descriptionZh: 'Pinot Grigio/Gris（灰皮诺）通常清爽轻盈，带梨、苹果、柠檬和淡淡花香。适合喜欢容易入口、不过分浓郁白葡萄酒的人，可配沙拉、海鲜和清淡意面。' };
    if (/moscato/.test(text)) return { titleZh: '莫斯卡托芳香型葡萄酒', descriptionZh: 'Moscato（莫斯卡托）通常带葡萄、桃子、橙花和蜂蜜香，口感偏甜，有些款带轻微气泡。适合喜欢甜口、低苦涩和花果香的人，可冰镇后配水果、蛋糕或辛辣小食。' };
    if (/chablis|macon|mâcon/.test(text)) return { titleZh: '法国勃艮第霞多丽白葡萄酒', descriptionZh: 'Chablis 或 Mâcon 白葡萄酒以 Chardonnay 为主。Chablis 通常更清瘦、带柠檬和矿物感，Mâcon 往往更圆润、带苹果和白桃；适合喜欢干型白酒的人，可配贝类、鱼或鸡肉。' };
    if (/sancerre/.test(text)) return { titleZh: '法国 Sancerre 长相思白葡萄酒', descriptionZh: 'Sancerre 通常以 Sauvignon Blanc 酿造，风格干爽，带柠檬、青苹果、青草和矿物感。适合喜欢高酸、克制果香与清爽收口的人，可配山羊奶酪、贝类和白身鱼。' };
    if (/chianti|brunello|sangiovese/.test(text)) return { titleZh: '意大利 Sangiovese 红葡萄酒', descriptionZh: 'Chianti 或 Brunello 以 Sangiovese 为主，常见酸樱桃、红李子、干香草、香料和皮革气息，酸度较高、单宁从中等到有力。适合喜欢不甜、配餐型红酒的人，可配番茄意面、牛羊肉和硬奶酪。' };
    if (/cotes du rhone|cote du rhone|rhône/.test(text)) return { titleZh: '法国罗讷河谷红葡萄酒', descriptionZh: 'Côtes du Rhône 红酒通常以 Grenache、Syrah 等混酿，带熟红莓、黑莓、黑胡椒和南法香草味。适合喜欢果香与辛香平衡、不过分厚重红酒的人，可配烤肉、香肠和炖菜。' };
    if (/ripasso|valpolicella/.test(text)) return { titleZh: '意大利 Valpolicella Ripasso 红葡萄酒', descriptionZh: 'Valpolicella Ripasso 通常带樱桃、李子、葡萄干、香料和柔和木桶味，酒体比普通 Valpolicella 更饱满。适合喜欢成熟果香但不想要 Amarone 那么厚重的人，可配烤肉、意面和熟成奶酪。' };
    if (/spatburgunder/.test(text)) return { titleZh: '德国黑皮诺红葡萄酒', descriptionZh: 'Spätburgunder 是德国黑皮诺，通常带红樱桃、草莓、香料和轻微泥土气息，酒体较轻、单宁柔和。适合不喜欢厚重涩口红酒的人，可配烤鸡、蘑菇和冷切。' };
    if (/port\b|tawny/.test(text)) return { titleZh: '波特加强葡萄酒', descriptionZh: 'Port 波特酒是甜型加强葡萄酒，常带葡萄干、无花果、坚果、焦糖和香料味。适合喜欢甜润浓郁餐后酒的人，可少量配巧克力、蓝纹奶酪或坚果甜点。' };
    if (/primitivo|zinfandel|appassimento|amarone/.test(text)) return { titleZh: '浓郁果香型红葡萄酒', descriptionZh: '这类红葡萄酒通常酒体较饱满，带熟黑莓、李子、葡萄干、甜香料和较高酒精感。适合喜欢浓郁、成熟果味和略带甜熟感红酒的人，可配烤肉、披萨、炖牛肉或浓味奶酪。' };
    if (/pinot noir/.test(text)) return { titleZh: '黑皮诺红葡萄酒', descriptionZh: 'Pinot Noir（黑皮诺）通常酒体较轻到中等，带红樱桃、草莓、香料和轻微泥土气息，单宁较柔。适合不喜欢厚重涩口红酒的人，可配烤鸡、蘑菇、三文鱼或冷切。' };
    if (/cabernet|merlot|malbec|shiraz|syrah|tempranillo|rioja/.test(text)) return { titleZh: '果香与香料型红葡萄酒', descriptionZh: '这类红葡萄酒通常带黑樱桃、黑莓、李子、香料和橡木气息，单宁与酒体从中等到饱满。适合喜欢较浓郁红酒的人，可配牛排、烤肉、炖菜或硬质奶酪。' };
    if (comparisonGroup === 'alcohol_wine_sparkling') return { titleZh: '起泡葡萄酒', descriptionZh: '起泡酒带细密气泡，常见苹果、梨、柑橘和白花香，甜度从干型到甜型。适合喜欢清爽、有气泡口感的人，可作开胃酒并搭配海鲜、炸物或小食。' };
    if (comparisonGroup === 'alcohol_wine_rose') return { titleZh: '桃红葡萄酒', descriptionZh: '桃红葡萄酒通常清爽，带草莓、覆盆子、西瓜或柑橘风味，甜度由酒款决定。适合喜欢介于红白葡萄酒之间、果香明显且适合冰镇口感的人，可配沙拉、烧烤和轻食。' };
    if (/rod eller hvid|red eller white/.test(text) || comparisonGroup === 'alcohol_wine_mixed_offer') return { titleZh: '红白葡萄酒任选', descriptionZh: '同一促销同时包含红葡萄酒和白葡萄酒。红酒通常偏红黑水果、香料和单宁，适合烤肉与炖菜；白酒更偏柑橘、苹果与清爽酸度，适合海鲜和轻食。应先按想配的食物和口味选择颜色，再核对具体酒款。' };
    if (comparisonGroup === 'alcohol_wine_red') return { titleZh: '红葡萄酒', descriptionZh: '这款红葡萄酒的促销资料未标明葡萄品种；红酒通常带红樱桃、李子或黑莓等果味，并有不同程度的单宁和香料感。适合搭配烤肉、炖菜或奶酪；喜欢柔和口感可选标有 blød/rund 的款，喜欢厚重可看酒精度与产区。' };
    if (comparisonGroup === 'alcohol_wine_white') return { titleZh: '白葡萄酒', descriptionZh: '这款白葡萄酒的促销资料未标明葡萄品种；白酒通常带柑橘、苹果、梨或白桃味，酸度与甜度因酒款而异。适合冰镇后配海鲜、鸡肉和沙拉；喜欢不甜可找 tør/dry，喜欢果甜可找 halvsød/sød。' };
    return { titleZh: '葡萄酒（酒款类型未完整标明）', descriptionZh: '本期公开促销文字没有完整标出这款酒的颜色、葡萄品种或甜度，因此不能负责任地编造单一味道。请先从卡片图片和原名确认红、白、桃红或起泡类型；红酒通常更有果味与单宁，白酒更清爽酸香，起泡酒适合冰镇开胃。' };
  }
  if (comparisonGroup === 'alcohol_beer') {
    if (/ipa|humle|anarkist/.test(text)) return { titleZh: '啤酒花香型 IPA 或精酿啤酒', descriptionZh: '这类啤酒突出啤酒花香和苦味，常带柑橘、松针或热带水果气息。适合喜欢明显苦味和香气层次的人，冰凉饮用可配汉堡、辣味食物和烧烤；具体风格按所选酒款确认。' };
    if (/blanc|hvede|weiss|hoegaarden/.test(text)) return { titleZh: '小麦或 Blanc 风格啤酒', descriptionZh: '小麦或 Blanc 风格啤酒通常口感较柔和，带柑橘、香蕉、丁香或香菜籽般香气，苦味一般低于 IPA。适合不喜欢强苦味、偏好清爽果香的人，可配沙拉、海鲜和轻食。' };
    if (/pilsner|lager|carlsberg|tuborg|royal|heineken|slots|corona|asahi|singha|sol\b/.test(text)) return { titleZh: '拉格或皮尔森啤酒', descriptionZh: '拉格或 Pilsner 风格通常清爽、带麦芽谷物香和适中啤酒花苦味，冰镇后易入口。适合喜欢干净爽口啤酒的人，可配炸物、披萨、汉堡和烧烤；各品牌的苦味与麦芽感会不同。' };
    return { titleZh: '多款啤酒任选', descriptionZh: '本期为多款啤酒任选；浅色拉格通常清爽麦香，IPA 更苦并有柑橘或热带水果啤酒花香，深色或修道院风格会更有焦糖和烘烤味。应按原名选择喜欢的风格，而不是只看酒精度和容量。' };
  }
  if (comparisonGroup === 'alcohol_cider_rtd') {
    if (/somersby|cider/.test(text) && !/breezer|smirnoff|mokai|shaker/.test(text)) return { titleZh: '果味苹果酒', descriptionZh: '这是以苹果酒为基础的果味酒饮，通常酸甜、有气泡，水果味明显、苦味较低。适合喜欢冰镇甜爽口感、不喜欢啤酒苦味的人；具体苹果、莓果或其他口味按瓶罐选择。' };
    return { titleZh: '果味预调酒或苹果酒任选', descriptionZh: '这是已经调好、可冰镇直接饮用的果味酒饮，通常带柑橘、莓果或热带水果甜酸味和气泡感。适合喜欢酒感较轻、果味明显的人；不同款的基酒、甜度与实际酒精度应按瓶罐确认。' };
  }
  return null;
}

function readyMealIdentity(originalName, originalDescription, comparisonGroup) {
  if (comparisonGroup !== 'ready_meal') return null;
  const text = normalize(`${originalName} ${originalDescription}`);
  const rules = [
    [/biksemad.*tandoori.*bami goreng/, '丹麦土豆肉丁杂烩、印度烤鸡饭或印尼炒面任选', '三款冷冻主餐任选：biksemad 是土豆与肉丁煎炒杂烩，chicken tandoori 是印度香料鸡肉餐，bami goreng 是印尼风味炒面。口味与主食不同，应按包装选择并充分加热。'],
    [/polsehorn.*focaccia/, '香肠面包卷或辣香肠佛卡夏任选', '可选包裹香肠的烘焙面包卷，或带 pepperoni 辣香肠的佛卡夏面包；均为冷冻咸味烘焙食品，适合烤箱或空气炸锅加热。'],
    [/\btaquitos\b/, '墨西哥鸡肉炸卷', 'Taquitos 是把调味鸡肉等馅料卷入小玉米饼后烤或炸的墨西哥风味小吃，通常用烤箱或空气炸锅加热至外皮酥脆，可配 salsa 或酸奶油。'],
    [/al fez.*blue dragon.*go tan.*patak/, '亚洲与中东风味酱料或料理配料任选', 'Al’Fez、Blue Dragon、Go-Tan 或 Patak’s 跨品牌任选，可能包含咖喱酱、炒菜酱、椰奶或其他亚洲及中东料理配料。各选项不是同一道成品餐，应按包装正面的具体酱料和使用步骤选择。'],
    [/bagerens morgenmenu/, '面包房新鲜早餐面包任选', 'Bilka 面包房当天烘焙的早餐小圆面包，多种款式任选，可直接配黄油、奶酪、果酱或冷切食用；商品是现烤面包，不是需要微波加热的预制菜。'],
    [/fransk hotdog/, '法式热狗', '法式热狗是把烤肠插入中空长面包，加入酱料后食用。本期可选普通烤肠、芝士烤肠或 Chorizo 风味肠，肉香和辣度不同；两份装。'],
    [/mezete hummus.*suppe/, 'Mezete 鹰嘴豆泥或汤任选', '可选 Mezete 鹰嘴豆泥或汤。鹰嘴豆泥是鹰嘴豆芝麻酱抹酱，可蘸面包和蔬菜冷食；汤需要按包装加热。两种形态和吃法不同。'],
    [/naturli.*middagskomponent/, 'Naturli 植物基主餐配料任选', 'Naturli 植物基主餐组件，多种款式任选，可能是植物肉、肉丸、肉排或其他可搭配米饭、意面和蔬菜的主菜配料；按包装加热，具体形态和口味见正面标签。'],
    [/^sandwich\b/, '门店现做夹馅三明治', '门店每天制作的现成夹馅三明治，多种口味任选，可直接作为早餐或午餐。购买时按标签选择鸡肉、火腿、奶酪或素食等具体馅料，并确认冷藏和过敏原信息。'],
    [/steff houlberg.*tulip.*middags/, 'Steff Houlberg 或 Tulip 丹麦家常成品餐任选', 'Steff Houlberg 或 Tulip 冷冻丹麦家常成品餐，多种菜式任选，通常包含肉类、酱汁和土豆或其他配菜；按包装充分加热即可作为一餐。'],
    [/gestus middagsfrikadeller.*polsemix.*biksemad/, '丹麦肉饼、香肠土豆杂烩或肉丁土豆杂烩任选', '三款冷冻丹麦家常菜任选：middagsfrikadeller 是丹麦煎肉饼，klassisk pølsemix 是香肠配土豆的杂烩，biksemad 是肉丁与土豆煎炒。按包装加热即可，肉类和配菜比例不同。'],
    [/naemt to og server/, 'Næmt 解冻即食或加热食品任选', 'Næmt 冷冻食品系列，解冻后直接食用或简单加热，多种款式任选。公开文字没有列出全部菜名，应按包装正面确认是甜点、面包还是主餐以及具体解冻或加热方式。'],
    [/perfect season.*falafel/, 'Perfect Season 有机香脆鹰嘴豆丸', '有机香脆 Falafel 鹰嘴豆丸，以鹰嘴豆和香料制成，外层加热后酥脆。适合素食者，可用烤箱、空气炸锅或平底锅加热后夹皮塔饼、配沙拉或蘸鹰嘴豆泥。'],
    [/protein lab one meal/, 'Protein Lab 一餐型蛋白饮', 'Protein Lab One Meal 是瓶装一餐型营养饮品，不是需要加热的预制菜。适合赶时间时作为便携代餐或补充蛋白质；应查看每瓶蛋白质、能量、糖分和过敏原，不能长期替代均衡正餐。'],
    [/halsans kok.*burger.*falafel.*nuggets/, 'Hälsans Kök 植物汉堡、鹰嘴豆丸或素食小食任选', 'Hälsans Kök 冷冻植物基食品任选，包括植物汉堡饼、Falafel、素食 nuggets、schnitzel 或素食块。形态和做法不同，按包装用烤箱、空气炸锅或平底锅加热。'],
    [/naturli.*hakket gront.*falafel.*green burger/, 'Naturli 植物肉末、鹰嘴豆丸或素食汉堡任选', 'Naturli 植物基食品任选，包括植物肉末、Falafel、Green Burger 或素食小块。植物肉末适合炒菜和肉酱，汉堡与小食适合煎烤；按实际包装选择。'],
    [/rema 1000 lasagne.*carbonara/, 'REMA 1000 多款速食意面或米饭料理包', 'REMA 1000 速食主食任选，包括千层面、Lasagnette、米饭餐、咖喱饭或 Carbonara 奶油培根意面风味。不同包装可能需另加肉、奶或水，按背面步骤烹调。'],
    [/rema 1000 madtaerte.*daloon ruller/, 'REMA 1000 咸派或 Daloon 馅卷任选', '冷冻咸派或 Daloon 馅卷任选。咸派是蛋奶馅烘焙主餐，Daloon 馅卷是包裹蔬菜或肉馅的酥脆小食；均适合烤箱或空气炸锅加热。'],
    [/bornehapsermenu/, '儿童聚会小食套餐', '儿童聚会小食套餐，每人份包含牛肉小汉堡、香肠面包卷、丹麦肉丸、松饼、鸡肉小食、意面沙拉和蔬菜条；页面要求至少订 6 人份并提前 4 天预订。'],
    [/luksus hapsermenu/, '豪华多人份小食套餐', '豪华多人份小食套餐，示例包含风干火腿小汉堡、三文鱼卷饼、三文鱼酱小薄饼和凯撒沙拉；至少订 6 人份并需提前预订，属于冷食与小吃拼盘。'],
    [/festbuffet|luksusbuffet/, '可自选多人份宴会自助餐', '可自行搭配酱汁、两种肉类和四种配菜的宴会自助餐，并可加购前菜、甜点或更多菜品；页面要求至少订 6 人份并提前预订。'],
    [/frokostplatte/, '熟食柜午餐拼盘', '熟食柜制作的午餐拼盘，通常组合冷切肉、鱼、蛋、奶酪、面包或沙拉，拿取后可作为一顿冷餐；具体内容会随门店和当天款式变化。'],
    [/kitchen joy pollo alla siciliana/, '西西里风味鸡肉大麦饭', '地中海风味成品餐，含大麦粒、番茄酱、茄子和鸡肉。属于一人份主餐，按包装加热后食用；味道偏番茄与香草，不是泛称的预制菜。'],
    [/kitchen joy polpette con orzotto/, '鸡肉丸番茄粗麦饭', '地中海风味成品餐，含番茄酱、粗麦、豆类和鸡肉丸。按包装加热后可作为一人份主餐；口感是番茄酸香配谷物和肉丸。'],
    [/pollo alla siciliana/, '西西里风味鸡肉大麦饭', '以鸡肉、番茄酱、茄子和大麦粒组成的地中海风味方便餐，按包装加热后食用。'],
    [/polpette con orzotto/, '鸡肉丸番茄粗麦饭', '以鸡肉丸、番茄酱、粗麦和豆类组成的地中海风味方便餐，按包装加热后食用。'],
    [/pokebowl/, '三文鱼或天妇罗虾 Poke 盖饭', '熟食柜 Poke bowl 盖饭，可选冷熏三文鱼或天妇罗虾，通常配米饭、蔬菜和调味酱冷食。两种海鲜与裹粉状态不同，应按实际选项选择。'],
    [/panini med skinke og ost/, '火腿奶酪帕尼尼三明治', '夹火腿和奶酪的压烤帕尼尼三明治，加热后面包外层酥脆、奶酪融化；可作为便携午餐或加餐。'],
    [/sol mar paellasaet/, 'SOL&MAR 西班牙海鲜饭炊具套装', '名称为 paellasæt，指制作西班牙海鲜饭的套装商品；本期公开文字没有列出内容物，应结合图片确认是锅具、食材包还是组合套装，不能直接当作成品饭。'],
    [/sol mar paella/, 'SOL&MAR 西班牙海鲜饭', '冷冻西班牙 Paella 海鲜饭或混合饭，通常含米饭、蔬菜并搭配海鲜或肉类；用平底锅或微波炉按包装充分加热，可直接作为一餐。'],
    [/vitasia.*bao.*teriyaki/, '照烧鸡肉包子', '亚洲风味冷冻 Bao 夹照烧鸡肉馅，面皮松软、馅料甜咸；按包装蒸热或微波加热，可作小吃或简餐。'],
    [/vitasia.*pho/, '越南风味 Pho 河粉汤', '越南风味 Pho 方便河粉汤，通常加入热水或短时煮制，带香料汤底与米粉；具体肉味、辣度和配料以包装为准。'],
    [/vitasia.*suppe/, 'VITASIA 亚洲风味汤', 'VITASIA 亚洲风味汤，可能是椰奶咖喱、面汤或蔬菜汤；按包装加热后食用，口味和辣度需按具体包装选择。'],
    [/vitasia.*faerdigret/, 'VITASIA 亚洲风味成品餐', 'VITASIA 亚洲风味成品餐，通常由米饭或面条配酱汁、蔬菜及肉类组成；按包装加热即可作为一餐，具体菜名和辣度见包装正面。'],
    [/spicefield asia box/, '泰式咖喱鸡饭盒', '冷冻泰式咖喱鸡饭盒，可选 Panang 咖喱鸡或红咖喱鸡；Panang 通常更浓郁带花生与椰香，红咖喱香辣感更明显，按包装加热即可食用。'],
    [/steff houlberg middagsretter/, '丹麦肉类家常成品餐任选', 'Steff Houlberg 冷冻家常成品餐，当前选项包括丹麦肉糜烤肉配菜或咖喱肉丸等；只需按包装充分加热，菜品和酱汁不同。'],
    [/steff houlberg maxi.*middagsretter|steff houlberg maxi middagsretter/, 'Steff Houlberg 大份家常成品餐', '大份冷冻家常成品餐，选项可包括贝阿恩酱牛排餐或猪里脊炖菜等；按包装加热即可作为一餐，具体配菜见包装。'],
    [/knorr lasagne.*lasagnette/, 'Knorr 千层面或迷你千层面料理包', 'Knorr Lasagne/Lasagnette 是制作番茄肉酱千层面风味主餐的常温料理包，通常还需按包装另加肉、牛奶或水后烹调；不是开袋即食的成品千层面。'],
    [/knorr snack pot/, 'Knorr 杯装速食面或速食餐', 'Knorr Snack Pot 杯装速食餐，加入热水后短时间焖泡即可食用；不同款可能是意面、面条或米饭口味，适合快速午餐或加餐。'],
    [/knorr dinner kit|knorr retter/, 'Knorr 快手料理包任选', 'Knorr 快手料理包用于制作意面、米饭或其他家庭主餐，通常需要按包装另加肉类、蔬菜、水或奶制品；各款所需配料和烹调步骤不同。'],
    [/grillbuffet|bestil nem og laekker grillbuffet/, '三种烤肉配菜和甜点自助套餐', '需在线预订的多人烧烤自助套餐，包含三种肉类、配菜和甜点；按每人份计价并有最低订购人数，具体肉类与配菜需在预订页面选择。'],
    [/steg selv menu/, '烤猪肉多人套餐食材包', '需自行烤制的多人套餐，包含腌制猪外脊、奶油土豆、青酱意面沙拉、混合沙拉、法棍和酸奶油酱；肉类需彻底加热，其余配菜按门店说明食用。'],
    [/noglehulsret/, '健康标识主餐任选', '带丹麦 Nøglehullet 钥匙孔营养标识的主餐任选，例如墨西哥鸡肉糙米饭、三文鱼配青酱土豆蔬菜或鸡肉串配蔬菜；每款主料不同，按实际餐盒选择。'],
    [/a arstiderne|aarstiderne/, 'Aarstiderne 有机成品主餐', 'Aarstiderne 有机成品主餐，多种口味；当前说明举例为番茄、蘑菇、面片、奶油酱和马苏里拉组成的素食千层面，按包装加热后食用。'],
    [/beauvais middagsretter/, 'Beauvais 罐装丹麦家常菜', 'Beauvais 罐装家常成品餐，多种菜式任选，开罐后充分加热即可配土豆、米饭或面包；具体肉类、酱汁和配菜见罐身。'],
  ];
  for (const [pattern, titleZh, descriptionZh] of rules) if (pattern.test(text)) return { titleZh, descriptionZh };
  if (/faerdigret|middagsret|familleret|frost ?marked|to go marked|to go|asiatisk marked/.test(text)) return {
    titleZh: '多款方便主餐或即食小吃任选',
    descriptionZh: '这是多款方便主餐、冷冻菜或即食小吃的任选促销，公开文字没有逐一列出全部菜名。购买时应结合卡片图片和包装正面选择实际菜式，并按包装确认冷食、微波、烤箱或平底锅的加热方式。',
  };
  return null;
}

function inferLowPriorityType(originalName, originalDescription, comparisonGroup) {
  const headingText = normalize(originalName || '');
  const text = normalize(`${originalName || ''} ${originalDescription || ''}`);
  if (comparisonGroup.startsWith('clothing_')) {
    const childSize = '(?:62|68|74|80|86|92|98|104|110|116|122|128|134|140|146|152|158|164|170)';
    const childSized = new RegExp('\\b' + childSize + '(?:\\s+' + childSize + '){1,3}\\b').test(text);
    const audience = comparisonGroup.includes('_children') || childSized || /\b(?:lupilu|esmara kids|minions|til born)\b/.test(text) ? '儿童' : '成人';
    for (const [pattern, [typeZh, useZh]] of CLOTHING_TYPE_RULES) {
      if (pattern.test(text)) return { typeZh: `${audience}${typeZh}`, useZh };
    }
    return { typeZh: comparisonGroup.includes('_children') ? '儿童服饰' : '成人服饰', useZh: '日常穿着的服装或配件' };
  }
  if (/^(?:personal_|hair_body$|sun_care$|hygiene$|supplements$)/.test(comparisonGroup || '')) {
    for (const [pattern, [typeZh, useZh]] of PERSONAL_TYPE_RULES) {
      if (pattern.test(headingText)) return { typeZh, useZh };
    }
    for (const [pattern, [typeZh, useZh]] of PERSONAL_TYPE_RULES) {
      if (pattern.test(text)) return { typeZh, useZh };
    }
  }
  if (/^(?:drink_|alcohol_|pet_|flower_|plants$|personal_|hair_body$|sun_care$|hygiene$|supplements$|tobacco_)/.test(comparisonGroup || '')) {
    const protectedFallback = GROUP_TYPE_FALLBACK[comparisonGroup];
    if (protectedFallback) return { typeZh: protectedFallback[0], useZh: protectedFallback[1] };
  }
  for (const [pattern, [typeZh, useZh]] of GENERAL_TYPE_RULES) if (pattern.test(headingText)) return { typeZh, useZh };
  for (const [pattern, [typeZh, useZh]] of GENERAL_TYPE_RULES) if (pattern.test(text)) return { typeZh, useZh };
  const fallback = GROUP_TYPE_FALLBACK[comparisonGroup];
  if (fallback) return { typeZh: fallback[0], useZh: fallback[1] };
  return null;
}

function preciseLowPriorityName(originalName, originalDescription, comparisonGroup) {
  const inferred = inferLowPriorityType(originalName, originalDescription, comparisonGroup);
  if (!inferred) return null;
  return inferred.typeZh;
}

const normalizeDash = value => String(value || '').replace(/\s+/g, ' ').replace(/\s*[-–]\s*/g, '–').trim();

function collectUsefulFactsZh(originalDescription, comparisonGroup, originalName = '') {
  const raw = String(originalDescription || '').replace(/[\r\n]+/g, ' ');
  const text = normalize(raw);
  const facts = [];
  const add = value => { if (value && !facts.includes(value)) facts.push(value); };

  const pack = raw.match(/\b(\d+)\s*[- ]?pak\b/i);
  if (pack) add(`${pack[1]} 件装`);
  if (/flere varianter|frit valg/.test(text)) {
    if (comparisonGroup.startsWith('clothing_')) add('有多种款式或颜色可选');
    else if (/^(?:drink_|alcohol_)/.test(comparisonGroup)) add('有多种口味或品种可选');
    else if (/^(?:home_|electronics_|leisure_)/.test(comparisonGroup)) add('有多个款式或型号可选');
    else if (comparisonGroup === 'other_offer') add('同一促销包含多个选项');
    else add('有多个选项可选');
  }

  if (comparisonGroup.startsWith('clothing_')) {
    const sizeToken = '(?:\\d{1,2}XL|XXXL|XXL|XL|XS|S|M|L|\\d{1,3})';
    const sizeEnd = '(?:\\s*cm\\b)?(?=\\s*(?:[.,;)]|$))';
    const explicitSize = raw.match(new RegExp(
      `\\bStr\\.?\\s*:?\\s*(${sizeToken}(?:\\s*[-–/]\\s*${sizeToken}){0,3})${sizeEnd}`,
      'i',
    ));
    const heightSize = raw.match(/\b((?:62|68|74|80|86|92|98|104|110|116|122|128|134|140|146|152|158|164|170)(?:\s*[-–/]\s*(?:68|74|80|86|92|98|104|110|116|122|128|134|140|146|152|158|164|170)){1,3})(?:\s*cm)?\b/i)
      || raw.match(/\b((?:62|68|74|80|86|92|98|104|110|116|122|128|134|140|146|152|158|164|170))\s*cm\b/i);
    const namedSize = raw.match(new RegExp(
      `\\b(${sizeToken}(?:\\s*[-–/]\\s*${sizeToken}){1,3})${sizeEnd}`,
      'i',
    )) || raw.match(/\b(\d{1,2}XL|XXXL|XXL|XL|XS|S|M|L)(?=\s*(?:[.,;)]|$))/i);
    const size = explicitSize || heightSize || namedSize;
    const childHeightCode = size && /^(?:62|68|74|80|86|92|98|104|110|116|122|128|134|140|146|152|158|164|170)(?:\s*[-–/]\s*\d{2,3})+/i.test(size[1]);
    if (size) add(`尺码 ${normalizeDash(size[1])}${size === heightSize || childHeightCode || /cm/i.test(size[0]) ? ' cm 身高码' : ''}`);
    if (/100\s*%\s*(?:(?:ø|o)kologisk\s*)?bomuld/i.test(raw)) add(`${/(?:ø|o)kologisk/i.test(raw) ? '100% 有机棉' : '100% 棉'}`);
    else if (/bomuld.*polyester.*elastan/i.test(raw)) add('棉、聚酯纤维和弹性纤维混纺');
    else if (/bomuld.*elastan/i.test(raw)) add('棉和弹性纤维混纺');
    else if (/viscose.*polyamid/i.test(raw)) add('粘胶纤维和聚酰胺混纺');
    if (/vandtaet/i.test(text)) {
      const water = raw.match(/VANDTÆT\s*([\d.]+\s*MM)?/i);
      add(`防水${water?.[1] ? `等级 ${water[1]}` : ''}`.trim());
    }
    if (/refleks/i.test(text)) add('带反光细节');
  }

  if (comparisonGroup.startsWith('electronics_') || comparisonGroup === 'home_appliances') {
    const screen = raw.match(/\b(\d{1,3}(?:[.,]\d+)?)\s*[”"]/);
    if (screen) add(`${screen[1]} 英寸屏幕`);
    const ram = raw.match(/\b(\d+)\s*GB\s*(?:DDR\d\s*)?RAM\b/i);
    if (ram) add(`${ram[1]} GB 内存`);
    const storage = raw.match(/\b(\d+(?:[.,]\d+)?)\s*(TB|GB)\s*(?:PCIe\s*)?(?:NVMe\s*)?(?:SSD|harddisk|hukommelse)\b/i);
    if (storage) add(`${storage[1]} ${storage[2].toUpperCase()} 存储`);
    const power = raw.match(/\b(\d+(?:[.,]\d+)?)\s*(?:Watt|W)\b/i);
    if (power) add(`功率 ${power[1]} W`);
    const load = raw.match(/(?:Vaske|Tørre)kapacitet\s*:?\s*(\d+(?:[.,]\d+)?)\s*kg/i);
    if (load) add(`衣物容量 ${load[1]} kg`);
    const runtime = raw.match(/(?:Driftstid|op til)\s*:?\s*(?:op til\s*)?(\d+)\s*(?:min|minutter)/i);
    if (runtime) add(`续航或运行时间最长 ${runtime[1]} 分钟`);
    const suction = raw.match(/(\d[\d.]*)\s*Pa\b/i);
    if (suction) add(`吸力 ${suction[1]} Pa`);
    const noise = raw.match(/Støjniveau(?:\s*\([^)]*\))?\s*:?\s*(\d+)\s*dB/i);
    if (noise) add(`噪声 ${noise[1]} dB`);
    const room = raw.match(/(?:Max\.?\s*)?rumareal\s*:?\s*(\d+)\s*m[²2]?/i);
    if (room) add(`适用面积约 ${room[1]} m²`);
    const battery = String(originalName).match(/\b(\d[\d.]*)\s*mAh\b/i)
      || raw.match(/\b(\d[\d.]*)\s*mAh\b/i);
    if (battery) add(`${battery[1]} mAh 电池`);
    const ip = raw.match(/\bIPX?\d\b/i);
    if (ip) add(`${ip[0].toUpperCase()} 防护等级`);
    if (/bluetooth/i.test(raw)) add('支持 Bluetooth');
    if (/hdmi arc/i.test(raw)) add('支持 HDMI ARC');
    if (/aktiv stojreduktion|stojreduktion/i.test(text)) add('支持主动降噪');
  }

  if (comparisonGroup.startsWith('leisure_')) {
    const age = raw.match(/(?:Anbefalet alder|Alder)\s*:?\s*(\d+\s*[-–]\s*\d+\s*år|fra\s*\d+\s*år)/i);
    if (age) add(`建议年龄 ${normalizeDash(age[1])}`);
    const wheel = raw.match(/\b(\d{2}(?:[.,]\d+)?)\s*[”"]\s*hjul/i);
    if (wheel) add(`${wheel[1]} 英寸车轮`);
    const gears = raw.match(/Shimano\s+(\d+)\s+(indvendige|udvendige)\s+gear/i);
    if (gears) add(`Shimano ${gears[1]} 速${/indvendige/i.test(gears[2]) ? '内变速' : '外变速'}`);
    if (/aluminiumstel/i.test(text)) add('铝合金车架');
    else if (/staalstel/i.test(text)) add('钢制车架');
    const load = raw.match(/Max\.?\s*(?:bruger)?vægt\s*:?\s*(\d+)\s*kg/i);
    if (load) add(`最大承重 ${load[1]} kg`);
    const motor = raw.match(/Motor\s*:?\s*([^•.]{2,30})/i);
    if (motor) add(`电机 ${normalizeDash(motor[1])}`);
  }

  if (comparisonGroup.startsWith('home_') || comparisonGroup.startsWith('leisure_')) {
    const dimensions = raw.match(/(?:Mål\s*:?\s*)?((?:[LBHDØ]\s*:?\s*)?\d+(?:[.,]\d+)?(?:\s*[x×]\s*(?:[LBHDØ]\s*:?\s*)?\d+(?:[.,]\d+)?){1,3}\s*cm)/i);
    if (dimensions) add(`尺寸 ${normalizeDash(dimensions[1])}`);
    if (/100\s*%\s*bomuld/i.test(raw)) add('100% 棉');
    if (/rustfrit staal/i.test(text)) add('不锈钢材质');
    if (/stobt aluminium/i.test(text)) add('铸铝材质');
    const capacity = raw.match(/\b(\d+(?:[.,]\d+)?)\s*(l|liter)\b/i);
    if (capacity) add(`容量 ${capacity[1]} L`);
  }

  if (/^(?:drink_|alcohol_)/.test(comparisonGroup)) {
    const volume = raw.match(/\b(\d+(?:[.,]\d+)?)\s*(cl|ml|l|liter)\b/i);
    if (volume) add(`容量 ${volume[1]} ${volume[2].toLowerCase() === 'liter' ? 'L' : volume[2]}`);
    if (/elderflower|hyldeblomst/i.test(raw)) add('接骨木花口味');
    if (/wild berry|baer/i.test(text)) add('莓果口味');
    if (/rose/i.test(text)) add('桃红类型');
    if (/mousseux|prosecco|cava|cremant|spumante/i.test(text)) add('起泡类型');
  }

  if (/^(?:personal_|hair_body$|sun_care$|hygiene$|supplements$)/.test(comparisonGroup)) {
    const amount = raw.match(/\b(\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?)\s*(ml|g|stk)\b/i);
    if (amount) add(`规格 ${normalizeDash(amount[1])} ${amount[2].toLowerCase() === 'stk' ? '件' : amount[2].toLowerCase()}`);
    const spf = raw.match(/\bSPF\s*(\d+)\b/i);
    if (spf) add(`SPF ${spf[1]}`);
  }

  if (comparisonGroup === 'plants' || comparisonGroup === 'flower_bouquet') {
    const height = raw.match(/Højde\s*(\d+\s*[-–]\s*\d+|\d+)\s*cm/i);
    if (height) add(`株高 ${normalizeDash(height[1])} cm`);
    const pot = raw.match(/Pottestr\.?\s*(\d+(?:[.,]\d+)?)\s*cm/i);
    if (pot) add(`花盆直径 ${pot[1]} cm`);
  }
  return facts.slice(0, 4);
}

function specificLowPriorityDescription(originalName, originalDescription, comparisonGroup) {
  if (!LOW_PRIORITY_GROUP.test(comparisonGroup || '')) return null;
  const inferred = inferLowPriorityType(originalName, originalDescription, comparisonGroup);
  if (!inferred) return null;
  const facts = collectUsefulFactsZh(originalDescription, comparisonGroup, originalName);
  const statements = [`这是${inferred.typeZh}，${inferred.useZh}`];
  if (facts.length) statements.push(facts.join('；'));
  if (comparisonGroup.startsWith('alcohol_')) statements.push('含酒精，仅供符合丹麦年龄规定的成年人');
  if (comparisonGroup.startsWith('tobacco_')) statements.push('含烟草或尼古丁，会危害健康并可能导致依赖');
  if (comparisonGroup === 'pet_cat') statements.push('仅供猫食用或使用');
  if (comparisonGroup === 'pet_dog') statements.push('仅供犬只食用或使用');
  return `${statements.join('。')}。`;
}

export function danishProductNameZh(originalName, comparisonGroup, originalDescription = '') {
  const text = normalize(originalName);
  for (const [pattern, nameZh] of DANISH_PRODUCT_FORM_TITLES) if (pattern.test(text)) return nameZh;
  if (comparisonGroup.startsWith('drink_')) {
    const soda = sodaIdentity(originalName);
    if (soda) return soda.titleZh;
  }
  if (comparisonGroup.startsWith('alcohol_')) {
    const alcohol = alcoholIdentity(originalName, originalDescription, comparisonGroup);
    if (alcohol) return alcohol.titleZh;
  }
  if (comparisonGroup === 'ready_meal') {
    const meal = readyMealIdentity(originalName, originalDescription, comparisonGroup);
    if (meal) return meal.titleZh;
  }
  if (/^(?:personal_|hair_body$|sun_care$|hygiene$|supplements$)/.test(comparisonGroup || '')) {
    return preciseLowPriorityName(originalName, originalDescription, comparisonGroup) || GROUP_DEFAULTS[comparisonGroup];
  }
  if (LOW_PRIORITY_GROUP.test(comparisonGroup || '')) {
    return preciseLowPriorityName(originalName, originalDescription, comparisonGroup) || `${originalName}（${GROUP_DEFAULTS[comparisonGroup]}）`;
  }
  for (const [pattern, nameZh] of DANISH_TITLES) if (pattern.test(text)) return nameZh;
  if (ORIGINAL_NAME_FALLBACK_GROUPS.has(comparisonGroup)) {
    return preciseLowPriorityName(originalName, originalDescription, comparisonGroup) || `${originalName}（${GROUP_DEFAULTS[comparisonGroup]}）`;
  }
  return GROUP_DEFAULTS[comparisonGroup] || '商品（请核对原名）';
}

export function specificDanishDescription(originalName, originalDescription = '', comparisonGroup = '') {
  const text = normalize(originalName);
  for (const [pattern, descriptionZh] of SPECIFIC_DESCRIPTIONS) if (pattern.test(text)) return descriptionZh;
  if (comparisonGroup.startsWith('drink_')) {
    const soda = sodaIdentity(originalName);
    if (soda) return soda.descriptionZh;
  }
  if (comparisonGroup.startsWith('alcohol_')) {
    const alcohol = alcoholIdentity(originalName, originalDescription, comparisonGroup);
    if (alcohol) return alcohol.descriptionZh;
  }
  if (comparisonGroup === 'ready_meal') {
    const meal = readyMealIdentity(originalName, originalDescription, comparisonGroup);
    if (meal) return meal.descriptionZh;
  }
  return specificLowPriorityDescription(originalName, originalDescription, comparisonGroup);
}

const ENGLISH_TITLES = [
  title(/russet potatoes?/, 'Russet 褐皮土豆'), title(/sweet potatoes?.*butter/, '黄油调味红薯配菜'), title(/potatoes?/, '新鲜土豆'),
  title(/peaches?.*nectarines?|nectarines?.*peaches?/, '桃或油桃'), title(/plums?/, '李子'), title(/strawberries?/, '草莓'), title(/blueberries?/, '蓝莓'), title(/watermelon/, '西瓜'), title(/avocados?/, '牛油果'), title(/bananas?/, '香蕉'), title(/\bapples?\b/, '苹果'), title(/grapes?/, '葡萄'),
  title(/whole young chicken/, '整只嫩鸡'), title(/chicken.*(?:sub|wrap)|(?:sub|wrap).*chicken/, '鸡肉三明治或卷饼'), title(/popcorn chicken/, '爆米花鸡块'), title(/breaded chicken breasts?/, '裹粉鸡胸肉'), title(/parmesan chicken|chicken bites?/, '帕玛森裹粉鸡肉'), title(/chicken breasts?|chicken cutlets?/, '鸡胸肉'), title(/chicken thighs?|drumsticks?/, '鸡腿肉'), title(/ground chicken/, '鸡肉末'), title(/fried chicken|chicken tenders?/, '熟制或裹粉鸡肉'),
  title(/ground beef|ground chuck/, '牛肉末'), title(/beef burgers?/, '牛肉汉堡饼'), title(/ribeye|sirloin|steak/, '牛排'), title(/beef roast|chuck roast|brisket/, '整块烤牛肉'),
  title(/ground pork/, '猪肉末'), title(/pork tenderloin/, '猪里脊'), title(/pork chops?/, '猪排'), title(/pork meatballs?/, '猪肉丸'), title(/pulled pork/, '手撕猪肉'), title(/turkey bacon/, '火鸡培根'), title(/turkey breast/, '烤火鸡胸冷切'), title(/pepperoni/, '意式辣香肠片'), title(/black forest ham|\bham\b/, '火腿冷切'), title(/meat sticks?/, '肉条零食'), title(/sausage/, '香肠'), title(/bacon/, '猪肉培根'),
  title(/salmon burgers?/, '三文鱼汉堡饼'), title(/salmon|sockeye/, '三文鱼'), title(/shrimp|prawns?/, '虾'), title(/tuna.*canned|canned tuna/, '金枪鱼罐头'), title(/tuna|swordfish/, '金枪鱼或剑鱼排'),
  title(/greek yogurt/, '希腊酸奶'), title(/yogurt|yoghurt/, '酸奶'), title(/cheez-it|cheese crackers?/, 'Cheez-It 奶酪味咸饼干'), title(/cream cheese spread/, '奶油奶酪抹酱'), title(/mozzarella/, '马苏里拉奶酪'), title(/cheddar/, '切达奶酪'), title(/cheese/, '奶酪'), title(/eggs?/, '鸡蛋'),
  title(/croissants?/, '可颂'), title(/bagels?/, '贝果'), title(/bread/, '面包'), title(/cookies?/, '饼干'), title(/cake/, '蛋糕'), title(/pie/, '派'),
  title(/ice cream/, '冰淇淋'), title(/pizza/, '冷冻披萨'), title(/egg rolls?|dumplings?/, '冷冻春卷或饺子'),
  title(/rice krispies treats/, '米香棉花糖谷物棒'), title(/chips?|crisps?/, '薯片或咸味脆片'), title(/candy|chocolate/, '糖果或巧克力'),
  title(/coffee/, '咖啡'), title(/tea/, '茶'), title(/juice/, '果汁'), title(/water enhancer/, '饮水调味液'), title(/sparkling water|water/, '饮用水或气泡水'),
];

export function englishProductNameZh(originalName, comparisonGroup, groupNameZh = null) {
  const text = normalize(originalName);
  for (const [pattern, nameZh] of ENGLISH_TITLES) if (pattern.test(text)) return nameZh;
  return groupNameZh || GROUP_DEFAULTS[comparisonGroup] || '商品（请核对英文原名）';
}

const SPECIFIC_ENGLISH_DESCRIPTIONS = [
  [/popcorn chicken/, '裹粉爆米花鸡块，是一口大小的调味鸡肉小食；通常已预炸或预熟，需按包装说明用烤箱或空气炸锅复热，不是生鲜鸡肉。'],
  [/breaded chicken breasts?/, '裹粉鸡胸肉，通常已经调味并预炸或预熟；需按包装说明用烤箱或空气炸锅加热，不是未经处理的生鲜鸡胸。'],
  [/cheez-it|cheese crackers?/, '奶酪风味烘烤咸饼干，开袋即食；商品主体是脆饼，不是奶酪块或奶酪棒。'],
  [/cream cheese spread/, '冷藏奶油奶酪抹酱，质地柔软，可抹贝果或面包、做三明治或用于烘焙；不是切片或块状餐桌奶酪。'],
  [/turkey bacon/, '火鸡培根，是用火鸡肉制成的培根风格薄片，通常比猪培根更瘦；可煎脆后配早餐、三明治或沙拉，不与猪肉培根混比。'],
  [/ovengold roasted turkey breast/, '烤火鸡胸冷切肉，可直接夹三明治、卷饼或搭配沙拉；这是熟制火鸡胸切片，不是生鲜火鸡胸，也不与火腿或香肠混比。'],
  [/black forest ham/, '黑森林风味火腿冷切，通常带烟熏和咸香味，可直接夹面包、卷饼或搭配早餐；不与火鸡冷切或香肠混比。'],
  [/pepperoni/, '意式辣香肠薄片，通常用于披萨、三明治或零食拼盘；属于高盐熟制肉，不与普通鲜香肠或火腿冷切混比。'],
  [/meat sticks?/, '调味肉条零食，可直接食用；需按包装确认肉种、辣度和单条重量，不与香肠或冷切火腿混比。'],
  [/chicken.*(?:sub|wrap)|(?:sub|wrap).*chicken/, '鸡肉三明治或卷饼，是包含面包/饼皮、鸡肉和配菜的即食餐；不与单独售卖的鸡胸肉或裹粉鸡块比较最低价。'],
  [/parmesan chicken/, '帕玛森风味裹粉鸡肉块或鸡胸薄片，通常已经调味，适合烤箱或空气炸锅加热；不与生鲜鸡胸肉混比。'],
];

export function specificEnglishDescription(originalName) {
  const text = normalize(originalName);
  for (const [pattern, descriptionZh] of SPECIFIC_ENGLISH_DESCRIPTIONS) if (pattern.test(text)) return descriptionZh;
  return null;
}
