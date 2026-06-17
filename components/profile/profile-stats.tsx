import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

type Props = {
  posts: number;
  following: number;
  followers: number;
  onFollowingPress?: () => void;
  onFollowersPress?: () => void;
};

export function ProfileStats({
  posts,
  following,
  followers,
  onFollowingPress,
  onFollowersPress,
}: Props) {
  return (
    <View style={styles.row}>
      <StatItem value={posts} label="게시물" />
      <StatItem value={followers} label="팔로워" onPress={onFollowersPress} />
      <StatItem value={following} label="팔로잉" onPress={onFollowingPress} />
    </View>
  );
}

function StatItem({
  value,
  label,
  onPress,
}: {
  value: number;
  label: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </>
  );

  if (!onPress) {
    return <View style={styles.item}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}`}
      hitSlop={8}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: Spacing.lg,
  },
  item: {
    alignItems: 'center',
  },
  itemPressed: {
    opacity: 0.6,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Palette.textPrimary,
  },
  label: {
    marginTop: 2,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Palette.gray300,
  },
});
