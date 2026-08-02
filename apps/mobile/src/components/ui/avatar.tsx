import { Image } from 'expo-image';
import { Text, View } from 'react-native';

export function Avatar({
  initial,
  uri,
  size = 36,
}: {
  initial: string;
  uri?: string | null;
  size?: number;
}) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-brand-tint dark:bg-brand-dark-tint">
      <Text
        style={{ fontSize: Math.round(size * 0.36) }}
        className="font-heading text-brand dark:text-brand-dark">
        {initial}
      </Text>
    </View>
  );
}
