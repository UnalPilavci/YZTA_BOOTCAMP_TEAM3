import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AllergenChip } from '@/components/register/allergen-chip';
import { TextField } from '@/components/register/text-field';
import { CitySelect } from '@/components/ui/city-select';
import { Dropdown } from '@/components/ui/dropdown';
import { PhoneField } from '@/components/ui/phone-field';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import {
  ROLE_TYPES,
  SPECIALTIES_BY_ROLE,
  SPECIALTY_EMOJI,
  TITLE_OTHER,
  TITLE_PRESETS_BY_ROLE,
  WORK_MODES,
} from '@/data/trainer-options';
import {
  createListing,
  fetchListing,
  updateListing,
  type RoleType,
  type WorkMode,
} from '@/services/supabase/listings';
import { useAuth } from '@/store/auth';
import { useThemeColors } from '@/theme';

const BIO_MAX = 500;

export default function CreateListingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const { listingId } = useLocalSearchParams<{ listingId?: string }>();
  const isEdit = !!listingId;

  const [loading, setLoading] = useState(isEdit);
  const [roleType, setRoleType] = useState<RoleType>('trainer');
  const [titlePreset, setTitlePreset] = useState<string | null>(null);
  const [titleCustom, setTitleCustom] = useState('');
  const [city, setCity] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const titlePresets = TITLE_PRESETS_BY_ROLE[roleType];
  const roleSpecialties = SPECIALTIES_BY_ROLE[roleType];

  const presetLabel = (role: RoleType, id: string) => t(`listings.titlePresets.${role}.${id}`);
  const effectiveTitle =
    titlePreset === TITLE_OTHER
      ? titleCustom.trim()
      : titlePreset
        ? presetLabel(roleType, titlePreset)
        : '';

  useEffect(() => {
    if (!listingId) return;
    const myId = useAuth.getState().userId;
    if (!myId) return;
    void fetchListing(listingId, myId)
      .then((listing) => {
        if (!listing) return;
        setRoleType(listing.roleType);
        const match = TITLE_PRESETS_BY_ROLE[listing.roleType].find(
          (id) => id !== TITLE_OTHER && presetLabel(listing.roleType, id) === listing.title,
        );
        if (match) {
          setTitlePreset(match);
        } else {
          setTitlePreset(TITLE_OTHER);
          setTitleCustom(listing.title);
        }
        setCity(listing.city);
        setWorkMode(listing.workMode);
        setSpecialties(listing.specialties);
        setBio(listing.bio);
        setPhone(listing.contactPhone ?? '');
        setInstagram(listing.contactInstagram ?? '');
        setWhatsapp(listing.contactWhatsapp ?? '');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const onChangeRole = (next: RoleType) => {
    if (next === roleType) return;
    setRoleType(next);
    setTitlePreset(null);
    setTitleCustom('');
    setSpecialties([]);
  };

  const onSelectTitlePreset = (id: string) => {
    setTitlePreset(id);
    if (id !== TITLE_OTHER) setErrorKey(null);
  };

  const toggleSpecialty = (id: string) =>
    setSpecialties((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const hasContact = !!phone.trim() || !!instagram.trim() || !!whatsapp.trim();
  const canSubmit =
    effectiveTitle.length > 0 && !!workMode && hasContact && !busy;

  const onSubmit = async () => {
    if (!canSubmit) {
      setErrorKey(
        effectiveTitle.length === 0
          ? 'listings.titleMissingError'
          : !workMode
            ? 'listings.workModeMissingError'
            : 'listings.contactMissingError',
      );
      return;
    }
    const userId = useAuth.getState().userId;
    if (!userId) return;
    setBusy(true);
    setErrorKey(null);
    const input = {
      roleType,
      title: effectiveTitle,
      specialties,
      bio: bio.trim(),
      city: city.trim(),
      workMode,
      contactPhone: phone.trim() || null,
      contactInstagram: instagram.trim() || null,
      contactWhatsapp: whatsapp.trim() || null,
    };
    try {
      if (isEdit && listingId) await updateListing(listingId, input);
      else await createListing(userId, input);
      router.back();
    } catch {
      setErrorKey('listings.saveFailed');
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.cancel')}
            onPress={() => router.back()}>
            <Text className="font-body-medium text-[15px] text-ink-muted dark:text-ink-dark-muted">
              {t('common.cancel')}
            </Text>
          </PressableScale>
          <Text className="font-heading text-[17px] tracking-tight text-ink dark:text-ink-dark">
            {isEdit ? t('listings.editTitle') : t('listings.createTitle')}
          </Text>
          <View className="w-[52px]" />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1">
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="px-4 pt-4 pb-8 gap-5">
              <View className="gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('listings.roleLabel')}
                </Text>
                <View className="flex-row gap-2.5">
                  {ROLE_TYPES.map((r) => (
                    <AllergenChip
                      key={r.id}
                      label={t(`options.roleTypes.${r.id}`)}
                      selected={roleType === r.id}
                      onPress={() => onChangeRole(r.id as RoleType)}
                    />
                  ))}
                </View>
              </View>

              <View className="gap-2">
                <Dropdown
                  label={t('listings.titleLabel')}
                  placeholder={t('listings.titleSelectPlaceholder')}
                  selectedId={titlePreset}
                  onSelect={onSelectTitlePreset}
                  options={titlePresets.map((id) => ({
                    id,
                    label: id === TITLE_OTHER ? t('listings.titleOther') : presetLabel(roleType, id),
                  }))}
                />
                {titlePreset === TITLE_OTHER && (
                  <TextInput
                    value={titleCustom}
                    onChangeText={setTitleCustom}
                    placeholder={t('listings.titlePlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    maxLength={80}
                    autoFocus
                    className="rounded-xl px-3.5 h-[52px] font-body text-[15px] text-ink dark:text-ink-dark bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark"
                  />
                )}
              </View>

              <View className="gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('listings.workModeLabel')}
                </Text>
                <View className="flex-row gap-2.5">
                  {WORK_MODES.map((m) => (
                    <AllergenChip
                      key={m.id}
                      label={t(`options.workModes.${m.id}`)}
                      selected={workMode === m.id}
                      onPress={() => {
                        setWorkMode(m.id as WorkMode);
                        setErrorKey(null);
                      }}
                    />
                  ))}
                </View>
              </View>

              <CitySelect
                label={t('listings.cityLabel')}
                placeholder={t('listings.cityPlaceholder')}
                value={city}
                onChange={setCity}
              />

              <View className="gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('listings.specialtiesLabel')}
                </Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {roleSpecialties.map((o) => (
                    <AllergenChip
                      key={o.id}
                      label={t(`options.specialties.${o.id}`)}
                      emoji={SPECIALTY_EMOJI[o.id]}
                      selected={specialties.includes(o.id)}
                      onPress={() => toggleSpecialty(o.id)}
                    />
                  ))}
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                    {t('listings.bioLabel')}
                  </Text>
                  <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
                    {bio.length}/{BIO_MAX}
                  </Text>
                </View>
                <View className="rounded-xl px-3.5 py-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder={t('listings.bioPlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={BIO_MAX}
                    textAlignVertical="top"
                    className="min-h-[100px] font-body text-[15px] leading-[21px] text-ink dark:text-ink-dark"
                  />
                </View>
              </View>

              <View className="gap-3">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('listings.contactLabel')}
                </Text>
                <PhoneField
                  label={t('listings.contactPhoneLabel')}
                  value={phone}
                  onChangeText={setPhone}
                />
                <TextField
                  label={t('listings.contactInstagramLabel')}
                  value={instagram}
                  onChangeText={setInstagram}
                  placeholder="@kullaniciadi"
                  autoCapitalize="none"
                />
                <PhoneField
                  label={t('listings.contactWhatsappLabel')}
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                />
              </View>

              {errorKey && (
                <Text className="font-body text-[13px] text-danger">{t(errorKey)}</Text>
              )}

              <PrimaryButton
                label={busy ? t('listings.saving') : t('listings.saveCta')}
                icon={null}
                onPress={onSubmit}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </View>
  );
}
