import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/profile/avatar';
import { KeywordAvatar } from '@/components/profile/keyword-avatar';
import { ProfileStats } from '@/components/profile/profile-stats';
import { FollowButton } from '@/components/social/follow-button';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { formatNickname } from '@/features/profile/store';
import type { UserProfileDetail } from '@/features/social/types';

type Props = {
  user: UserProfileDetail;
  isSelf?: boolean;
  following: boolean;
  pending: boolean;
  onPressFollow: () => void;
  onPressReport?: () => void;
  onFollowingPress?: () => void;
  onFollowersPress?: () => void;
};

export function OtherProfileHeader({
  user,
  isSelf,
  following,
  pending,
  onPressFollow,
  onPressReport,
  onFollowingPress,
  onFollowersPress,
}: Props) {
  const nickname = formatNickname(user.keyword, user.name);

  return (
    <View>
      <View style={styles.topRow}>
        {user.avatarUri ? (
          <Avatar uri={user.avatarUri} size={88} />
        ) : (
          <KeywordAvatar keyword={user.keyword} seed={user.id} size={88} />
        )}
        <ProfileStats
          posts={user.stats.posts}
          following={user.stats.following}
          followers={user.stats.followers}
          onFollowingPress={onFollowingPress}
          onFollowersPress={onFollowersPress}
        />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.nickname}>{nickname}</Text>
        {user.heightCm && user.weightKg ? (
          <Text style={styles.bodyInfo}>
            {user.heightCm}cm {user.weightKg}kg
          </Text>
        ) : null}
        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
      </View>

      {!isSelf && (
        <View style={styles.followWrap}>
          <FollowButton
            following={following}
            pending={pending}
            onPress={onPressFollow}
            variant="block"
          />
          {onPressReport ? (
            <Pressable
              onPress={onPressReport}
              accessibilityRole="button"
              accessibilityLabel="유저 신고하기"
              style={styles.reportButton}
            >
              <Text style={styles.reportText}>유저 신고하기</Text>
            </Pressable>
          ) : null}
        </View>
      )}
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
  followWrap: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  reportButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportText: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Palette.gray500,
  },
});
