import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/profile/avatar';
import { KeywordAvatar } from '@/components/profile/keyword-avatar';
import { ProfileStats } from '@/components/profile/profile-stats';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { formatNickname, useProfileStore } from '@/features/profile/store';

export function ProfileHeader() {
  const name = useProfileStore((s) => s.name);
  const keyword = useProfileStore((s) => s.keyword);
  const heightCm = useProfileStore((s) => s.heightCm);
  const weightKg = useProfileStore((s) => s.weightKg);
  const bio = useProfileStore((s) => s.bio);
  const stats = useProfileStore((s) => s.stats);
  const avatarUri = useProfileStore((s) => s.avatarUri);

  const nickname = formatNickname(keyword, name);

  return (
    <View>
      <View style={styles.topRow}>
        {avatarUri ? (
          <Avatar uri={avatarUri} size={88} />
        ) : (
          <KeywordAvatar keyword={keyword} seed={name} size={88} />
        )}
        <ProfileStats
          posts={stats.posts}
          following={stats.following}
          followers={stats.followers}
          onFollowingPress={() =>
            router.push({ pathname: '/follow-list', params: { type: 'following' } })
          }
          onFollowersPress={() =>
            router.push({ pathname: '/follow-list', params: { type: 'followers' } })
          }
        />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.nickname}>{nickname}</Text>
        <Text style={styles.bodyInfo}>
          {heightCm}cm {weightKg}kg
        </Text>
        <Text style={styles.bio}>{bio}</Text>
      </View>

      <Pressable
        onPress={() => router.push('/profile-edit')}
        style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="프로필 편집"
      >
        <Text style={styles.editButtonText}>프로필 편집</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  textBlock: {
    marginTop: Spacing.base,
    gap: 2,
  },
  nickname: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Palette.textPrimary,
  },
  bodyInfo: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Palette.gray300,
  },
  bio: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  editButton: {
    marginTop: Spacing.md,
    height: 54,
    borderRadius: 8,
    backgroundColor: Palette.gray210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonPressed: {
    opacity: 0.85,
  },
  editButtonText: {
    fontFamily: FontFamily.semibold,
    fontSize: 15,
    color: Palette.white,
  },
});
