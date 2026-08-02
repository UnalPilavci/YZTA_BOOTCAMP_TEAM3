import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import type { UserListItem } from '@/services/supabase/posts';

export function UserRow({
  user,
  onPress,
  action,
}: {
  user: UserListItem;
  onPress: () => void;
  action?: ReactNode;
}) {
  const label = user.name || user.username || '?';
  const initial = label.trim()[0]?.toLocaleUpperCase('tr') ?? '?';

  return (
    <View className="flex-row items-center gap-3 py-2">
      <PressableScale
        haptic="light"
        accessibilityLabel={label}
        onPress={onPress}
        style={{ flex: 1 }}>
        <View className="flex-row items-center gap-3">
          <Avatar initial={initial} uri={user.avatarUrl} size={44} />
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-heading text-[15px] text-ink dark:text-ink-dark">
              {label}
            </Text>
            {!!user.username && (
              <Text
                numberOfLines={1}
                className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
                @{user.username}
              </Text>
            )}
          </View>
        </View>
      </PressableScale>
      {action}
    </View>
  );
}
