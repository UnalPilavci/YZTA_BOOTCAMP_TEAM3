import type { RiskLevel } from '@/services/analysis/types';

export type LocalizedText = { tr: string; en: string };

export type DictionaryCategory =
  | 'color'
  | 'preservative'
  | 'antioxidant'
  | 'acidity'
  | 'thickener'
  | 'emulsifier'
  | 'stabilizer'
  | 'flavorEnhancer'
  | 'sweetener'
  | 'other';

export type DictionaryEntry = {
  id: string;
  code: string;
  category: DictionaryCategory;
  risk: RiskLevel;
  name: LocalizedText;
  what: LocalizedText;
  foundIn: LocalizedText;
  source: string;
  aliases?: string[];
};

export const DICTIONARY: DictionaryEntry[] = [
  {
    id: 'e100',
    code: 'E100',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Kurkumin', en: 'Curcumin' },
    what: {
      tr: 'Zerdeçal kökünden elde edilen doğal sarı renklendirici. Güvenli kabul edilir.',
      en: 'A natural yellow colour extracted from turmeric root. Considered safe.',
    },
    foundIn: {
      tr: 'Hardal, çorbalar, süt ürünleri, unlu mamuller',
      en: 'Mustard, soups, dairy products, baked goods',
    },
    source: 'EFSA',
    aliases: ['kurkumin', 'curcumin', 'zerdeçal', 'turmeric'],
  },
  {
    id: 'e101',
    code: 'E101',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Riboflavin (B2 Vitamini)', en: 'Riboflavin (Vitamin B2)' },
    what: {
      tr: 'B2 vitamininin renklendirici olarak kullanımı; sarı-turuncu ton verir. Güvenli kabul edilir.',
      en: 'Vitamin B2 used as a yellow-orange colour. Considered safe.',
    },
    foundIn: {
      tr: 'Kahvaltılık gevrekler, soslar, işlenmiş peynir',
      en: 'Breakfast cereals, sauces, processed cheese',
    },
    source: 'EFSA',
    aliases: ['riboflavin', 'b2 vitamini', 'vitamin b2'],
  },
  {
    id: 'e102',
    code: 'E102',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Tartrazin', en: 'Tartrazine' },
    what: {
      tr: 'Sentetik sarı azo boyası. Bazı çocuklarda aktivite ve dikkat üzerine olası etkiler nedeniyle AB’de uyarı etiketi zorunludur; duyarlı kişilerde reaksiyon görülebilir.',
      en: 'A synthetic yellow azo dye. Carries a mandatory EU warning about possible effects on activity and attention in children; sensitive individuals may react.',
    },
    foundIn: {
      tr: 'Gazlı içecekler, şekerlemeler, cipsler, toz içecekler',
      en: 'Soft drinks, candies, chips, powdered drinks',
    },
    source: 'EFSA',
    aliases: ['tartrazin', 'tartrazine', 'yellow 5'],
  },
  {
    id: 'e104',
    code: 'E104',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Kinolin Sarısı', en: 'Quinoline Yellow' },
    what: {
      tr: 'Sentetik sarı boya. Çocuklarda aktivite üzerine olası etkiler nedeniyle AB’de uyarı etiketiyle satılır; bazı ülkelerde kısıtlıdır.',
      en: 'A synthetic yellow dye. Sold with an EU warning about possible effects on children’s activity; restricted in some countries.',
    },
    foundIn: {
      tr: 'Şekerlemeler, içecekler, jöleler',
      en: 'Candies, beverages, jellies',
    },
    source: 'EFSA',
    aliases: ['kinolin sarısı', 'quinoline yellow'],
  },
  {
    id: 'e110',
    code: 'E110',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Gün Batımı Sarısı', en: 'Sunset Yellow' },
    what: {
      tr: 'Sentetik turuncu-sarı azo boyası. AB’de çocuklarda aktivite üzerine olası etkiler için uyarı etiketi taşır.',
      en: 'A synthetic orange-yellow azo dye. Carries the EU warning about possible effects on children’s activity.',
    },
    foundIn: {
      tr: 'Portakallı içecekler, şekerlemeler, tatlı karışımları',
      en: 'Orange drinks, candies, dessert mixes',
    },
    source: 'EFSA',
    aliases: ['gün batımı sarısı', 'sunset yellow', 'yellow 6'],
  },
  {
    id: 'e120',
    code: 'E120',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Karmin (Koşnil)', en: 'Carmine (Cochineal)' },
    what: {
      tr: 'Koşnil böceğinden elde edilen doğal kırmızı boya. Nadiren alerjik reaksiyona yol açabilir; vejetaryen/vegan ve bazı dini hassasiyetlere uygun değildir.',
      en: 'A natural red dye from the cochineal insect. Can rarely cause allergic reactions; not suitable for vegetarians/vegans and some religious diets.',
    },
    foundIn: {
      tr: 'Yoğurtlar, şekerlemeler, işlenmiş et, içecekler',
      en: 'Yogurts, candies, processed meat, beverages',
    },
    source: 'EFSA',
    aliases: ['karmin', 'carmine', 'koşnil', 'cochineal', 'karminik asit'],
  },
  {
    id: 'e122',
    code: 'E122',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Azorubin', en: 'Azorubine (Carmoisine)' },
    what: {
      tr: 'Sentetik kırmızı azo boyası. AB’de çocuklarda aktivite üzerine olası etkiler için uyarı etiketi taşır.',
      en: 'A synthetic red azo dye. Carries the EU warning about possible effects on children’s activity.',
    },
    foundIn: {
      tr: 'Jöle, şekerleme, aromalı yoğurt ve içecekler',
      en: 'Jellies, candies, flavoured yogurts and drinks',
    },
    source: 'EFSA',
    aliases: ['azorubin', 'azorubine', 'carmoisine', 'karmuazin'],
  },
  {
    id: 'e124',
    code: 'E124',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Ponso 4R', en: 'Ponceau 4R' },
    what: {
      tr: 'Sentetik kırmızı azo boyası. AB’de uyarı etiketi zorunludur; ABD’de gıdada kullanımına izin verilmez.',
      en: 'A synthetic red azo dye. Carries the mandatory EU warning; not permitted in food in the US.',
    },
    foundIn: {
      tr: 'Şekerlemeler, tatlılar, işlenmiş meyve ürünleri',
      en: 'Candies, desserts, processed fruit products',
    },
    source: 'EFSA',
    aliases: ['ponso 4r', 'ponceau 4r'],
  },
  {
    id: 'e129',
    code: 'E129',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Allura Kırmızısı', en: 'Allura Red' },
    what: {
      tr: 'Sentetik kırmızı azo boyası. AB’de çocuklarda aktivite üzerine olası etkiler için uyarı etiketi taşır.',
      en: 'A synthetic red azo dye. Carries the EU warning about possible effects on children’s activity.',
    },
    foundIn: {
      tr: 'Gazlı içecekler, şekerlemeler, kahvaltılık gevrekler',
      en: 'Soft drinks, candies, breakfast cereals',
    },
    source: 'EFSA',
    aliases: ['allura', 'allura kırmızısı', 'allura red', 'red 40'],
  },
  {
    id: 'e133',
    code: 'E133',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Parlak Mavi FCF', en: 'Brilliant Blue FCF' },
    what: {
      tr: 'Sentetik mavi boya. Mevcut kullanım düzeylerinde güvenli kabul edilir.',
      en: 'A synthetic blue dye. Considered safe at current use levels.',
    },
    foundIn: {
      tr: 'İçecekler, şekerlemeler, dondurma',
      en: 'Beverages, candies, ice cream',
    },
    source: 'EFSA',
    aliases: ['parlak mavi', 'brilliant blue', 'blue 1'],
  },
  {
    id: 'e150d',
    code: 'E150d',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Amonyum Sülfit Karameli', en: 'Sulphite Ammonia Caramel' },
    what: {
      tr: 'Kolalarda kullanılan koyu karamel rengi. Üretim yan ürünü 4-MEI tartışmalıdır; EFSA mevcut düzeyleri güvenli bulur ancak yoğun tüketimde dikkat önerilir.',
      en: 'The dark caramel colour used in colas. Its by-product 4-MEI is debated; EFSA finds current levels safe, but moderation is sensible with heavy consumption.',
    },
    foundIn: {
      tr: 'Kola tipi içecekler, soslar, bira',
      en: 'Cola drinks, sauces, beer',
    },
    source: 'EFSA',
    aliases: ['karamel', 'caramel colour', 'caramel color', 'e150'],
  },
  {
    id: 'e160a',
    code: 'E160a',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Beta-Karoten', en: 'Beta-Carotene' },
    what: {
      tr: 'Havuç gibi bitkilerde doğal bulunan turuncu pigment; vücutta A vitaminine dönüşür. Güvenli kabul edilir.',
      en: 'An orange pigment found naturally in plants like carrots; converts to vitamin A in the body. Considered safe.',
    },
    foundIn: {
      tr: 'Margarin, meyve suları, süt ürünleri',
      en: 'Margarine, fruit juices, dairy products',
    },
    source: 'EFSA',
    aliases: ['beta karoten', 'beta-carotene', 'karoten', 'carotene'],
  },
  {
    id: 'e160c',
    code: 'E160c',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Paprika Ekstresi', en: 'Paprika Extract' },
    what: {
      tr: 'Kırmızı biberden elde edilen doğal turuncu-kırmızı renklendirici. Güvenli kabul edilir.',
      en: 'A natural orange-red colour extracted from red peppers. Considered safe.',
    },
    foundIn: {
      tr: 'Cips ve çerezler, soslar, işlenmiş et',
      en: 'Chips and snacks, sauces, processed meat',
    },
    source: 'EFSA',
    aliases: ['paprika', 'kapsantin', 'capsanthin'],
  },
  {
    id: 'e162',
    code: 'E162',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Pancar Kırmızısı', en: 'Beetroot Red' },
    what: {
      tr: 'Kırmızı pancardan elde edilen doğal renklendirici. Güvenli kabul edilir.',
      en: 'A natural colour obtained from red beets. Considered safe.',
    },
    foundIn: {
      tr: 'Dondurma, yoğurt, şekerlemeler',
      en: 'Ice cream, yogurt, candies',
    },
    source: 'EFSA',
    aliases: ['pancar kırmızısı', 'beetroot red', 'betanin'],
  },
  {
    id: 'e171',
    code: 'E171',
    category: 'color',
    risk: 'risk',
    name: { tr: 'Titanyum Dioksit', en: 'Titanium Dioxide' },
    what: {
      tr: 'Beyazlatıcı pigment. EFSA 2021’de genotoksisite endişesini dışlayamadığı için AB’de 2022’den beri gıdada YASAKTIR; başka ülkelerde hâlâ kullanılabilir.',
      en: 'A whitening pigment. BANNED in EU food since 2022 after EFSA (2021) could not rule out genotoxicity concerns; still permitted in some countries.',
    },
    foundIn: {
      tr: 'Sakız, beyaz kaplamalı şekerlemeler, bazı soslar',
      en: 'Chewing gum, white-coated candies, some sauces',
    },
    source: 'EFSA 2021',
    aliases: ['titanyum dioksit', 'titanium dioxide', 'tio2'],
  },
  {
    id: 'e172',
    code: 'E172',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Demir Oksitler', en: 'Iron Oxides' },
    what: {
      tr: 'Sarıdan siyaha ton veren mineral pigmentler. Güvenli kabul edilir.',
      en: 'Mineral pigments giving yellow to black tones. Considered safe.',
    },
    foundIn: {
      tr: 'Kaplamalı şekerlemeler, balık ezmeleri, dekor ürünleri',
      en: 'Coated candies, fish pastes, decorations',
    },
    source: 'EFSA',
    aliases: ['demir oksit', 'iron oxide'],
  },

  {
    id: 'e200',
    code: 'E200',
    category: 'preservative',
    risk: 'safe',
    name: { tr: 'Sorbik Asit', en: 'Sorbic Acid' },
    what: {
      tr: 'Küf ve maya oluşumunu engelleyen koruyucu. Vücutta yağ asidi gibi metabolize olur; güvenli kabul edilir.',
      en: 'A preservative that prevents mould and yeast growth. Metabolised like a fatty acid; considered safe.',
    },
    foundIn: {
      tr: 'Peynir, unlu mamuller, kuru meyve, soslar',
      en: 'Cheese, baked goods, dried fruit, sauces',
    },
    source: 'EFSA',
    aliases: ['sorbik asit', 'sorbic acid'],
  },
  {
    id: 'e202',
    code: 'E202',
    category: 'preservative',
    risk: 'safe',
    name: { tr: 'Potasyum Sorbat', en: 'Potassium Sorbate' },
    what: {
      tr: 'Sorbik asidin tuzu; küf ve mayaya karşı yaygın koruyucu. Güvenli kabul edilir.',
      en: 'The salt of sorbic acid; a common preservative against mould and yeast. Considered safe.',
    },
    foundIn: {
      tr: 'İçecekler, peynir, margarin, soslar',
      en: 'Beverages, cheese, margarine, sauces',
    },
    source: 'EFSA',
    aliases: ['potasyum sorbat', 'potassium sorbate'],
  },
  {
    id: 'e211',
    code: 'E211',
    category: 'preservative',
    risk: 'caution',
    name: { tr: 'Sodyum Benzoat', en: 'Sodium Benzoate' },
    what: {
      tr: 'Asidik gıdalarda bakteri/maya önleyici. C vitamini ile birlikte eser miktarda benzen oluşturabilir; bazı renklendiricilerle kombinasyonu çocuklarda aktivite açısından incelenmiştir.',
      en: 'Prevents bacteria/yeast in acidic foods. Can form trace benzene with vitamin C; combinations with certain colours have been studied for effects on children’s activity.',
    },
    foundIn: {
      tr: 'Gazlı içecekler, turşu, soslar, meyve suları',
      en: 'Soft drinks, pickles, sauces, fruit juices',
    },
    source: 'EFSA',
    aliases: ['sodyum benzoat', 'sodium benzoate', 'benzoat', 'benzoate'],
  },
  {
    id: 'e220',
    code: 'E220',
    category: 'preservative',
    risk: 'caution',
    name: { tr: 'Kükürt Dioksit', en: 'Sulphur Dioxide' },
    what: {
      tr: 'Renk koruyucu ve antimikrobiyal. Astımlı ve sülfite duyarlı kişilerde solunum reaksiyonlarına yol açabilir; belirli eşik üstünde alerjen etiketi zorunludur.',
      en: 'A colour-preserving antimicrobial. Can trigger respiratory reactions in asthmatics and sulphite-sensitive people; allergen labelling is mandatory above a threshold.',
    },
    foundIn: {
      tr: 'Kuru kayısı ve kuru meyveler, şarap, sirke',
      en: 'Dried apricots and fruits, wine, vinegar',
    },
    source: 'EFSA',
    aliases: ['kükürt dioksit', 'sulphur dioxide', 'sulfur dioxide', 'sülfit', 'sulphite', 'sulfite'],
  },
  {
    id: 'e223',
    code: 'E223',
    category: 'preservative',
    risk: 'caution',
    name: { tr: 'Sodyum Metabisülfit', en: 'Sodium Metabisulphite' },
    what: {
      tr: 'Sülfit ailesinden koruyucu ve antioksidan. Sülfite duyarlı kişilerde (özellikle astımlılarda) reaksiyona yol açabilir.',
      en: 'A preservative and antioxidant from the sulphite family. May cause reactions in sulphite-sensitive people, especially asthmatics.',
    },
    foundIn: {
      tr: 'Kuru meyve, patates ürünleri, şarap',
      en: 'Dried fruit, potato products, wine',
    },
    source: 'EFSA',
    aliases: ['sodyum metabisülfit', 'sodium metabisulphite', 'metabisülfit', 'metabisulfite'],
  },
  {
    id: 'e250',
    code: 'E250',
    category: 'preservative',
    risk: 'risk',
    name: { tr: 'Sodyum Nitrit', en: 'Sodium Nitrite' },
    what: {
      tr: 'İşlenmiş ette botulizmi önler ve pembe rengi korur. Pişirme sırasında nitrozamin oluşumuyla ilişkilidir; IARC işlenmiş eti Grup 1 kanserojen sınıfına almıştır. Tüketimi sınırlamak önerilir.',
      en: 'Prevents botulism and preserves the pink colour in processed meat. Linked to nitrosamine formation during cooking; IARC classifies processed meat as Group 1 carcinogenic. Limiting intake is advised.',
    },
    foundIn: {
      tr: 'Sosis, salam, sucuk, jambon, pastırma',
      en: 'Sausages, salami, cured and deli meats, ham',
    },
    source: 'EFSA · IARC',
    aliases: ['sodyum nitrit', 'sodium nitrite', 'nitrit', 'nitrite'],
  },
  {
    id: 'e251',
    code: 'E251',
    category: 'preservative',
    risk: 'caution',
    name: { tr: 'Sodyum Nitrat', en: 'Sodium Nitrate' },
    what: {
      tr: 'Kürlenmiş et ve bazı peynirlerde koruyucu; vücutta kısmen nitrite dönüşür. İşlenmiş et tüketimini sınırlamak önerilir.',
      en: 'A preservative in cured meats and some cheeses; partially converts to nitrite in the body. Limiting processed meat intake is advised.',
    },
    foundIn: {
      tr: 'Kürlenmiş etler, bazı sert peynirler',
      en: 'Cured meats, some hard cheeses',
    },
    source: 'EFSA',
    aliases: ['sodyum nitrat', 'sodium nitrate', 'nitrat', 'nitrate'],
  },
  {
    id: 'e282',
    code: 'E282',
    category: 'preservative',
    risk: 'safe',
    name: { tr: 'Kalsiyum Propiyonat', en: 'Calcium Propionate' },
    what: {
      tr: 'Ekmekte küf önleyici. Doğal olarak bazı peynirlerde de bulunur; güvenli kabul edilir.',
      en: 'A mould inhibitor in bread. Also occurs naturally in some cheeses; considered safe.',
    },
    foundIn: {
      tr: 'Paketli ekmek, unlu mamuller, tortilla',
      en: 'Packaged bread, baked goods, tortillas',
    },
    source: 'EFSA',
    aliases: ['kalsiyum propiyonat', 'calcium propionate', 'propiyonat', 'propionate'],
  },

  {
    id: 'e300',
    code: 'E300',
    category: 'antioxidant',
    risk: 'safe',
    name: { tr: 'Askorbik Asit (C Vitamini)', en: 'Ascorbic Acid (Vitamin C)' },
    what: {
      tr: 'C vitamininin antioksidan olarak kullanımı; renk kaybını ve acılaşmayı önler. Güvenli kabul edilir.',
      en: 'Vitamin C used as an antioxidant; prevents discolouration and rancidity. Considered safe.',
    },
    foundIn: {
      tr: 'Meyve suları, unlu mamuller, işlenmiş et',
      en: 'Fruit juices, baked goods, processed meat',
    },
    source: 'EFSA',
    aliases: ['askorbik asit', 'ascorbic acid', 'c vitamini', 'vitamin c'],
  },
  {
    id: 'e306',
    code: 'E306',
    category: 'antioxidant',
    risk: 'safe',
    name: { tr: 'Tokoferoller (E Vitamini)', en: 'Tocopherols (Vitamin E)' },
    what: {
      tr: 'Doğal E vitamini karışımı; yağların acılaşmasını geciktirir. Güvenli kabul edilir.',
      en: 'A natural vitamin E mixture; delays fats going rancid. Considered safe.',
    },
    foundIn: {
      tr: 'Bitkisel yağlar, margarin, çerezler',
      en: 'Vegetable oils, margarine, snacks',
    },
    source: 'EFSA',
    aliases: ['tokoferol', 'tocopherol', 'e vitamini', 'vitamin e'],
  },
  {
    id: 'e319',
    code: 'E319',
    category: 'antioxidant',
    risk: 'caution',
    name: { tr: 'TBHQ', en: 'TBHQ' },
    what: {
      tr: 'Sentetik antioksidan (tersiyer bütilhidrokinon). Kızartma yağlarının ömrünü uzatır; yüksek dozlarda hayvan çalışmalarındaki bulgular nedeniyle alım sınırı belirlenmiştir.',
      en: 'A synthetic antioxidant (tert-butylhydroquinone) that extends frying-oil life. An intake limit is set due to findings in high-dose animal studies.',
    },
    foundIn: {
      tr: 'Kızartmalık yağlar, hazır çerezler, dondurulmuş gıdalar',
      en: 'Frying oils, packaged snacks, frozen foods',
    },
    source: 'EFSA',
    aliases: ['tbhq', 'tersiyer bütilhidrokinon', 'tert-butylhydroquinone'],
  },
  {
    id: 'e320',
    code: 'E320',
    category: 'antioxidant',
    risk: 'caution',
    name: { tr: 'BHA', en: 'BHA' },
    what: {
      tr: 'Sentetik antioksidan (bütillenmiş hidroksianisol). IARC tarafından Grup 2B (insanda olası kanserojen) olarak sınıflandırılmıştır; izin verilen düzeylerde kullanımı sürmektedir.',
      en: 'A synthetic antioxidant (butylated hydroxyanisole). Classified IARC Group 2B (possibly carcinogenic to humans); still permitted at regulated levels.',
    },
    foundIn: {
      tr: 'Sakız, çerezler, hazır çorbalar, yağlar',
      en: 'Chewing gum, snacks, instant soups, fats',
    },
    source: 'EFSA · IARC 2B',
    aliases: ['bha', 'bütillenmiş hidroksianisol', 'butylated hydroxyanisole'],
  },
  {
    id: 'e321',
    code: 'E321',
    category: 'antioxidant',
    risk: 'caution',
    name: { tr: 'BHT', en: 'BHT' },
    what: {
      tr: 'Sentetik antioksidan (bütillenmiş hidroksitoluen). Yüksek doz hayvan çalışmalarındaki bulgular nedeniyle tartışmalıdır; izin verilen düzeylerde kullanılır.',
      en: 'A synthetic antioxidant (butylated hydroxytoluene). Debated due to high-dose animal findings; used at regulated levels.',
    },
    foundIn: {
      tr: 'Kahvaltılık gevrekler, sakız, yağlar, ambalaj',
      en: 'Breakfast cereals, chewing gum, fats, packaging',
    },
    source: 'EFSA',
    aliases: ['bht', 'bütillenmiş hidroksitoluen', 'butylated hydroxytoluene'],
  },
  {
    id: 'e322',
    code: 'E322',
    category: 'emulsifier',
    risk: 'safe',
    name: { tr: 'Lesitin', en: 'Lecithin' },
    what: {
      tr: 'Genellikle soya veya ayçiçeğinden elde edilen doğal emülgatör; yağ ile suyu karıştırır. Güvenli kabul edilir; soya kaynaklıysa alerjen olarak etiketlenir.',
      en: 'A natural emulsifier usually from soy or sunflower; blends oil and water. Considered safe; labelled as an allergen when soy-derived.',
    },
    foundIn: {
      tr: 'Çikolata, margarin, unlu mamuller',
      en: 'Chocolate, margarine, baked goods',
    },
    source: 'EFSA',
    aliases: ['lesitin', 'lecithin', 'soya lesitini', 'soy lecithin', 'ayçiçek lesitini', 'sunflower lecithin'],
  },
  {
    id: 'e330',
    code: 'E330',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Sitrik Asit', en: 'Citric Acid' },
    what: {
      tr: 'Narenciyede doğal bulunan asit; ekşilik verir ve rafta dayanıklılığı artırır. Güvenli kabul edilir (halk arasında "limon tuzu").',
      en: 'An acid found naturally in citrus; adds tartness and improves shelf life. Considered safe.',
    },
    foundIn: {
      tr: 'İçecekler, konserveler, şekerlemeler, reçel',
      en: 'Beverages, canned goods, candies, jam',
    },
    source: 'EFSA',
    aliases: ['sitrik asit', 'citric acid', 'limon tuzu'],
  },
  {
    id: 'e331',
    code: 'E331',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Sodyum Sitrat', en: 'Sodium Citrate' },
    what: {
      tr: 'Sitrik asidin tuzu; asitliği dengeler ve eriyik peynirlerde dokuyu sağlar. Güvenli kabul edilir.',
      en: 'The salt of citric acid; balances acidity and gives processed cheese its texture. Considered safe.',
    },
    foundIn: {
      tr: 'Eriyik peynir, içecekler, jöleler',
      en: 'Processed cheese, beverages, jellies',
    },
    source: 'EFSA',
    aliases: ['sodyum sitrat', 'sodium citrate'],
  },
  {
    id: 'e338',
    code: 'E338',
    category: 'acidity',
    risk: 'caution',
    name: { tr: 'Fosforik Asit', en: 'Phosphoric Acid' },
    what: {
      tr: 'Kolalara keskin ekşiliği veren asit. Yoğun tüketimde toplam fosfor alımını yükseltir; diş minesi ve kemik sağlığı açısından aşırıya dikkat önerilir.',
      en: 'The acid behind cola’s sharp tang. Heavy consumption raises total phosphorus intake; moderation is advised for dental enamel and bone health.',
    },
    foundIn: {
      tr: 'Kola tipi içecekler, bazı işlenmiş gıdalar',
      en: 'Cola drinks, some processed foods',
    },
    source: 'EFSA',
    aliases: ['fosforik asit', 'phosphoric acid'],
  },
  {
    id: 'e450',
    code: 'E450',
    category: 'stabilizer',
    risk: 'caution',
    name: { tr: 'Difosfatlar', en: 'Diphosphates' },
    what: {
      tr: 'Su tutma ve doku için kullanılan fosfat tuzları. EFSA toplam fosfat alımının bazı gruplarda güvenli sınıra yaklaştığını belirtir; işlenmiş gıda ağırlıklı beslenmede dikkat önerilir.',
      en: 'Phosphate salts used for water retention and texture. EFSA notes total phosphate intake approaches the safe limit in some groups; worth watching in processed-food-heavy diets.',
    },
    foundIn: {
      tr: 'İşlenmiş et, eriyik peynir, kabartma tozları, donmuş ürünler',
      en: 'Processed meat, processed cheese, baking powders, frozen foods',
    },
    source: 'EFSA 2019',
    aliases: ['difosfat', 'diphosphate', 'pirofosfat', 'pyrophosphate'],
  },
  {
    id: 'e451',
    code: 'E451',
    category: 'stabilizer',
    risk: 'caution',
    name: { tr: 'Trifosfatlar', en: 'Triphosphates' },
    what: {
      tr: 'İşlenmiş ette suyu bağlayan fosfat tuzları. Toplam fosfor alımına katkısı nedeniyle yoğun tüketimde dikkat önerilir.',
      en: 'Phosphate salts that bind water in processed meat. Moderation advised due to their contribution to total phosphorus intake.',
    },
    foundIn: {
      tr: 'Sosis-salam, dondurulmuş deniz ürünleri, eriyik peynir',
      en: 'Sausages, frozen seafood, processed cheese',
    },
    source: 'EFSA 2019',
    aliases: ['trifosfat', 'triphosphate'],
  },

  {
    id: 'e406',
    code: 'E406',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Agar', en: 'Agar' },
    what: {
      tr: 'Deniz yosunundan elde edilen jelleştirici. Güvenli kabul edilir; bitkisel jelatin alternatifidir.',
      en: 'A gelling agent from seaweed. Considered safe; a plant-based alternative to gelatine.',
    },
    foundIn: {
      tr: 'Jöleler, tatlılar, şekerlemeler',
      en: 'Jellies, desserts, candies',
    },
    source: 'EFSA',
    aliases: ['agar', 'agar-agar', 'agar agar'],
  },
  {
    id: 'e407',
    code: 'E407',
    category: 'thickener',
    risk: 'caution',
    name: { tr: 'Karagenan', en: 'Carrageenan' },
    what: {
      tr: 'Kırmızı yosundan elde edilen kıvam verici. Gıda sınıfı formu EFSA’ca güvenli kabul edilir; sindirim hassasiyeti olan kişilerde rahatsızlık bildirimleri tartışılmaktadır.',
      en: 'A thickener from red seaweed. Food-grade carrageenan is considered safe by EFSA; reports of digestive discomfort in sensitive people remain debated.',
    },
    foundIn: {
      tr: 'Sütlü tatlılar, bitkisel sütler, dondurma, işlenmiş et',
      en: 'Dairy desserts, plant milks, ice cream, processed meat',
    },
    source: 'EFSA 2018',
    aliases: ['karagenan', 'carrageenan', 'karragenan'],
  },
  {
    id: 'e410',
    code: 'E410',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Keçiboynuzu Gamı', en: 'Locust Bean Gum' },
    what: {
      tr: 'Keçiboynuzu çekirdeğinden elde edilen doğal kıvam verici. Güvenli kabul edilir.',
      en: 'A natural thickener from carob seeds. Considered safe.',
    },
    foundIn: {
      tr: 'Dondurma, krem peynir, soslar',
      en: 'Ice cream, cream cheese, sauces',
    },
    source: 'EFSA',
    aliases: ['keçiboynuzu gamı', 'locust bean gum', 'carob gum', 'harnup'],
  },
  {
    id: 'e412',
    code: 'E412',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Guar Gamı', en: 'Guar Gum' },
    what: {
      tr: 'Guar bitkisinin tohumundan elde edilen kıvam verici. Güvenli kabul edilir; çok yüksek miktarda gaz/şişkinlik yapabilir.',
      en: 'A thickener from guar plant seeds. Considered safe; very large amounts can cause bloating.',
    },
    foundIn: {
      tr: 'Dondurma, soslar, glutensiz ürünler',
      en: 'Ice cream, sauces, gluten-free products',
    },
    source: 'EFSA',
    aliases: ['guar gamı', 'guar gum', 'guar'],
  },
  {
    id: 'e414',
    code: 'E414',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Arap Zamkı', en: 'Gum Arabic' },
    what: {
      tr: 'Akasya ağacından elde edilen doğal zamk; stabilizatör ve kaplama maddesi. Güvenli kabul edilir.',
      en: 'A natural gum from acacia trees; a stabiliser and glazing agent. Considered safe.',
    },
    foundIn: {
      tr: 'Şekerlemeler, içecekler, kaplamalı ürünler',
      en: 'Candies, beverages, coated products',
    },
    source: 'EFSA',
    aliases: ['arap zamkı', 'gum arabic', 'acacia gum', 'akasya'],
  },
  {
    id: 'e415',
    code: 'E415',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Ksantan Gamı', en: 'Xanthan Gum' },
    what: {
      tr: 'Fermantasyonla üretilen kıvam verici. Güvenli kabul edilir; glutensiz fırıncılığın temel bileşenidir.',
      en: 'A thickener produced by fermentation. Considered safe; a staple of gluten-free baking.',
    },
    foundIn: {
      tr: 'Soslar, salata sosları, glutensiz ürünler, dondurma',
      en: 'Sauces, dressings, gluten-free products, ice cream',
    },
    source: 'EFSA',
    aliases: ['ksantan', 'xanthan', 'ksantan gamı', 'xanthan gum'],
  },
  {
    id: 'e420',
    code: 'E420',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Sorbitol', en: 'Sorbitol' },
    what: {
      tr: 'Şeker alkolü (poliol) tatlandırıcı ve nem tutucu. Fazla tüketimde laksatif etki ve şişkinlik yapabilir; etikette uyarı bulunur.',
      en: 'A sugar alcohol (polyol) sweetener and humectant. Excess intake can have a laxative effect and cause bloating; labels carry a warning.',
    },
    foundIn: {
      tr: 'Şekersiz sakız ve şekerlemeler, diyet ürünler',
      en: 'Sugar-free gum and candies, diet products',
    },
    source: 'EFSA',
    aliases: ['sorbitol'],
  },
  {
    id: 'e422',
    code: 'E422',
    category: 'other',
    risk: 'safe',
    name: { tr: 'Gliserol (Gliserin)', en: 'Glycerol (Glycerine)' },
    what: {
      tr: 'Nem tutucu ve yumuşatıcı. Güvenli kabul edilir.',
      en: 'A humectant and softener. Considered safe.',
    },
    foundIn: {
      tr: 'Kek ve barlar, sakız, şekerlemeler',
      en: 'Cakes and bars, chewing gum, candies',
    },
    source: 'EFSA',
    aliases: ['gliserol', 'glycerol', 'gliserin', 'glycerine', 'glycerin'],
  },
  {
    id: 'e440',
    code: 'E440',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Pektin', en: 'Pectin' },
    what: {
      tr: 'Elma ve narenciye kabuğundan elde edilen doğal jelleştirici. Güvenli kabul edilir.',
      en: 'A natural gelling agent from apple and citrus peel. Considered safe.',
    },
    foundIn: {
      tr: 'Reçel ve marmelat, jöleli şekerlemeler, yoğurt',
      en: 'Jams and marmalades, jelly candies, yogurt',
    },
    source: 'EFSA',
    aliases: ['pektin', 'pectin'],
  },
  {
    id: 'e441',
    code: 'E441',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Jelatin', en: 'Gelatine' },
    what: {
      tr: 'Hayvansal kolajenden elde edilen jelleştirici. Sağlık açısından güvenlidir; kaynağı (sığır/domuz) vejetaryen, vegan ve helal/koşer hassasiyetleri için önemlidir.',
      en: 'A gelling agent from animal collagen. Safe health-wise; its source (beef/pork) matters for vegetarian, vegan, halal and kosher diets.',
    },
    foundIn: {
      tr: 'Jöleli şekerlemeler, marshmallow, yoğurt, kapsüller',
      en: 'Gummy candies, marshmallows, yogurt, capsules',
    },
    source: 'EFSA',
    aliases: ['jelatin', 'gelatine', 'gelatin'],
  },
  {
    id: 'e466',
    code: 'E466',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Karboksimetil Selüloz (CMC)', en: 'Carboxymethyl Cellulose (CMC)' },
    what: {
      tr: 'Bitki selülozundan üretilen kıvam verici. Mevcut düzeylerde güvenli kabul edilir; emülgatörlerin bağırsak florasına etkisi aktif bir araştırma alanıdır.',
      en: 'A thickener made from plant cellulose. Considered safe at current levels; effects of emulsifiers on gut flora are an active research area.',
    },
    foundIn: {
      tr: 'Dondurma, soslar, diyet içecekler',
      en: 'Ice cream, sauces, diet drinks',
    },
    source: 'EFSA',
    aliases: ['cmc', 'karboksimetil selüloz', 'carboxymethyl cellulose', 'selüloz gamı', 'cellulose gum'],
  },
  {
    id: 'e471',
    code: 'E471',
    category: 'emulsifier',
    risk: 'safe',
    name: { tr: 'Mono- ve Digliseritler', en: 'Mono- and Diglycerides' },
    what: {
      tr: 'Yaygın emülgatör; hamuru yumuşatır, karışımı stabilize eder. Güvenli kabul edilir; kaynağı bitkisel veya hayvansal olabilir (etikette belirtilmez).',
      en: 'A very common emulsifier; softens dough and stabilises mixtures. Considered safe; may be plant- or animal-derived (not stated on labels).',
    },
    foundIn: {
      tr: 'Ekmek ve unlu mamuller, margarin, dondurma',
      en: 'Bread and baked goods, margarine, ice cream',
    },
    source: 'EFSA',
    aliases: ['mono ve digliserit', 'mono- and diglycerides', 'monogliserit', 'digliserit', 'monoglyceride', 'diglyceride'],
  },
  {
    id: 'e472e',
    code: 'E472e',
    category: 'emulsifier',
    risk: 'safe',
    name: { tr: 'DATEM', en: 'DATEM' },
    what: {
      tr: 'Hamur güçlendirici emülgatör; ekmeğin hacmini ve dokusunu iyileştirir. Güvenli kabul edilir.',
      en: 'A dough-strengthening emulsifier; improves bread volume and texture. Considered safe.',
    },
    foundIn: {
      tr: 'Ekmek, hamburger ekmeği, unlu mamuller',
      en: 'Bread, burger buns, baked goods',
    },
    source: 'EFSA',
    aliases: ['datem'],
  },
  {
    id: 'e476',
    code: 'E476',
    category: 'emulsifier',
    risk: 'safe',
    name: { tr: 'PGPR', en: 'PGPR' },
    what: {
      tr: 'Çikolatada akışkanlığı artıran, kakao yağı ihtiyacını azaltan emülgatör. Güvenli kabul edilir.',
      en: 'An emulsifier that improves chocolate flow and reduces the need for cocoa butter. Considered safe.',
    },
    foundIn: {
      tr: 'Çikolata ve kaplamalar, sürülebilir ürünler',
      en: 'Chocolate and coatings, spreads',
    },
    source: 'EFSA',
    aliases: ['pgpr', 'poligliserol polirisinoleat', 'polyglycerol polyricinoleate'],
  },

  {
    id: 'e500',
    code: 'E500',
    category: 'other',
    risk: 'safe',
    name: { tr: 'Sodyum Bikarbonat (Karbonat)', en: 'Sodium Bicarbonate (Baking Soda)' },
    what: {
      tr: 'Kabartıcı ve asitlik düzenleyici; mutfaktaki karbonatın kendisi. Güvenli kabul edilir.',
      en: 'A raising agent and acidity regulator — ordinary baking soda. Considered safe.',
    },
    foundIn: {
      tr: 'Kek ve bisküvi, kabartma tozu, gazlı içecekler',
      en: 'Cakes and biscuits, baking powder, fizzy drinks',
    },
    source: 'EFSA',
    aliases: ['karbonat', 'sodyum bikarbonat', 'sodium bicarbonate', 'baking soda', 'kabartma tozu'],
  },
  {
    id: 'e551',
    code: 'E551',
    category: 'other',
    risk: 'safe',
    name: { tr: 'Silikon Dioksit', en: 'Silicon Dioxide' },
    what: {
      tr: 'Toz ürünlerde topaklanmayı önler. Gıda sınıfı formu güvenli kabul edilir; nano form için değerlendirmeler sürmektedir.',
      en: 'Prevents caking in powdered products. The food-grade form is considered safe; evaluations of nano forms are ongoing.',
    },
    foundIn: {
      tr: 'Tuz, baharatlar, toz içecekler, hazır çorbalar',
      en: 'Salt, spices, powdered drinks, instant soups',
    },
    source: 'EFSA',
    aliases: ['silikon dioksit', 'silicon dioxide', 'silika', 'silica'],
  },

  {
    id: 'e621',
    code: 'E621',
    category: 'flavorEnhancer',
    risk: 'caution',
    name: { tr: 'Monosodyum Glutamat (MSG)', en: 'Monosodium Glutamate (MSG)' },
    what: {
      tr: 'Umami (et lezzeti) veren lezzet artırıcı. Bilimsel kurullar genel nüfus için güvenli kabul eder; hassas kişilerde baş ağrısı ve kızarma bildirimleri vardır. EFSA 2017’de alım sınırı belirlemiştir.',
      en: 'A flavour enhancer providing umami. Scientific bodies consider it safe for the general population; sensitive individuals report headaches or flushing. EFSA set an intake limit in 2017.',
    },
    foundIn: {
      tr: 'Cipsler, hazır çorbalar, bulyon, soslar, işlenmiş et',
      en: 'Chips, instant soups, bouillon, sauces, processed meat',
    },
    source: 'EFSA 2017',
    aliases: ['msg', 'monosodyum glutamat', 'monosodium glutamate', 'çin tuzu'],
  },
  {
    id: 'e627',
    code: 'E627',
    category: 'flavorEnhancer',
    risk: 'safe',
    name: { tr: 'Disodyum Guanilat', en: 'Disodium Guanylate' },
    what: {
      tr: 'Genellikle MSG ile birlikte kullanılan umami artırıcı. Güvenli kabul edilir; gut hastalarının pürin alımına dikkat etmesi önerilir.',
      en: 'An umami booster usually paired with MSG. Considered safe; gout sufferers are advised to watch purine intake.',
    },
    foundIn: {
      tr: 'Cipsler, hazır çorbalar, soslar',
      en: 'Chips, instant soups, sauces',
    },
    source: 'EFSA',
    aliases: ['disodyum guanilat', 'disodium guanylate', 'guanilat', 'guanylate'],
  },
  {
    id: 'e631',
    code: 'E631',
    category: 'flavorEnhancer',
    risk: 'safe',
    name: { tr: 'Disodyum İnosinat', en: 'Disodium Inosinate' },
    what: {
      tr: 'MSG ile sinerjik çalışan umami artırıcı. Güvenli kabul edilir; gut hastaları için pürin notu geçerlidir.',
      en: 'An umami booster synergistic with MSG. Considered safe; the purine note for gout sufferers applies.',
    },
    foundIn: {
      tr: 'Cipsler, erişte çeşnileri, hazır soslar',
      en: 'Chips, noodle seasonings, instant sauces',
    },
    source: 'EFSA',
    aliases: ['disodyum inosinat', 'disodium inosinate', 'inosinat', 'inosinate'],
  },

  {
    id: 'e950',
    code: 'E950',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Asesülfam K', en: 'Acesulfame K' },
    what: {
      tr: 'Kalorisiz yapay tatlandırıcı; şekerden ~200 kat tatlı. Belirlenen günlük alım sınırı içinde güvenli kabul edilir; DSÖ (2023) tatlandırıcıların kilo kontrolü için önerilmediğini belirtir.',
      en: 'A calorie-free artificial sweetener ~200× sweeter than sugar. Considered safe within the ADI; WHO (2023) advises sweeteners aren’t recommended for weight control.',
    },
    foundIn: {
      tr: 'Diyet içecekler, şekersiz sakız, light ürünler',
      en: 'Diet drinks, sugar-free gum, light products',
    },
    source: 'EFSA · WHO 2023',
    aliases: ['asesülfam', 'acesulfame', 'asesülfam k', 'acesulfame k', 'ace-k'],
  },
  {
    id: 'e951',
    code: 'E951',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Aspartam', en: 'Aspartame' },
    what: {
      tr: 'Yoğun yapay tatlandırıcı. EFSA günlük alım sınırı içinde güvenli değerlendirir; IARC 2023’te Grup 2B (olası kanserojen) sınıfına almıştır. Fenilketonüri hastaları için uygun DEĞİLDİR (fenilalanin içerir).',
      en: 'An intense artificial sweetener. EFSA deems it safe within the ADI; IARC classified it Group 2B (possibly carcinogenic) in 2023. NOT suitable for people with phenylketonuria (contains phenylalanine).',
    },
    foundIn: {
      tr: 'Diyet kolalar, şekersiz sakız, light yoğurtlar',
      en: 'Diet colas, sugar-free gum, light yogurts',
    },
    source: 'EFSA 2013 · IARC 2B 2023',
    aliases: ['aspartam', 'aspartame'],
  },
  {
    id: 'e952',
    code: 'E952',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Siklamat', en: 'Cyclamate' },
    what: {
      tr: 'Yapay tatlandırıcı. AB’de sınırlı düzeyde izinlidir; ABD’de 1970’ten beri yasaktır. Günlük alım sınırına dikkat önerilir.',
      en: 'An artificial sweetener. Permitted at limited levels in the EU; banned in the US since 1970. Watching the ADI is advised.',
    },
    foundIn: {
      tr: 'Masaüstü tatlandırıcılar, diyet içecekler',
      en: 'Tabletop sweeteners, diet drinks',
    },
    source: 'EFSA',
    aliases: ['siklamat', 'cyclamate', 'sodyum siklamat', 'sodium cyclamate'],
  },
  {
    id: 'e954',
    code: 'E954',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Sakarin', en: 'Saccharin' },
    what: {
      tr: 'En eski yapay tatlandırıcı. Geçmiş kanser şüpheleri insanlar için geçerli bulunmadı; günlük alım sınırı içinde güvenli kabul edilir.',
      en: 'The oldest artificial sweetener. Past cancer concerns were found not to apply to humans; considered safe within the ADI.',
    },
    foundIn: {
      tr: 'Masaüstü tatlandırıcılar, diyet ürünler',
      en: 'Tabletop sweeteners, diet products',
    },
    source: 'EFSA',
    aliases: ['sakarin', 'saccharin'],
  },
  {
    id: 'e955',
    code: 'E955',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Sukraloz', en: 'Sucralose' },
    what: {
      tr: 'Şekerden ~600 kat tatlı, kalorisiz tatlandırıcı. Günlük alım sınırı içinde güvenli kabul edilir; yüksek ısıda pişirmede ayrışabileceğine dair bulgular tartışılmaktadır.',
      en: 'A calorie-free sweetener ~600× sweeter than sugar. Considered safe within the ADI; possible breakdown at high cooking temperatures is debated.',
    },
    foundIn: {
      tr: 'Diyet içecekler, protein ürünleri, şekersiz tatlılar',
      en: 'Diet drinks, protein products, sugar-free desserts',
    },
    source: 'EFSA',
    aliases: ['sukraloz', 'sucralose'],
  },
  {
    id: 'e960',
    code: 'E960',
    category: 'sweetener',
    risk: 'safe',
    name: { tr: 'Steviol Glikozitleri (Stevya)', en: 'Steviol Glycosides (Stevia)' },
    what: {
      tr: 'Stevya bitkisinden elde edilen kalorisiz tatlandırıcı. Günlük alım sınırı içinde güvenli kabul edilir.',
      en: 'A calorie-free sweetener from the stevia plant. Considered safe within the ADI.',
    },
    foundIn: {
      tr: 'İçecekler, yoğurtlar, masaüstü tatlandırıcılar',
      en: 'Beverages, yogurts, tabletop sweeteners',
    },
    source: 'EFSA',
    aliases: ['stevya', 'stevia', 'steviol', 'steviol glikozit'],
  },
  {
    id: 'e965',
    code: 'E965',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Maltitol', en: 'Maltitol' },
    what: {
      tr: 'Şeker alkolü (poliol) tatlandırıcı. Fazla tüketimde belirgin laksatif etki yapabilir; "şekersiz" çikolataların tipik tatlandırıcısıdır.',
      en: 'A sugar alcohol (polyol) sweetener. Excess intake can have a marked laxative effect; the typical sweetener in “sugar-free” chocolate.',
    },
    foundIn: {
      tr: 'Şekersiz çikolata ve şekerlemeler, diyet tatlılar',
      en: 'Sugar-free chocolate and candies, diet desserts',
    },
    source: 'EFSA',
    aliases: ['maltitol'],
  },
  {
    id: 'e967',
    code: 'E967',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Ksilitol', en: 'Xylitol' },
    what: {
      tr: 'Diş dostu şeker alkolü; sakızlarda çürük önleyici etkisi kanıtlıdır. Fazla tüketimde laksatif etki yapabilir. Köpekler için oldukça zehirlidir — evcil hayvanlardan uzak tutun.',
      en: 'A tooth-friendly sugar alcohol with proven anti-cavity effects in gum. Excess intake can be laxative. Highly toxic to dogs — keep away from pets.',
    },
    foundIn: {
      tr: 'Şekersiz sakız, pastiller, ağız bakım ürünleri',
      en: 'Sugar-free gum, lozenges, oral care products',
    },
    source: 'EFSA',
    aliases: ['ksilitol', 'xylitol'],
  },
  {
    id: 'e968',
    code: 'E968',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Eritritol', en: 'Erythritol' },
    what: {
      tr: 'Neredeyse kalorisiz şeker alkolü; diğer poliollere göre sindirimi daha kolaydır. 2023’te kalp-damar olaylarıyla ilişki kuran gözlemsel bulgular yayımlandı; araştırmalar sürmektedir.',
      en: 'A nearly calorie-free sugar alcohol, gentler on digestion than other polyols. Observational findings linking it to cardiovascular events emerged in 2023; research is ongoing.',
    },
    foundIn: {
      tr: 'Keto/diyet ürünler, içecekler, masaüstü tatlandırıcılar',
      en: 'Keto/diet products, beverages, tabletop sweeteners',
    },
    source: 'EFSA',
    aliases: ['eritritol', 'erythritol'],
  },

  {
    id: 'e131',
    code: 'E131',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Patent Mavisi V', en: 'Patent Blue V' },
    what: {
      tr: 'Sentetik mavi boya. Genel kullanımda güvenli kabul edilir ancak duyarlı kişilerde nadiren alerjik reaksiyonlar bildirilmiştir.',
      en: 'A synthetic blue dye. Generally considered safe, though rare allergic reactions have been reported in sensitive individuals.',
    },
    foundIn: {
      tr: 'Şekerlemeler, likörler, dondurma, dekoratif kaplamalar',
      en: 'Candies, liqueurs, ice cream, decorative coatings',
    },
    source: 'EFSA',
    aliases: ['patent mavisi', 'patent blue', 'blue v'],
  },
  {
    id: 'e132',
    code: 'E132',
    category: 'color',
    risk: 'safe',
    name: { tr: 'İndigotin (İndigo Karmin)', en: 'Indigotine (Indigo Carmine)' },
    what: {
      tr: 'Sentetik mavi renklendirici. Mevcut kullanım düzeylerinde güvenli kabul edilir.',
      en: 'A synthetic blue colour. Considered safe at current use levels.',
    },
    foundIn: {
      tr: 'Şekerlemeler, dondurma, hazır tatlılar, içecekler',
      en: 'Candies, ice cream, instant desserts, drinks',
    },
    source: 'EFSA',
    aliases: ['indigotin', 'indigotine', 'indigo karmin', 'indigo carmine'],
  },
  {
    id: 'e140',
    code: 'E140',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Klorofiller', en: 'Chlorophylls' },
    what: {
      tr: 'Bitkilerden elde edilen doğal yeşil renklendirici. Güvenli kabul edilir.',
      en: 'A natural green colour derived from plants. Considered safe.',
    },
    foundIn: {
      tr: 'Şekerlemeler, soslar, yağlar, sakızlar',
      en: 'Candies, sauces, oils, chewing gum',
    },
    source: 'EFSA',
    aliases: ['klorofil', 'klorofiller', 'chlorophyll', 'chlorophylls'],
  },
  {
    id: 'e141',
    code: 'E141',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Klorofillerin Bakır Kompleksleri', en: 'Copper Complexes of Chlorophylls' },
    what: {
      tr: 'Klorofilin daha kararlı, canlı yeşil veren bakırlı hâli. Mevcut düzeylerde güvenli kabul edilir.',
      en: 'A more stable, vivid-green copper form of chlorophyll. Considered safe at current levels.',
    },
    foundIn: {
      tr: 'Şekerlemeler, bezelye konserveleri, soslar, içecekler',
      en: 'Candies, canned peas, sauces, drinks',
    },
    source: 'EFSA',
    aliases: ['bakırlı klorofil', 'copper chlorophyll'],
  },
  {
    id: 'e150a',
    code: 'E150a',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Sade Karamel', en: 'Plain Caramel' },
    what: {
      tr: 'Şekerin ısıyla karamelize edilmesiyle elde edilen kahverengi renk. Amonyak/sülfit içermez; güvenli kabul edilir.',
      en: 'Brown colour made by heating sugar. Contains no ammonia/sulphite; considered safe.',
    },
    foundIn: {
      tr: 'Ekmek, bisküvi, soslar, sirke',
      en: 'Bread, biscuits, sauces, vinegar',
    },
    source: 'EFSA',
    aliases: ['sade karamel', 'plain caramel', 'karamel'],
  },
  {
    id: 'e150c',
    code: 'E150c',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Amonyaklı Karamel', en: 'Ammonia Caramel' },
    what: {
      tr: 'Amonyak bileşikleriyle üretilen karamel rengi. Üretimde oluşabilen 4-MEI bileşiği nedeniyle sınır değerler getirilmiştir.',
      en: 'Caramel colour produced with ammonia compounds. Limits are set due to the 4-MEI compound that can form during production.',
    },
    foundIn: {
      tr: 'Bira, soslar, et suları, ekmek',
      en: 'Beer, sauces, gravies, bread',
    },
    source: 'EFSA',
    aliases: ['amonyaklı karamel', 'ammonia caramel'],
  },
  {
    id: 'e151',
    code: 'E151',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Parlak Siyah BN', en: 'Brilliant Black BN' },
    what: {
      tr: 'Sentetik siyah azo boyası. Genelde güvenli kabul edilir; azo boyalarına duyarlı kişiler dikkatli olmalıdır.',
      en: 'A synthetic black azo dye. Generally considered safe; people sensitive to azo dyes should be cautious.',
    },
    foundIn: {
      tr: 'Havyar, soslar, şekerlemeler',
      en: 'Caviar, sauces, candies',
    },
    source: 'EFSA',
    aliases: ['parlak siyah', 'brilliant black', 'black bn'],
  },
  {
    id: 'e153',
    code: 'E153',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Bitkisel Karbon', en: 'Vegetable Carbon' },
    what: {
      tr: 'Bitki kaynaklı siyah renklendirici (aktif kömür). Mevcut kullanımlarda güvenli kabul edilir.',
      en: 'A plant-based black colour (charcoal). Considered safe in current uses.',
    },
    foundIn: {
      tr: 'Şekerlemeler, peynir kaplamaları, fırın ürünleri',
      en: 'Candies, cheese coatings, bakery products',
    },
    source: 'EFSA',
    aliases: ['bitkisel karbon', 'vegetable carbon', 'aktif kömür', 'carbon black'],
  },
  {
    id: 'e155',
    code: 'E155',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Kahverengi HT', en: 'Brown HT' },
    what: {
      tr: 'Sentetik kahverengi azo boyası. Çocuklarda aktivite üzerine olası etkiler ve azo duyarlılığı nedeniyle bazı ülkelerde kısıtlıdır.',
      en: 'A synthetic brown azo dye. Restricted in some countries due to possible effects on children’s activity and azo sensitivity.',
    },
    foundIn: {
      tr: 'Çikolatalı kek, bisküvi, şekerlemeler',
      en: 'Chocolate cake, biscuits, candies',
    },
    source: 'EFSA',
    aliases: ['kahverengi ht', 'brown ht'],
  },
  {
    id: 'e160b',
    code: 'E160b',
    category: 'color',
    risk: 'caution',
    name: { tr: 'Annatto (Biksin)', en: 'Annatto (Bixin)' },
    what: {
      tr: 'Annatto tohumundan elde edilen doğal sarı-turuncu renk. Nadiren alerjik reaksiyonlara yol açabilir.',
      en: 'A natural yellow-orange colour from annatto seeds. May rarely trigger allergic reactions.',
    },
    foundIn: {
      tr: 'Peynir, tereyağı, atıştırmalıklar, tahıl gevrekleri',
      en: 'Cheese, butter, snacks, cereals',
    },
    source: 'EFSA',
    aliases: ['annatto', 'biksin', 'bixin', 'norbixin'],
  },
  {
    id: 'e160d',
    code: 'E160d',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Likopen', en: 'Lycopene' },
    what: {
      tr: 'Domateste bulunan doğal kırmızı pigment; aynı zamanda antioksidandır. Güvenli kabul edilir.',
      en: 'A natural red pigment found in tomatoes that is also an antioxidant. Considered safe.',
    },
    foundIn: {
      tr: 'Soslar, içecekler, atıştırmalıklar',
      en: 'Sauces, drinks, snacks',
    },
    source: 'EFSA',
    aliases: ['likopen', 'lycopene'],
  },
  {
    id: 'e161b',
    code: 'E161b',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Lutein', en: 'Lutein' },
    what: {
      tr: 'Yeşil yapraklı sebzeler ve kadife çiçeğinden elde edilen doğal sarı renklendirici. Güvenli kabul edilir.',
      en: 'A natural yellow colour from leafy greens and marigold. Considered safe.',
    },
    foundIn: {
      tr: 'İçecekler, süt ürünleri, soslar',
      en: 'Drinks, dairy products, sauces',
    },
    source: 'EFSA',
    aliases: ['lutein'],
  },
  {
    id: 'e163',
    code: 'E163',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Antosiyaninler', en: 'Anthocyanins' },
    what: {
      tr: 'Üzüm, kızılcık ve mor sebzelerden elde edilen doğal kırmızı-mor renklendiriciler. Güvenli kabul edilir.',
      en: 'Natural red-purple colours from grapes, cranberries and purple vegetables. Considered safe.',
    },
    foundIn: {
      tr: 'İçecekler, reçeller, şekerlemeler, yoğurtlar',
      en: 'Drinks, jams, candies, yogurts',
    },
    source: 'EFSA',
    aliases: ['antosiyanin', 'antosiyaninler', 'anthocyanin', 'anthocyanins'],
  },
  {
    id: 'e170',
    code: 'E170',
    category: 'color',
    risk: 'safe',
    name: { tr: 'Kalsiyum Karbonat', en: 'Calcium Carbonate' },
    what: {
      tr: 'Beyaz renklendirici, asit düzenleyici ve kalsiyum kaynağı. Güvenli kabul edilir.',
      en: 'A white colour, acidity regulator and calcium source. Considered safe.',
    },
    foundIn: {
      tr: 'Şekerlemeler, unlu mamuller, takviyeler, sakızlar',
      en: 'Candies, baked goods, supplements, chewing gum',
    },
    source: 'EFSA',
    aliases: ['kalsiyum karbonat', 'calcium carbonate', 'kireç'],
  },

  {
    id: 'e210',
    code: 'E210',
    category: 'preservative',
    risk: 'caution',
    name: { tr: 'Benzoik Asit', en: 'Benzoic Acid' },
    what: {
      tr: 'Mayaları ve küfleri baskılayan koruyucu. C vitamini ile birlikte ısı/ışıkta az miktarda benzen oluşabildiği için duyarlı kişilerde dikkat önerilir.',
      en: 'A preservative that suppresses yeasts and moulds. Caution is advised for sensitive people since traces of benzene can form with vitamin C under heat/light.',
    },
    foundIn: {
      tr: 'Gazlı içecekler, turşular, soslar, meyve ürünleri',
      en: 'Soft drinks, pickles, sauces, fruit products',
    },
    source: 'EFSA',
    aliases: ['benzoik asit', 'benzoic acid'],
  },
  {
    id: 'e212',
    code: 'E212',
    category: 'preservative',
    risk: 'caution',
    name: { tr: 'Potasyum Benzoat', en: 'Potassium Benzoate' },
    what: {
      tr: 'Benzoik asidin potasyum tuzu; benzer koruyucu etki gösterir. Duyarlı kişilerde benzoat reaksiyonları görülebilir.',
      en: 'The potassium salt of benzoic acid with similar preservative action. Benzoate reactions may occur in sensitive individuals.',
    },
    foundIn: {
      tr: 'İçecekler, soslar, turşular',
      en: 'Beverages, sauces, pickles',
    },
    source: 'EFSA',
    aliases: ['potasyum benzoat', 'potassium benzoate'],
  },
  {
    id: 'e221',
    code: 'E221',
    category: 'preservative',
    risk: 'caution',
    name: { tr: 'Sodyum Sülfit', en: 'Sodium Sulphite' },
    what: {
      tr: 'Kararmayı önleyen sülfit koruyucu. Astımlılar ve sülfite duyarlı kişilerde reaksiyona yol açabilir; etikette belirtilmesi zorunludur.',
      en: 'A sulphite preservative that prevents browning. May trigger reactions in asthmatics and sulphite-sensitive people; must be declared on labels.',
    },
    foundIn: {
      tr: 'Kuru meyveler, şaraplar, işlenmiş patates',
      en: 'Dried fruit, wines, processed potato',
    },
    source: 'EFSA',
    aliases: ['sodyum sülfit', 'sodium sulphite', 'sülfit', 'sulphite'],
  },
  {
    id: 'e224',
    code: 'E224',
    category: 'preservative',
    risk: 'caution',
    name: { tr: 'Potasyum Metabisülfit', en: 'Potassium Metabisulphite' },
    what: {
      tr: 'Yaygın kullanılan sülfit koruyucu/antioksidan. Sülfite duyarlı kişilerde solunum reaksiyonları görülebilir.',
      en: 'A common sulphite preservative/antioxidant. Respiratory reactions can occur in sulphite-sensitive people.',
    },
    foundIn: {
      tr: 'Şaraplar, kuru meyveler, meyve suları',
      en: 'Wines, dried fruit, fruit juices',
    },
    source: 'EFSA',
    aliases: ['potasyum metabisülfit', 'potassium metabisulphite'],
  },
  {
    id: 'e249',
    code: 'E249',
    category: 'preservative',
    risk: 'risk',
    name: { tr: 'Potasyum Nitrit', en: 'Potassium Nitrite' },
    what: {
      tr: 'İşlenmiş ette botulizmi önleyen kürleme tuzu. Yüksek ısıda nitrozamin oluşumuna katkıda bulunabildiği için tüketimin sınırlı tutulması önerilir.',
      en: 'A curing salt that prevents botulism in processed meat. Limiting intake is advised as it can contribute to nitrosamine formation at high heat.',
    },
    foundIn: {
      tr: 'Sucuk, salam, sosis, jambon',
      en: 'Sausages, salami, hot dogs, ham',
    },
    source: 'EFSA',
    aliases: ['potasyum nitrit', 'potassium nitrite', 'nitrit'],
  },
  {
    id: 'e252',
    code: 'E252',
    category: 'preservative',
    risk: 'caution',
    name: { tr: 'Potasyum Nitrat', en: 'Potassium Nitrate' },
    what: {
      tr: 'Kürlemede kullanılan tuz; zamanla nitrite dönüşebilir. İşlenmiş et tüketiminin ölçülü olması önerilir.',
      en: 'A curing salt that can convert to nitrite over time. Moderate consumption of processed meat is advised.',
    },
    foundIn: {
      tr: 'Kürlenmiş etler, bazı peynirler',
      en: 'Cured meats, some cheeses',
    },
    source: 'EFSA',
    aliases: ['potasyum nitrat', 'potassium nitrate', 'güherçile'],
  },
  {
    id: 'e280',
    code: 'E280',
    category: 'preservative',
    risk: 'safe',
    name: { tr: 'Propiyonik Asit', en: 'Propionic Acid' },
    what: {
      tr: 'Ekmekte küflenmeyi geciktiren koruyucu. Mevcut kullanım düzeylerinde güvenli kabul edilir.',
      en: 'A preservative that delays mould in bread. Considered safe at current use levels.',
    },
    foundIn: {
      tr: 'Ambalajlı ekmek, unlu mamuller',
      en: 'Packaged bread, baked goods',
    },
    source: 'EFSA',
    aliases: ['propiyonik asit', 'propionic acid'],
  },
  {
    id: 'e290',
    code: 'E290',
    category: 'other',
    risk: 'safe',
    name: { tr: 'Karbondioksit', en: 'Carbon Dioxide' },
    what: {
      tr: 'İçeceklere gaz veren ve ambalajda koruyucu ortam sağlayan gaz. Güvenli kabul edilir.',
      en: 'The gas that carbonates drinks and provides a protective atmosphere in packaging. Considered safe.',
    },
    foundIn: {
      tr: 'Gazlı içecekler, maden suyu, modifiye atmosfer ambalajı',
      en: 'Soft drinks, sparkling water, modified-atmosphere packaging',
    },
    source: 'EFSA',
    aliases: ['karbondioksit', 'carbon dioxide', 'co2'],
  },

  {
    id: 'e301',
    code: 'E301',
    category: 'antioxidant',
    risk: 'safe',
    name: { tr: 'Sodyum Askorbat', en: 'Sodium Ascorbate' },
    what: {
      tr: 'C vitamininin sodyum tuzu; antioksidan olarak kullanılır. Güvenli kabul edilir.',
      en: 'The sodium salt of vitamin C, used as an antioxidant. Considered safe.',
    },
    foundIn: {
      tr: 'İşlenmiş etler, içecekler, dondurulmuş gıdalar',
      en: 'Processed meats, drinks, frozen foods',
    },
    source: 'EFSA',
    aliases: ['sodyum askorbat', 'sodium ascorbate'],
  },
  {
    id: 'e304',
    code: 'E304',
    category: 'antioxidant',
    risk: 'safe',
    name: { tr: 'Askorbil Palmitat', en: 'Ascorbyl Palmitate' },
    what: {
      tr: 'Yağda çözünen C vitamini türevi; yağların bozulmasını geciktirir. Güvenli kabul edilir.',
      en: 'A fat-soluble vitamin C derivative that slows fat spoilage. Considered safe.',
    },
    foundIn: {
      tr: 'Bebek mamaları, bitkisel yağlar, unlu mamuller',
      en: 'Infant formula, vegetable oils, baked goods',
    },
    source: 'EFSA',
    aliases: ['askorbil palmitat', 'ascorbyl palmitate'],
  },
  {
    id: 'e307',
    code: 'E307',
    category: 'antioxidant',
    risk: 'safe',
    name: { tr: 'Alfa-Tokoferol (E Vitamini)', en: 'Alpha-Tocopherol (Vitamin E)' },
    what: {
      tr: 'E vitamininin antioksidan olarak kullanılan formu. Güvenli kabul edilir.',
      en: 'A form of vitamin E used as an antioxidant. Considered safe.',
    },
    foundIn: {
      tr: 'Bitkisel yağlar, margarin, atıştırmalıklar',
      en: 'Vegetable oils, margarine, snacks',
    },
    source: 'EFSA',
    aliases: ['alfa tokoferol', 'alpha tocopherol', 'e vitamini', 'vitamin e'],
  },
  {
    id: 'e310',
    code: 'E310',
    category: 'antioxidant',
    risk: 'caution',
    name: { tr: 'Propil Gallat', en: 'Propyl Gallate' },
    what: {
      tr: 'Yağların acılaşmasını önleyen sentetik antioksidan. Duyarlı kişilerde reaksiyon bildirildiğinden ölçülü kullanım önerilir.',
      en: 'A synthetic antioxidant preventing fat rancidity. Moderate use is advised as reactions have been reported in sensitive people.',
    },
    foundIn: {
      tr: 'Kızartma yağları, sakız, atıştırmalıklar',
      en: 'Frying oils, chewing gum, snacks',
    },
    source: 'EFSA',
    aliases: ['propil gallat', 'propyl gallate'],
  },

  {
    id: 'e260',
    code: 'E260',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Asetik Asit', en: 'Acetic Acid' },
    what: {
      tr: 'Sirkenin ana bileşeni; asitlik verir ve koruyucu etki gösterir. Güvenli kabul edilir.',
      en: 'The main component of vinegar; adds acidity and acts as a preservative. Considered safe.',
    },
    foundIn: {
      tr: 'Turşular, soslar, mayonez, ekmek',
      en: 'Pickles, sauces, mayonnaise, bread',
    },
    source: 'EFSA',
    aliases: ['asetik asit', 'acetic acid', 'sirke asidi'],
  },
  {
    id: 'e270',
    code: 'E270',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Laktik Asit', en: 'Lactic Acid' },
    what: {
      tr: 'Fermantasyonla oluşan doğal asit; tat ve koruma sağlar. Güvenli kabul edilir.',
      en: 'A natural acid formed by fermentation that adds tang and preservation. Considered safe.',
    },
    foundIn: {
      tr: 'Yoğurt, turşu, ekşi maya ekmeği, içecekler',
      en: 'Yogurt, pickles, sourdough bread, drinks',
    },
    source: 'EFSA',
    aliases: ['laktik asit', 'lactic acid'],
  },
  {
    id: 'e296',
    code: 'E296',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Malik Asit', en: 'Malic Acid' },
    what: {
      tr: 'Elmada doğal olarak bulunan ekşi tat verici asit. Güvenli kabul edilir.',
      en: 'A tart-tasting acid naturally found in apples. Considered safe.',
    },
    foundIn: {
      tr: 'Şekerlemeler, meyveli içecekler, hazır tatlılar',
      en: 'Candies, fruit drinks, instant desserts',
    },
    source: 'EFSA',
    aliases: ['malik asit', 'malic acid'],
  },
  {
    id: 'e325',
    code: 'E325',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Sodyum Laktat', en: 'Sodium Lactate' },
    what: {
      tr: 'Laktik asidin tuzu; nem tutucu ve asit düzenleyici. Güvenli kabul edilir.',
      en: 'A salt of lactic acid used as a humectant and acidity regulator. Considered safe.',
    },
    foundIn: {
      tr: 'İşlenmiş etler, peynirler, unlu mamuller',
      en: 'Processed meats, cheeses, baked goods',
    },
    source: 'EFSA',
    aliases: ['sodyum laktat', 'sodium lactate'],
  },
  {
    id: 'e327',
    code: 'E327',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Kalsiyum Laktat', en: 'Calcium Lactate' },
    what: {
      tr: 'Asit düzenleyici, sertleştirici ve kalsiyum kaynağı. Güvenli kabul edilir.',
      en: 'An acidity regulator, firming agent and calcium source. Considered safe.',
    },
    foundIn: {
      tr: 'Konserve sebzeler, takviyeler, unlu mamuller',
      en: 'Canned vegetables, supplements, baked goods',
    },
    source: 'EFSA',
    aliases: ['kalsiyum laktat', 'calcium lactate'],
  },
  {
    id: 'e332',
    code: 'E332',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Potasyum Sitrat', en: 'Potassium Citrate' },
    what: {
      tr: 'Sitrik asidin potasyum tuzu; asitliği dengeler. Güvenli kabul edilir.',
      en: 'The potassium salt of citric acid that balances acidity. Considered safe.',
    },
    foundIn: {
      tr: 'İçecekler, süt ürünleri, hazır tatlılar',
      en: 'Drinks, dairy, instant desserts',
    },
    source: 'EFSA',
    aliases: ['potasyum sitrat', 'potassium citrate'],
  },
  {
    id: 'e334',
    code: 'E334',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Tartarik Asit', en: 'Tartaric Acid' },
    what: {
      tr: 'Üzümde doğal bulunan ekşi asit; asitlik verir. Güvenli kabul edilir.',
      en: 'A tart acid naturally found in grapes that adds acidity. Considered safe.',
    },
    foundIn: {
      tr: 'Şaraplar, şekerlemeler, kabartma tozu, meşrubatlar',
      en: 'Wines, candies, baking powder, soft drinks',
    },
    source: 'EFSA',
    aliases: ['tartarik asit', 'tartaric acid'],
  },
  {
    id: 'e336',
    code: 'E336',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Potasyum Tartarat (Krem Tartar)', en: 'Potassium Tartrate (Cream of Tartar)' },
    what: {
      tr: 'Kabartma tozunun bileşeni; asit düzenleyici ve stabilizör. Güvenli kabul edilir.',
      en: 'A component of baking powder used as an acidity regulator and stabiliser. Considered safe.',
    },
    foundIn: {
      tr: 'Kabartma tozu, kek, meringue, şekerlemeler',
      en: 'Baking powder, cakes, meringue, candies',
    },
    source: 'EFSA',
    aliases: ['krem tartar', 'cream of tartar', 'potasyum tartarat'],
  },
  {
    id: 'e339',
    code: 'E339',
    category: 'acidity',
    risk: 'caution',
    name: { tr: 'Sodyum Fosfatlar', en: 'Sodium Phosphates' },
    what: {
      tr: 'Asit düzenleyici, emülgatör ve su tutucu. Yüksek fosfat alımı böbrek/kalp açısından dikkate değer olduğundan işlenmiş gıdada ölçü önerilir.',
      en: 'An acidity regulator, emulsifier and water-binder. Moderation in processed foods is advised as high phosphate intake is relevant to kidney/heart health.',
    },
    foundIn: {
      tr: 'İşlenmiş peynir, şarküteri, hazır hamurlar, kola',
      en: 'Processed cheese, deli meats, ready doughs, cola',
    },
    source: 'EFSA',
    aliases: ['sodyum fosfat', 'sodium phosphate', 'fosfat', 'phosphate'],
  },
  {
    id: 'e575',
    code: 'E575',
    category: 'acidity',
    risk: 'safe',
    name: { tr: 'Glukono-delta-lakton', en: 'Glucono-delta-lactone' },
    what: {
      tr: 'Yavaş asit veren düzenleyici ve kabartıcı yardımcısı. Güvenli kabul edilir.',
      en: 'A slow-acting acidifier and leavening aid. Considered safe.',
    },
    foundIn: {
      tr: 'Tofu, işlenmiş etler, kabartma tozu',
      en: 'Tofu, processed meats, baking powder',
    },
    source: 'EFSA',
    aliases: ['glukono delta lakton', 'glucono delta lactone', 'gdl'],
  },

  {
    id: 'e401',
    code: 'E401',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Sodyum Aljinat', en: 'Sodium Alginate' },
    what: {
      tr: 'Kahverengi deniz yosunundan elde edilen kıvam ve jel verici. Güvenli kabul edilir.',
      en: 'A thickening and gelling agent from brown seaweed. Considered safe.',
    },
    foundIn: {
      tr: 'Dondurma, soslar, hazır tatlılar, restoran mutfağı',
      en: 'Ice cream, sauces, instant desserts, restaurant cooking',
    },
    source: 'EFSA',
    aliases: ['sodyum aljinat', 'sodium alginate', 'aljinat', 'alginate'],
  },
  {
    id: 'e405',
    code: 'E405',
    category: 'emulsifier',
    risk: 'safe',
    name: { tr: 'Propilen Glikol Aljinat', en: 'Propylene Glycol Alginate' },
    what: {
      tr: 'Aljinat türevi kıvam verici/emülgatör; asidik içeceklerde köpüğü korur. Güvenli kabul edilir.',
      en: 'An alginate-derived thickener/emulsifier that stabilises foam in acidic drinks. Considered safe.',
    },
    foundIn: {
      tr: 'Bira köpüğü, salata sosları, içecekler',
      en: 'Beer foam, salad dressings, drinks',
    },
    source: 'EFSA',
    aliases: ['propilen glikol aljinat', 'propylene glycol alginate', 'pga'],
  },
  {
    id: 'e418',
    code: 'E418',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Gellan Sakızı', en: 'Gellan Gum' },
    what: {
      tr: 'Fermantasyonla üretilen kıvam ve jel verici. Güvenli kabul edilir.',
      en: 'A thickening and gelling agent produced by fermentation. Considered safe.',
    },
    foundIn: {
      tr: 'Bitkisel sütler, hazır tatlılar, içecekler',
      en: 'Plant milks, instant desserts, drinks',
    },
    source: 'EFSA',
    aliases: ['gellan', 'gellan gum', 'gellan sakızı'],
  },
  {
    id: 'e425',
    code: 'E425',
    category: 'thickener',
    risk: 'caution',
    name: { tr: 'Konjak', en: 'Konjac' },
    what: {
      tr: 'Konjak kökünden kıvam verici lif. Suda hızla şiştiği için jelli/sert şekerlerde boğulma riski nedeniyle bazı formları kısıtlıdır.',
      en: 'A thickening fibre from konjac root. Some forms are restricted due to choking risk in jelly/mini cups, as it swells rapidly in water.',
    },
    foundIn: {
      tr: 'Jelibon, bitkisel jeller, shirataki erişte',
      en: 'Jelly sweets, plant-based jellies, shirataki noodles',
    },
    source: 'EFSA',
    aliases: ['konjak', 'konjac', 'glukomannan', 'glucomannan'],
  },
  {
    id: 'e460',
    code: 'E460',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Selüloz', en: 'Cellulose' },
    what: {
      tr: 'Bitki hücre duvarından elde edilen lif; hacim ve kıvam verir. Güvenli kabul edilir.',
      en: 'A fibre from plant cell walls that adds bulk and texture. Considered safe.',
    },
    foundIn: {
      tr: 'Rendelenmiş peynir, unlu mamuller, takviyeler',
      en: 'Shredded cheese, baked goods, supplements',
    },
    source: 'EFSA',
    aliases: ['selüloz', 'cellulose', 'mikrokristal selüloz'],
  },
  {
    id: 'e461',
    code: 'E461',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Metil Selüloz', en: 'Methyl Cellulose' },
    what: {
      tr: 'Bitkisel kaynaklı kıvam verici ve bağlayıcı; bitki bazlı ürünlerde yaygındır. Güvenli kabul edilir.',
      en: 'A plant-based thickener and binder, common in plant-based products. Considered safe.',
    },
    foundIn: {
      tr: 'Bitki bazlı köfte/burger, hazır tatlılar, soslar',
      en: 'Plant-based patties, instant desserts, sauces',
    },
    source: 'EFSA',
    aliases: ['metil selüloz', 'methyl cellulose'],
  },
  {
    id: 'e464',
    code: 'E464',
    category: 'thickener',
    risk: 'safe',
    name: { tr: 'Hidroksipropil Metil Selüloz', en: 'Hydroxypropyl Methyl Cellulose' },
    what: {
      tr: 'Selüloz türevi kıvam verici, jelleştirici ve film oluşturucu. Güvenli kabul edilir.',
      en: 'A cellulose-derived thickener, gelling and film-forming agent. Considered safe.',
    },
    foundIn: {
      tr: 'Glutensiz ürünler, bitki bazlı gıdalar, kaplamalar',
      en: 'Gluten-free products, plant-based foods, coatings',
    },
    source: 'EFSA',
    aliases: ['hidroksipropil metil selüloz', 'hpmc', 'hydroxypropyl methylcellulose'],
  },
  {
    id: 'e472c',
    code: 'E472c',
    category: 'emulsifier',
    risk: 'safe',
    name: { tr: 'Mono- ve Digliseridlerin Sitrik Asit Esterleri', en: 'Citric Acid Esters of Mono- and Diglycerides' },
    what: {
      tr: 'Yağ ve suyu birleştiren emülgatör; antioksidan etkisi de vardır. Güvenli kabul edilir.',
      en: 'An emulsifier that binds fat and water, also with antioxidant effect. Considered safe.',
    },
    foundIn: {
      tr: 'Margarin, soslar, unlu mamuller, kahve kremaları',
      en: 'Margarine, sauces, baked goods, coffee creamers',
    },
    source: 'EFSA',
    aliases: ['citrem', 'sitrik asit esterleri', 'citric acid esters'],
  },
  {
    id: 'e473',
    code: 'E473',
    category: 'emulsifier',
    risk: 'safe',
    name: { tr: 'Sükroz Esterleri', en: 'Sucrose Esters of Fatty Acids' },
    what: {
      tr: 'Şeker ve yağ asitlerinden elde edilen emülgatör. Güvenli kabul edilir.',
      en: 'An emulsifier made from sugar and fatty acids. Considered safe.',
    },
    foundIn: {
      tr: 'İçecekler, hazır tatlılar, unlu mamuller',
      en: 'Drinks, instant desserts, baked goods',
    },
    source: 'EFSA',
    aliases: ['sükroz esterleri', 'sucrose esters'],
  },
  {
    id: 'e481',
    code: 'E481',
    category: 'emulsifier',
    risk: 'safe',
    name: { tr: 'Sodyum Stearoil Laktilat', en: 'Sodium Stearoyl-2-Lactylate' },
    what: {
      tr: 'Hamuru güçlendiren emülgatör; ekmekte hacim ve yumuşaklık sağlar. Güvenli kabul edilir.',
      en: 'A dough-strengthening emulsifier that adds volume and softness to bread. Considered safe.',
    },
    foundIn: {
      tr: 'Ambalajlı ekmek, kekler, kahve kremaları',
      en: 'Packaged bread, cakes, coffee creamers',
    },
    source: 'EFSA',
    aliases: ['sodyum stearoil laktilat', 'ssl', 'sodium stearoyl lactylate'],
  },

  {
    id: 'e622',
    code: 'E622',
    category: 'flavorEnhancer',
    risk: 'caution',
    name: { tr: 'Monopotasyum Glutamat', en: 'Monopotassium Glutamate' },
    what: {
      tr: 'MSG’nin potasyumlu formu; umami tat verir. Güvenli kabul edilir, ancak duyarlı kişiler yüksek miktarda geçici belirtiler bildirebilir.',
      en: 'A potassium form of MSG giving umami taste. Considered safe, though sensitive people may report transient symptoms at high amounts.',
    },
    foundIn: {
      tr: 'Çorbalar, cipsler, soslar, hazır yemekler',
      en: 'Soups, chips, sauces, ready meals',
    },
    source: 'EFSA',
    aliases: ['monopotasyum glutamat', 'monopotassium glutamate'],
  },
  {
    id: 'e635',
    code: 'E635',
    category: 'flavorEnhancer',
    risk: 'caution',
    name: { tr: 'Disodyum 5′-Ribonükleotidler', en: "Disodium 5'-Ribonucleotides" },
    what: {
      tr: 'Genelde MSG ile birlikte umamiyi güçlendiren tat artırıcı. Güvenli kabul edilir; duyarlı kişiler dikkatli olabilir.',
      en: 'A flavour enhancer that boosts umami, usually alongside MSG. Considered safe; sensitive people may be cautious.',
    },
    foundIn: {
      tr: 'Cipsler, hazır çorbalar, bujyon, atıştırmalıklar',
      en: 'Chips, instant soups, bouillon, snacks',
    },
    source: 'EFSA',
    aliases: ['ribonükleotid', 'disodyum ribonükleotid', 'disodium ribonucleotides', 'e635'],
  },

  {
    id: 'e421',
    code: 'E421',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Mannitol', en: 'Mannitol' },
    what: {
      tr: 'Şeker alkolü tatlandırıcı; fazla tüketimi laksatif etki ve şişkinlik yapabilir.',
      en: 'A sugar-alcohol sweetener; excess intake can cause a laxative effect and bloating.',
    },
    foundIn: {
      tr: 'Şekersiz sakız, şekerlemeler, ilaç kaplamaları',
      en: 'Sugar-free gum, candies, medicine coatings',
    },
    source: 'EFSA',
    aliases: ['mannitol', 'manitol'],
  },
  {
    id: 'e953',
    code: 'E953',
    category: 'sweetener',
    risk: 'safe',
    name: { tr: 'İzomalt', en: 'Isomalt' },
    what: {
      tr: 'Şekerden elde edilen düşük kalorili şeker alkolü; çok fazla tüketilirse hafif sindirim etkisi yapabilir.',
      en: 'A low-calorie sugar alcohol from sugar; may cause mild digestive effects if eaten in excess.',
    },
    foundIn: {
      tr: 'Şekersiz şekerlemeler, çikolata, sakız',
      en: 'Sugar-free candies, chocolate, gum',
    },
    source: 'EFSA',
    aliases: ['izomalt', 'isomalt'],
  },
  {
    id: 'e957',
    code: 'E957',
    category: 'sweetener',
    risk: 'safe',
    name: { tr: 'Taumatin', en: 'Thaumatin' },
    what: {
      tr: 'Bir Afrika meyvesinden elde edilen doğal, çok yoğun tatlı protein; aynı zamanda tat düzenleyicidir. Güvenli kabul edilir.',
      en: 'A natural, intensely sweet protein from an African fruit that also modifies flavour. Considered safe.',
    },
    foundIn: {
      tr: 'Sakız, hazır tatlılar, tat maskeleyiciler',
      en: 'Chewing gum, instant desserts, flavour maskers',
    },
    source: 'EFSA',
    aliases: ['taumatin', 'thaumatin'],
  },
  {
    id: 'e959',
    code: 'E959',
    category: 'sweetener',
    risk: 'safe',
    name: { tr: 'Neohesperidin DC', en: 'Neohesperidine DC' },
    what: {
      tr: 'Turunçgil kaynaklı yoğun tatlandırıcı ve tat düzenleyici. Güvenli kabul edilir.',
      en: 'An intense sweetener and flavour modifier derived from citrus. Considered safe.',
    },
    foundIn: {
      tr: 'İçecekler, sakız, şekersiz ürünler',
      en: 'Drinks, chewing gum, sugar-free products',
    },
    source: 'EFSA',
    aliases: ['neohesperidin', 'neohesperidine', 'nhdc'],
  },
  {
    id: 'e962',
    code: 'E962',
    category: 'sweetener',
    risk: 'caution',
    name: { tr: 'Aspartam-Asesülfam Tuzu', en: 'Salt of Aspartame-Acesulfame' },
    what: {
      tr: 'Aspartam ve asesülfam-K’nin birleşik tuzu. Fenilalanin içerdiği için fenilketonürili kişiler kaçınmalıdır.',
      en: 'A combined salt of aspartame and acesulfame-K. People with phenylketonuria should avoid it as it contains phenylalanine.',
    },
    foundIn: {
      tr: 'Şekersiz içecekler, sakız, masaüstü tatlandırıcı',
      en: 'Sugar-free drinks, chewing gum, tabletop sweetener',
    },
    source: 'EFSA',
    aliases: ['aspartam asesülfam tuzu', 'aspartame-acesulfame salt', 'twinsweet'],
  },
  {
    id: 'e966',
    code: 'E966',
    category: 'sweetener',
    risk: 'safe',
    name: { tr: 'Laktitol', en: 'Lactitol' },
    what: {
      tr: 'Sütçülük yan ürünlerinden elde edilen düşük kalorili şeker alkolü; fazlası sindirim rahatsızlığı yapabilir.',
      en: 'A low-calorie sugar alcohol from dairy by-products; excess may cause digestive discomfort.',
    },
    foundIn: {
      tr: 'Şekersiz çikolata, dondurma, unlu mamuller',
      en: 'Sugar-free chocolate, ice cream, baked goods',
    },
    source: 'EFSA',
    aliases: ['laktitol', 'lactitol'],
  },

  {
    id: 'e504',
    code: 'E504',
    category: 'other',
    risk: 'safe',
    name: { tr: 'Magnezyum Karbonat', en: 'Magnesium Carbonate' },
    what: {
      tr: 'Asit düzenleyici, topaklanma önleyici ve renk taşıyıcı. Güvenli kabul edilir.',
      en: 'An acidity regulator, anti-caking agent and colour carrier. Considered safe.',
    },
    foundIn: {
      tr: 'Tuz, toz gıdalar, kabartma tozu',
      en: 'Salt, powdered foods, baking powder',
    },
    source: 'EFSA',
    aliases: ['magnezyum karbonat', 'magnesium carbonate'],
  },
  {
    id: 'e508',
    code: 'E508',
    category: 'other',
    risk: 'safe',
    name: { tr: 'Potasyum Klorür', en: 'Potassium Chloride' },
    what: {
      tr: 'Tuz (sodyum) yerine kullanılabilen tat verici ve stabilizör. Genelde güvenli kabul edilir.',
      en: 'A seasoning and stabiliser used as a salt (sodium) substitute. Generally considered safe.',
    },
    foundIn: {
      tr: 'Az sodyumlu ürünler, çorbalar, atıştırmalıklar',
      en: 'Low-sodium products, soups, snacks',
    },
    source: 'EFSA',
    aliases: ['potasyum klorür', 'potassium chloride'],
  },
  {
    id: 'e509',
    code: 'E509',
    category: 'other',
    risk: 'safe',
    name: { tr: 'Kalsiyum Klorür', en: 'Calcium Chloride' },
    what: {
      tr: 'Sertleştirici ve stabilizör; konserve sebzeleri diri tutar. Güvenli kabul edilir.',
      en: 'A firming agent and stabiliser that keeps canned vegetables crisp. Considered safe.',
    },
    foundIn: {
      tr: 'Konserve sebzeler, peynir yapımı, içecekler',
      en: 'Canned vegetables, cheesemaking, drinks',
    },
    source: 'EFSA',
    aliases: ['kalsiyum klorür', 'calcium chloride'],
  },
  {
    id: 'e535',
    code: 'E535',
    category: 'other',
    risk: 'caution',
    name: { tr: 'Sodyum Ferrosiyanür', en: 'Sodium Ferrocyanide' },
    what: {
      tr: 'Tuzun topaklanmasını önleyen madde. Çok düşük düzeylerde güvenli kabul edilir; kullanım miktarı sınırlıdır.',
      en: 'An anti-caking agent for salt. Considered safe at very low levels; use amounts are limited.',
    },
    foundIn: {
      tr: 'Sofra tuzu, tuz karışımları',
      en: 'Table salt, salt blends',
    },
    source: 'EFSA',
    aliases: ['sodyum ferrosiyanür', 'sodium ferrocyanide'],
  },
  {
    id: 'e553b',
    code: 'E553b',
    category: 'other',
    risk: 'caution',
    name: { tr: 'Talk', en: 'Talc' },
    what: {
      tr: 'Topaklanma önleyici ve parlatıcı. Gıda kalitesinde güvenli kabul edilir; solunmaması gerekir.',
      en: 'An anti-caking and polishing agent. Considered safe in food grade; should not be inhaled.',
    },
    foundIn: {
      tr: 'Sakız, pirinç kaplaması, şekerleme cilası',
      en: 'Chewing gum, rice coating, candy glaze',
    },
    source: 'EFSA',
    aliases: ['talk', 'talc', 'talkum'],
  },
];

function fold(s: string): string {
  return s.toLocaleLowerCase('tr');
}

export function normalizeECode(raw?: string): string | undefined {
  if (!raw) return undefined;
  const m = raw
    .toUpperCase()
    .replace(/[\s\-–.]/g, '')
    .match(/^E?(\d{3,4})([A-Z])?$/);
  if (!m) return undefined;
  return `E${m[1]}${m[2] ? m[2].toLowerCase() : ''}`;
}

const byCode = new Map(DICTIONARY.map((e) => [e.code, e]));

export function findDictionaryEntry(opts: {
  code?: string;
  name?: string;
}): DictionaryEntry | undefined {
  const code = normalizeECode(opts.code) ?? normalizeECode(opts.name);
  if (code) {
    const hit = byCode.get(code);
    if (hit) return hit;
  }
  if (opts.name) {
    const n = fold(opts.name);
    return DICTIONARY.find((e) => e.aliases?.some((a) => n.includes(a)));
  }
  return undefined;
}

export function searchDictionary(query: string): DictionaryEntry[] {
  const q = fold(query.trim());
  if (!q) return DICTIONARY;
  return DICTIONARY.filter(
    (e) =>
      fold(e.code).includes(q) ||
      fold(e.name.tr).includes(q) ||
      fold(e.name.en).includes(q) ||
      e.aliases?.some((a) => a.includes(q)),
  );
}

export function getDictionaryEntry(id: string): DictionaryEntry | undefined {
  return DICTIONARY.find((e) => e.id === id);
}

export function pickText(text: LocalizedText, lang: string): string {
  return lang.startsWith('en') ? text.en : text.tr;
}
