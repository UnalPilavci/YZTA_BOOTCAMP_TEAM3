import { Ionicons } from '@expo/vector-icons';

import type { RoleType } from '@/services/supabase/listings';

type IconName = keyof typeof Ionicons.glyphMap;

export type Option = { id: string; icon: IconName };

export const ROLE_TYPES: Option[] = [
  { id: 'trainer', icon: 'barbell-outline' },
  { id: 'dietitian', icon: 'nutrition-outline' },
];

export const WORK_MODES: Option[] = [
  { id: 'remote', icon: 'globe-outline' },
  { id: 'onsite', icon: 'location-outline' },
  { id: 'hybrid', icon: 'git-compare-outline' },
];

export const SPECIALTIES_BY_ROLE: Record<RoleType, Option[]> = {
  trainer: [
    { id: 'weight_loss', icon: 'trending-down-outline' },
    { id: 'muscle_gain', icon: 'body-outline' },
    { id: 'personal_training', icon: 'fitness-outline' },
    { id: 'functional_training', icon: 'walk-outline' },
    { id: 'strength', icon: 'barbell-outline' },
    { id: 'cardio_conditioning', icon: 'pulse-outline' },
    { id: 'pilates_yoga', icon: 'flower-outline' },
    { id: 'rehab', icon: 'medical-outline' },
  ],
  dietitian: [
    { id: 'weight_management', icon: 'speedometer-outline' },
    { id: 'clinical_dietitian', icon: 'medkit-outline' },
    { id: 'sports_nutrition', icon: 'restaurant-outline' },
    { id: 'diabetes_diet', icon: 'water-outline' },
    { id: 'kids_nutrition', icon: 'happy-outline' },
    { id: 'pre_post_natal', icon: 'heart-outline' },
    { id: 'gut_health', icon: 'leaf-outline' },
    { id: 'vegan_nutrition', icon: 'nutrition-outline' },
  ],
};

export const ALL_SPECIALTIES: Option[] = [
  ...SPECIALTIES_BY_ROLE.trainer,
  ...SPECIALTIES_BY_ROLE.dietitian,
];

export const SPECIALTY_EMOJI: Record<string, string> = {
  weight_loss: '⚖️',
  muscle_gain: '💪',
  personal_training: '🏋️',
  functional_training: '🤸',
  strength: '🏋️',
  cardio_conditioning: '🏃',
  pilates_yoga: '🧘',
  rehab: '🦵',
  weight_management: '📉',
  clinical_dietitian: '🩺',
  sports_nutrition: '🥗',
  diabetes_diet: '💧',
  kids_nutrition: '🧒',
  pre_post_natal: '🤰',
  gut_health: '🌿',
  vegan_nutrition: '🥦',
};

export const TITLE_OTHER = 'other';

export const TITLE_PRESETS_BY_ROLE: Record<RoleType, string[]> = {
  trainer: [
    'pt_1to1',
    'online_coaching',
    'weight_loss_program',
    'muscle_building',
    'functional_strength',
    'pilates_reformer',
    'home_workout',
    TITLE_OTHER,
  ],
  dietitian: [
    'personalized_diet',
    'online_diet',
    'weight_management_program',
    'clinical_nutrition',
    'sports_diet',
    'child_nutrition',
    'gut_health_program',
    TITLE_OTHER,
  ],
};

export const CITIES: string[] = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya',
  'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu',
  'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır',
  'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun',
  'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir',
  'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya',
  'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop',
  'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
  'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale',
  'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük',
  'Kilis', 'Osmaniye', 'Düzce',
];
