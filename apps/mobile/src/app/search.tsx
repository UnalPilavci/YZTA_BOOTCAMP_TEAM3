import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, ChevronRight, LayoutGrid, Search, Users, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostTile } from '@/components/discover/post-tile';
import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SegmentControl, type SegmentItem } from '@/components/ui/segment-control';
import { pickText, searchDictionary } from '@/data/dictionary';
import { searchPosts, searchProfiles, type PostView, type UserListItem } from '@/services/supabase/posts';
import { useAuth } from '@/store/auth';
import { stateColors, useThemeColors } from '@/theme';

type SearchTab = 'people' | 'posts' | 'dictionary';

const TABS: SegmentItem<SearchTab>[] = [
  { key: 'people', labelKey: 'search.tabPeople', Icon: Users },
  { key: 'posts', labelKey: 'search.tabPosts', Icon: LayoutGrid },
  { key: 'dictionary', labelKey: 'search.tabDictionary', Icon: BookOpen },
];

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [tab, setTab] = useState<SearchTab>('people');
  const [people, setPeople] = useState<UserListItem[]>([]);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const dictResults = useMemo(
    () => (debounced.length >= 1 ? searchDictionary(debounced) : []),
    [debounced],
  );

  const reqId = useRef(0);
  useEffect(() => {
    const myId = useAuth.getState().userId;
    if (debounced.length < 2 || !myId) {
      setPeople([]);
      setPosts([]);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    void Promise.all([searchProfiles(debounced), searchPosts(debounced, myId)])
      .then(([pe, po]) => {
        if (id !== reqId.current) return;
        setPeople(pe);
        setPosts(po);
      })
      .catch(() => {
        if (id === reqId.current) {
          setPeople([]);
          setPosts([]);
        }
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [debounced]);

  const showEmpty = debounced.length >= (tab === 'dictionary' ? 1 : 2);
  const asyncLoading = loading && tab !== 'dictionary';

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center gap-2.5 px-4 pt-2 pb-2">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
          <View className="flex-1 flex-row items-center gap-2.5 h-11 rounded-xl px-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
            <Search size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('search.placeholder')}
              placeholderTextColor={colors.textMuted}
              className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
              autoCapitalize="none"
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <PressableScale haptic="light" accessibilityLabel={t('common.close')} onPress={() => setQuery('')}>
                <X size={16} color={colors.textMuted} />
              </PressableScale>
            )}
          </View>
        </View>

        <View className="px-4 pb-2">
          <SegmentControl segments={TABS} value={tab} onChange={setTab} />
        </View>

        {asyncLoading ? (
          <View className="flex-1 items-center justify-center pb-24">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-4 pb-10">
            {tab === 'people' &&
              (people.length > 0 ? (
                <View className="gap-3 pt-1">
                  {people.map((u) => {
                    const label = u.name || u.username || '?';
                    const initial = label.trim()[0]?.toLocaleUpperCase('tr') ?? '?';
                    return (
                      <PressableScale
                        key={u.userId}
                        haptic="light"
                        accessibilityLabel={label}
                        onPress={() =>
                          router.push({ pathname: '/discover-profile', params: { userId: u.userId } })
                        }>
                        <View className="flex-row items-center gap-3 rounded-2xl p-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                          <Avatar initial={initial} uri={u.avatarUrl} size={48} />
                          <View className="flex-1">
                            <Text numberOfLines={1} className="font-heading text-[15px] text-ink dark:text-ink-dark">
                              {label}
                            </Text>
                            {!!u.username && (
                              <Text
                                numberOfLines={1}
                                className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted mt-0.5">
                                @{u.username}
                              </Text>
                            )}
                          </View>
                          <ChevronRight size={18} color={colors.textMuted} />
                        </View>
                      </PressableScale>
                    );
                  })}
                </View>
              ) : (
                <Empty show={showEmpty} text={t('search.emptyPeople')} />
              ))}

            {tab === 'posts' &&
              (posts.length > 0 ? (
                <View className="flex-row flex-wrap justify-between gap-y-3 pt-1">
                  {posts.map((post) => (
                    <View key={post.id} className="w-[48.5%]">
                      <PostTile
                        post={post}
                        onPress={() =>
                          router.push({ pathname: '/post-comments', params: { postId: post.id } })
                        }
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <Empty show={showEmpty} text={t('search.emptyPosts')} />
              ))}

            {tab === 'dictionary' &&
              (dictResults.length > 0 ? (
                <View className="gap-3 pt-1">
                  {dictResults.map((e) => (
                    <PressableScale
                      key={e.id}
                      haptic="light"
                      accessibilityLabel={pickText(e.name, i18n.language)}
                      onPress={() => router.push({ pathname: '/ingredient', params: { id: e.id } })}>
                      <View className="flex-row items-center gap-3 rounded-2xl p-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                        <View className="w-11 h-11 rounded-xl items-center justify-center bg-cream dark:bg-surface-dark">
                          <Text className="font-body-bold text-[11px] text-ink dark:text-ink-dark">
                            {e.code}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text numberOfLines={1} className="font-heading text-[15px] text-ink dark:text-ink-dark">
                            {pickText(e.name, i18n.language)}
                          </Text>
                          <View className="flex-row items-center gap-1.5 mt-0.5">
                            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: stateColors[e.risk] }} />
                            <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
                              {t(`dictionary.cat.${e.category}`)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </PressableScale>
                  ))}
                </View>
              ) : (
                <Empty show={showEmpty} text={t('search.emptyDictionary')} />
              ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function Empty({ show, text }: { show: boolean; text: string }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <View className="items-center justify-center pt-24 px-8 gap-2">
      <Search size={36} color={colors.textMuted} />
      <Text className="text-center font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
        {show ? text : t('search.hint')}
      </Text>
    </View>
  );
}
