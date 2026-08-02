import type { IngredientAnalysis, PersonalAlert, ProfileInput } from './types';

const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  gluten: ['gluten', 'buğday', 'wheat', 'arpa', 'barley', 'çavdar', 'rye', 'malt', 'irmik'],
  lactose: ['laktoz', 'lactose'],
  milk: ['süt', 'milk', 'krema', 'cream', 'tereyağ', 'butter', 'peynir', 'cheese', 'yoğurt', 'kazein', 'casein', 'whey', 'peynir altı'],
  egg: ['yumurta', 'egg', 'albümin', 'albumin'],
  peanut: ['yer fıstığı', 'fıstık ezmesi', 'peanut'],
  tree_nuts: ['fındık', 'ceviz', 'badem', 'antep fıstığı', 'kaju', 'hazelnut', 'walnut', 'almond', 'cashew'],
  soy: ['soya', 'soy', 'soja'],
  shellfish: ['kabuklu', 'karides', 'shrimp', 'yengeç', 'crab', 'istakoz', 'midye'],
  fish: ['balık', 'fish', 'ançüez', 'anchovy', 'ton balığı', 'tuna'],
  sesame: ['susam', 'sesame', 'tahin', 'tahini'],
};

const SENSITIVITY_KEYWORDS: Record<string, string[]> = {
  high_sugar: ['şeker', 'sugar', 'glikoz', 'glukoz', 'fruktoz', 'fructose', 'glukoz şurubu', 'invert şeker'],
  msg: ['msg', 'monosodyum glutamat', 'monosodium glutamate', 'e621', 'çin tuzu'],
  artificial_color: ['renklendirici', 'colour', 'color', 'tartrazin', 'e102', 'e104', 'e110', 'e129', 'e133'],
  high_sodium: ['sodyum', 'sodium', 'tuz', 'salt'],
  caffeine: ['kafein', 'caffeine', 'kola'],
  preservatives: ['koruyucu', 'preservative', 'sodyum benzoat', 'benzoate', 'e211', 'potasyum sorbat', 'sorbate', 'e202', 'e200'],
};

function matchOne(
  ingredients: IngredientAnalysis[],
  selectedIds: string[],
  keywordMap: Record<string, string[]>,
  category: 'allergens' | 'sensitivities',
  severity: 'risk' | 'caution',
): PersonalAlert[] {
  const alerts: PersonalAlert[] = [];
  const seen = new Set<string>();

  for (const id of selectedIds) {
    const keywords = keywordMap[id];
    if (!keywords) continue;

    for (const ing of ingredients) {
      const haystack = `${ing.name} ${ing.code ?? ''}`.toLowerCase();
      if (keywords.some((kw) => haystack.includes(kw))) {
        const dedupeKey = `${id}:${ing.name}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        alerts.push({
          ingredient: ing.name,
          matchLabelKey: `options.${category}.${id}`,
          severity,
        });
      }
    }
  }
  return alerts;
}

export function matchPersonalAlerts(
  ingredients: IngredientAnalysis[],
  profile: ProfileInput,
): PersonalAlert[] {
  return [
    ...matchOne(ingredients, profile.allergens, ALLERGEN_KEYWORDS, 'allergens', 'risk'),
    ...matchOne(ingredients, profile.sensitivities, SENSITIVITY_KEYWORDS, 'sensitivities', 'caution'),
  ];
}
