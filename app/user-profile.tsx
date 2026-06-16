import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/profile/empty-state';
import { PostGrid } from '@/components/profile/post-grid';
import { OtherProfileHeader } from '@/components/social/other-profile-header';
import { ReportSheet, type ReportReason } from '@/components/social/report-sheet';
import { ScreenHeader } from '@/components/social/screen-header';
import { UnfollowModal } from '@/components/social/unfollow-modal';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { fetchUserPostsPage } from '@/features/feed/api';
import type { FeedPost } from '@/features/feed/types';
import { formatNickname } from '@/features/profile/store';
import { fetchFollowStatus, fetchUserProfile, reportUser } from '@/features/social/api';
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
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsCursor, setPostsCursor] = useState<string | null>(null);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [serverFollowing, setServerFollowing] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [unfollowVisible, setUnfollowVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchUserProfile(userId),
      fetchUserPostsPage({ userId }),
      fetchFollowStatus(userId).catch(() => null),
    ])
      .then(([d, postsPage, status]) => {
        if (cancelled) return;
        setDetail({
          ...d,
          name: params.name ?? d.name,
          keyword: parseKeyword(params.keyword ?? d.keyword),
          bio: params.bio ?? d.bio,
          avatarUri: params.avatarUri || d.avatarUri,
        });
        setPosts(postsPage.posts);
        setPostsCursor(postsPage.nextCursor);
        setServerFollowing(status?.isFollowing ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, params.name, params.keyword, params.bio, params.avatarUri]);

  const loadMorePosts = useCallback(async () => {
    if (!postsCursor || loadingMorePosts) return;
    setLoadingMorePosts(true);
    try {
      const page = await fetchUserPostsPage({ userId, cursor: postsCursor });
      setPosts((prev) => {
        const seen = new Set(prev.map((post) => post.id));
        return [...prev, ...page.posts.filter((post) => !seen.has(post.id))];
      });
      setPostsCursor(page.nextCursor);
    } finally {
      setLoadingMorePosts(false);
    }
  }, [loadingMorePosts, postsCursor, userId]);

  const handleToggleFollow = useCallback(() => {
    if (!detail) return;
    const following = serverFollowing ?? isFollowing(detail.id);
    if (following) {
      setUnfollowVisible(true);
    } else {
      setServerFollowing(true);
      followAction({
        id: detail.id,
        name: detail.name,
        keyword: detail.keyword,
        bio: detail.bio,
        avatarUri: detail.avatarUri,
      }).catch(() => setServerFollowing(false));
    }
  }, [detail, serverFollowing, isFollowing, followAction]);

  const handleConfirmUnfollow = useCallback(() => {
    if (!detail) return;
    setUnfollowVisible(false);
    setServerFollowing(false);
    unfollowAction(detail.id).catch(() => setServerFollowing(true));
  }, [detail, unfollowAction]);

  const handleReportUser = useCallback((payload: {
    reason: ReportReason;
    description?: string;
  }) => {
    if (!detail) return;
    setReporting(true);
    reportUser(detail.id, payload)
      .then(() => {
        setReportVisible(false);
        Alert.alert('신고 완료', '유저 신고가 접수되었어요.');
      })
      .catch((error) => {
        Alert.alert(
          '신고 실패',
          error instanceof Error ? error.message : '유저를 신고하지 못했어요.',
        );
      })
      .finally(() => setReporting(false));
  }, [detail]);

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
                    following={serverFollowing ?? isFollowing(detail.id)}
                    pending={!!pendingFollowOps[detail.id]}
                    onPressFollow={handleToggleFollow}
                    onPressReport={() => setReportVisible(true)}
                    onFollowingPress={() =>
                      router.push({
                        pathname: '/follow-list',
                        params: { type: 'following', userId: detail.id },
                      })
                    }
                    onFollowersPress={() =>
                      router.push({
                        pathname: '/follow-list',
                        params: { type: 'followers', userId: detail.id },
                      })
                    }
                  />
                </View>

                <View style={styles.divider} />

                {posts.length === 0 ? (
                  <EmptyState message="게시물이 없어요" />
                ) : (
                  <PostGrid
                    posts={posts}
                    source="user"
                    userName={detail.name}
                    onEndReached={loadMorePosts}
                  />
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
      <ReportSheet
        visible={reportVisible}
        title="유저 신고"
        submitting={reporting}
        onClose={() => setReportVisible(false)}
        onSubmit={handleReportUser}
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
