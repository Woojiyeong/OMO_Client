import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KeywordAvatar } from '@/components/profile/keyword-avatar';
import { FollowButton } from '@/components/social/follow-button';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { formatNickname } from '@/features/profile/store';
import type { SocialUser } from '@/features/social/types';

type Props = {
  user: SocialUser;
  following: boolean;
  pending: boolean;
  onPressUser: () => void;
  onPressFollow: () => void;
};

export function UserListItem({
  user,
  following,
  pending,
  onPressUser,
  onPressFollow,
}: Props) {
  return (
    <Pressable
      onPress={onPressUser}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${formatNickname(user.keyword, user.name)} 프로필 보기`}
    >
      <KeywordAvatar keyword={user.keyword} seed={user.id} size={48} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {formatNickname(user.keyword, user.name)}
        </Text>
        {user.bio ? (
          <Text style={styles.bio} numberOfLines={1}>
            {user.bio}
          </Text>
        ) : null}
      </View>
      <FollowButton following={following} pending={pending} onPress={onPressFollow} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Palette.white,
  },
  rowPressed: {
    backgroundColor: Palette.gray50,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  bio: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.grayBorder,
  },
});
