import { Heart, X } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { PressableScale } from '@/components/ui/pressable-scale';
import { postIcon } from '@/data/discover';
import type { PostView } from '@/services/supabase/posts';
import { getScore, readableText, useThemeColors } from '@/theme';

export function PostTile({
  post,
  onPress,
  onLongPress,
  onRemove,
  removeLabel,
}: {
  post: PostView;
  onPress: () => void;
  onLongPress?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  const colors = useThemeColors();
  const { grade, color } = getScore(post.healthScore);
  const Icon = postIcon(post.iconKey);

  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityLabel={post.productName}>
      <Card className="p-3 gap-2" elevation="none">
        <View
          className="h-16 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${color}22` }}>
          <Icon size={26} color={color} />
        </View>
        {onRemove && (
          <View style={{ position: 'absolute', top: 6, right: 6 }}>
            <PressableScale
              haptic="medium"
              accessibilityLabel={removeLabel ?? 'Kaldır'}
              onPress={onRemove}>
              <View className="w-7 h-7 rounded-full items-center justify-center bg-cream/90 dark:bg-surface-dark/90 border border-border dark:border-border-dark">
                <X size={14} color={colors.text} />
              </View>
            </PressableScale>
          </View>
        )}
        <Text
          numberOfLines={2}
          className="font-body-medium text-[13px] leading-[17px] text-ink dark:text-ink-dark min-h-[34px]">
          {post.productName}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="rounded-pill px-2 py-0.5" style={{ backgroundColor: color }}>
            <Text
              className="font-body-bold text-[11px] tabular-nums"
              style={{ color: readableText(color) }}>
              {grade}·{post.healthScore}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Heart size={12} color={colors.textMuted} />
            <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
              {post.likeCount}
            </Text>
          </View>
        </View>
      </Card>
    </PressableScale>
  );
}
