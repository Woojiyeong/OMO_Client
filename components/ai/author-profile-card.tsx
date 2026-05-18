import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FollowButton } from '@/components/social/follow-button';
import { KeywordAvatar } from '@/components/profile/keyword-avatar';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import type { AiCoordiAuthor } from '@/features/ai/types';
import { useSocialStore } from '@/features/social/store';

type Props = {
  author: AiCoordiAuthor;
};

const AVATAR_SIZE = 40;

export function AuthorProfileCard({ author }: Props) {
  const authorId = author.id;
  const following = useSocialStore((s) => s.following.some((u) => u.id === authorId));
  const pending = useSocialStore((s) => !!s.pendingFollowOps[authorId]);
  const followAction = useSocialStore((s) => s.follow);
  const unfollowAction = useSocialStore((s) => s.unfollow);

  const handlePress = useCallback(() => {
    if (following) {
      unfollowAction(author.id).catch(() => {});
    } else {
      followAction({
        id: author.id,
        name: author.nickname,
        keyword: author.keyword,
        avatarUri: author.avatarUri,
        bio: '',
      }).catch(() => {});
    }
  }, [following, author, followAction, unfollowAction]);

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <KeywordAvatar keyword={author.keyword} seed={author.id} size={AVATAR_SIZE} />
        <Text style={styles.nickname} numberOfLines={1}>
          {author.nickname}
        </Text>
      </View>
      <FollowButton
        following={following}
        pending={pending}
        onPress={handlePress}
        variant="compact"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.gray50,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  nickname: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Palette.textPrimary,
    flexShrink: 1,
  },
});
