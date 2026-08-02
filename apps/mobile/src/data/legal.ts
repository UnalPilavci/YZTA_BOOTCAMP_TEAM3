export type LegalSection = { heading: string; body: string };
export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

const CONTACT_EMAIL = 'privacy@nutrilens.app';
const LAST_UPDATED_TR = '17 Temmuz 2026';
const LAST_UPDATED_EN = 'July 17, 2026';

const TR: LegalDoc = {
  title: 'Gizlilik Politikası',
  updated: `Son güncelleme: ${LAST_UPDATED_TR}`,
  intro:
    'NutriLens olarak gizliliğine önem veriyoruz. Bu politika, uygulamayı kullanırken hangi verileri topladığımızı, nasıl işlediğimizi ve haklarını açıklar. Uygulamayı kullanarak bu politikayı kabul etmiş olursun.',
  sections: [
    {
      heading: '1. Topladığımız Veriler',
      body:
        '• Hesap bilgileri: e-posta adresi ve (isteğe bağlı) telefon numarası.\n• Sağlık profili: alerjenler, hassasiyetler, sağlık durumları, beslenme tercihleri, boy ve kilo.\n• Tarama verileri: ürünlerin içindekiler metni, çıkarılan maddeler, sağlık skoru ve sana özel uyarılar.\n• Topluluk içeriği: paylaştığın gönderiler, yorumlar, beğeniler ve Keşfet profilin.',
    },
    {
      heading: '2. Özel Nitelikli Sağlık Verisi',
      body:
        'Alerjen, hassasiyet ve sağlık durumu bilgilerin KVKK kapsamında "özel nitelikli kişisel veri"dir. Bu veriler yalnızca senin cihazında ve hesabına bağlı olarak, açık rızanla saklanır. Sana özel uyarıların ve sağlık profilin başka hiçbir kullanıcı tarafından görülemez; erişimi veritabanı düzeyinde yalnızca sana kısıtlanmıştır.',
    },
    {
      heading: '3. Verileri Nasıl Kullanıyoruz',
      body:
        'Verilerini yalnızca; taramalarını kişiselleştirmek, sağlık skorunu hesaplamak, geçmişini cihazların arasında senkronlamak ve topluluk özelliklerini sunmak için kullanırız. Verilerini pazarlama amacıyla satmayız veya kiralamayız.',
    },
    {
      heading: '4. Üçüncü Taraf Servisler',
      body:
        '• Supabase: hesabın, profilin ve taramaların güvenli şekilde saklanması için altyapı sağlayıcımızdır.\n• Groq: taradığın ürünün içindekiler metni, maddeleri çözümlemek için yapay zeka analiz servisine gönderilir. Bu isteğe sağlık profilin dahil edilmez. Alerjen eşleştirmesi cihazında, deterministik olarak yapılır.',
    },
    {
      heading: '5. Topluluk ve Herkese Açık İçerik',
      body:
        'Toplulukta paylaştığın gönderiler, yorumlar ve Keşfet profilin (kullanıcı adı, görünen ad, biyografi) diğer kullanıcılar tarafından görülebilir. Bir gönderi bir taramadan türese bile yalnızca ürün adı, skoru ve uyarı SAYISI görünür; hangi uyarıların sana özel olduğu asla paylaşılmaz.',
    },
    {
      heading: '6. Saklama ve Güvenlik',
      body:
        'Verilerin şifreli bağlantılar üzerinden iletilir ve satır düzeyinde güvenlik (RLS) politikalarıyla korunur; her kullanıcı yalnızca kendi verisine erişebilir. Verilerini, hesabın aktif olduğu sürece veya yasal yükümlülükler gerektirdiği sürece saklarız.',
    },
    {
      heading: '7. Haklarına ve Verilerini Silme',
      body:
        'KVKK ve GDPR kapsamında verilerine erişme, düzeltme ve silme hakkına sahipsin. Sağlık profilini istediğin an Profil ekranından güncelleyebilirsin. Ayarlar > Hesabı Sil ile hesabını ve tüm verilerini (profil, taramalar, gönderiler) kalıcı olarak silebilirsin; bu işlem geri alınamaz.',
    },
    {
      heading: '8. İletişim',
      body: `Gizlilikle ilgili sorularını ${CONTACT_EMAIL} adresine iletebilirsin.`,
    },
    {
      heading: 'Yasal Uyarı',
      body:
        'NutriLens bir tıbbi cihaz veya tıbbi tavsiye kaynağı değildir. Sağlık skorları ve uyarılar yalnızca bilgilendirme amaçlıdır. Alerji ve sağlık durumların için her zaman bir sağlık uzmanına danış.',
    },
  ],
};

const EN: LegalDoc = {
  title: 'Privacy Policy',
  updated: `Last updated: ${LAST_UPDATED_EN}`,
  intro:
    'At NutriLens we care about your privacy. This policy explains what data we collect while you use the app, how we process it, and your rights. By using the app you agree to this policy.',
  sections: [
    {
      heading: '1. Data We Collect',
      body:
        '• Account info: email address and (optional) phone number.\n• Health profile: allergens, sensitivities, health conditions, dietary preferences, height and weight.\n• Scan data: product ingredient text, extracted items, health score and personal alerts.\n• Community content: posts, comments, likes you share, and your Discover profile.',
    },
    {
      heading: '2. Special Category Health Data',
      body:
        'Your allergen, sensitivity and health condition data is "special category personal data" under GDPR/KVKK. It is stored only on your device and tied to your account, with your explicit consent. Your personal alerts and health profile are never visible to other users; access is restricted to you at the database level.',
    },
    {
      heading: '3. How We Use Your Data',
      body:
        'We use your data solely to personalize your scans, compute your health score, sync your history across devices, and provide community features. We do not sell or rent your data for marketing.',
    },
    {
      heading: '4. Third-Party Services',
      body:
        '• Supabase: our infrastructure provider for securely storing your account, profile and scans.\n• Groq: the ingredient text of a scanned product is sent to an AI analysis service to parse its items. Your health profile is not included in this request. Allergen matching is done on your device, deterministically.',
    },
    {
      heading: '5. Community and Public Content',
      body:
        'Posts, comments and your Discover profile (username, display name, bio) are visible to other users. Even when a post derives from a scan, only the product name, score and the NUMBER of alerts are shown; which alerts are personal to you is never shared.',
    },
    {
      heading: '6. Storage and Security',
      body:
        'Your data is transmitted over encrypted connections and protected by row-level security (RLS) policies; each user can access only their own data. We retain your data while your account is active or as required by law.',
    },
    {
      heading: '7. Your Rights and Deleting Your Data',
      body:
        'Under GDPR/KVKK you have the right to access, correct and delete your data. You can update your health profile anytime from the Profile screen. Settings > Delete Account permanently removes your account and all data (profile, scans, posts); this action cannot be undone.',
    },
    {
      heading: '8. Contact',
      body: `For privacy questions, reach us at ${CONTACT_EMAIL}.`,
    },
    {
      heading: 'Disclaimer',
      body:
        'NutriLens is not a medical device or a source of medical advice. Health scores and alerts are for informational purposes only. Always consult a healthcare professional about your allergies and health conditions.',
    },
  ],
};

export function privacyPolicy(lang: string): LegalDoc {
  return lang.startsWith('en') ? EN : TR;
}
