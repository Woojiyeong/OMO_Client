import { StyleSheet, Text, View } from 'react-native';

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
};

export function OtherProfileHeader({
  user,
  isSelf,
  following,
  pending,
  onPressFollow,
}: Props) {
  const nickname = formatNickname(user.keyword, user.name);

  return (
    <View>
      <View style={styles.topRow}>
        <KeywordAvatar keyword={user.keyword} seed={user.id} size={80} />
        <ProfileStats
          posts={user.stats.posts}
          following={user.stats.following}
          followers={user.stats.followers}
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
    fontSize: 16,
    color: Palette.textPrimary,
  },
  bodyInfo: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.gray300,
  },
  bio: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  followWrap: {
    marginTop: Spacing.md,
  },
});
