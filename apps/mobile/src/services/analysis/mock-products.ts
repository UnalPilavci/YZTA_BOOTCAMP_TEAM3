import type { IngredientAnalysis } from './types';

export type MockProduct = {
  productName: string;
  ingredients: IngredientAnalysis[];
};

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    productName: 'Kremalı Çikolatalı Bisküvi',
    ingredients: [
      { name: 'Buğday Unu', risk: 'caution', note: 'İşlenmiş tahıl; gluten kaynağı.' },
      { name: 'Şeker', risk: 'caution', note: 'Yüksek şeker içeriği.' },
      { name: 'Bitkisel Yağ (Palm)', risk: 'caution', note: 'Doymuş yağ oranı yüksek.' },
      { name: 'Süt Tozu', risk: 'safe', note: 'Süt ürünü.' },
      { name: 'Kakao', risk: 'safe', note: 'Doğal içerik.' },
      { name: 'Soya Lesitini', code: 'E322', risk: 'caution', note: 'Emülgatör (soya kaynaklı).' },
      { name: 'Kabartma Tozu', code: 'E500', risk: 'safe', note: 'Genelde güvenli kabartıcı.' },
      { name: 'Vanilin', risk: 'safe', note: 'Aroma vericisi.' },
    ],
  },
  {
    productName: 'Gazlı Meyveli İçecek',
    ingredients: [
      { name: 'Su', risk: 'safe', note: 'Ana bileşen.' },
      { name: 'Şeker', risk: 'caution', note: 'Yüksek şeker içeriği.' },
      { name: 'Glukoz Şurubu', risk: 'risk', note: 'İlave şeker; hızlı emilir.' },
      { name: 'Sitrik Asit', code: 'E330', risk: 'safe', note: 'Asitlik düzenleyici.' },
      { name: 'Aroma', risk: 'caution', note: 'Tanımsız aroma bileşeni.' },
      { name: 'Renklendirici', code: 'E110', risk: 'risk', note: 'Yapay renklendirici (sunset yellow).' },
      { name: 'Sodyum Benzoat', code: 'E211', risk: 'caution', note: 'Koruyucu.' },
      { name: 'Kafein', risk: 'caution', note: 'Uyarıcı içerir.' },
    ],
  },
  {
    productName: 'Baharatlı Patates Cipsi',
    ingredients: [
      { name: 'Patates', risk: 'safe', note: 'Ana bileşen.' },
      { name: 'Ayçiçek Yağı', risk: 'caution', note: 'Kızartma yağı.' },
      { name: 'Tuz', risk: 'caution', note: 'Yüksek sodyum.' },
      { name: 'Monosodyum Glutamat', code: 'E621', risk: 'caution', note: 'Lezzet arttırıcı (MSG).' },
      { name: 'Peynir Tozu', risk: 'safe', note: 'Süt ürünü içerir.' },
      { name: 'Aroma', risk: 'caution', note: 'Tanımsız aroma bileşeni.' },
    ],
  },
  {
    productName: 'Yulaflı Meyve Barı',
    ingredients: [
      { name: 'Yulaf Ezmesi', risk: 'safe', note: 'Tam tahıl; lif kaynağı.' },
      { name: 'Kuru Üzüm', risk: 'safe', note: 'Doğal meyve.' },
      { name: 'Bal', risk: 'safe', note: 'Doğal tatlandırıcı.' },
      { name: 'Badem', risk: 'safe', note: 'Kuruyemiş.' },
      { name: 'Tarçın', risk: 'safe', note: 'Baharat.' },
    ],
  },
];

export function pickMockProduct(): MockProduct {
  return MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
}
