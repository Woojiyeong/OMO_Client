import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/profile/empty-state';
import { PostGrid } from '@/components/profile/post-grid';
import { OtherProfileHeader } from '@/components/social/other-profile-header';
import { ScreenHeader } from '@/components/social/screen-header';
import { UnfollowModal } from '@/components/social/unfollow-modal';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { getPostsByUser } from '@/features/feed/mock';
import { formatNickname } from '@/features/profile/store';
import { fetchUserProfile } from '@/features/social/api';
import { useSocialStore } from '@/features/social/store';
import type { UserProfileDetail } from '@/features/social/types';
import type { StyleOption } from '@/features/onboarding/styles';

const KEYWORD_VALUES: StyleOption[] = ['minimalist', 'street', 'lovely', 'casual', 'formal'];

function parseKeyword(raw: unknown): StyleOption {
  return typeof raw === 'string' && (KEYWORD_VALUES as string[]).includes(raw)
    ? (raw as StyleOption)
    : 'casual';
}

export default function UserProfileScreen() {
  const params = useLocalSearchParams<{
    userId?: string;
    name?: string;
    keyword?: string;
    bio?: string;
    avatarUri?: string;
  }>();

  const userId = params.userId ?? '';
  const pendingFollowOps = useSocialStore((s) => s.pendingFollowOps);
  const isFollowing = useSocialStore((s) => s.isFollowing);
  const followAction = useSocialStore((s) => s.follow);
  const unfollowAction = useSocialStore((s) => s.unfollow);

  const [detail, setDetail] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [unfollowVisible, setUnfollowVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUserProfile(userId)
      .then((d) => {
        if (cancelled) return;
        setDetail({
          ...d,
          name: params.name ?? d.name,
          keyword: parseKeyword(params.keyword ?? d.keyword),
          bio: params.bio ?? d.bio,
          avatarUri: params.avatarUri || d.avatarUri,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, params.name, params.keyword, params.bio, params.avatarUri]);

  const handleToggleFollow = useCallback(() => {
    if (!detail) return;
    if (isFollowing(detail.id)) {
      setUnfollowVisible(true);
    } else {
      followAction({
        id: detail.id,
        name: detail.name,
        keyword: detail.keyword,
        bio: detail.bio,
        avatarUri: detail.avatarUri,
      }).catch(() => {});
    }
  }, [detail, isFollowing, followAction]);

  const handleConfirmUnfollow = useCallback(() => {
    if (!detail) return;
    setUnfollowVisible(false);
    unfollowAction(detail.id).catch(() => {});
  }, [detail, unfollowAction]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScreenHeader title="프로필" onBack={() => router.back()} />

      {loading || !detail ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Palette.pink500} />
        </View>
      ) : (
        <>
          {(() => {
            const posts = getPostsByUser(detail.id, detail.name);
            const adjusted = {
              ...detail,
              stats: { ...detail.stats, posts: posts.length },
            };
            return (
              <>
                <View style={styles.profileSection}>
                  <OtherProfileHeader
                    user={adjusted}
                    isSelf={false}
                    following={isFollowing(detail.id)}
                    pending={!!pendingFollowOps[detail.id]}
                    onPressFollow={handleToggleFollow}
                  />
                </View>

                <View style={styles.divider} />

                {posts.length === 0 ? (
                  <EmptyState message="게시물이 없어요" />
                ) : (
                  <PostGrid posts={posts} source="user" userName={detail.name} />
                )}
              </>
            );
          })()}
        </>
      )}

      <UnfollowModal
        visible={unfollowVisible}
        targetName={detail ? formatNickname(detail.keyword, detail.name) : undefined}
        onCancel={() => setUnfollowVisible(false)}
        onConfirm={handleConfirmUnfollow}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
  },
});
