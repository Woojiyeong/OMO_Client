import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyFollowState } from '@/components/social/empty-follow-state';
import { ScreenHeader } from '@/components/social/screen-header';
import { SkeletonRow } from '@/components/social/skeleton-row';
import { UnfollowModal } from '@/components/social/unfollow-modal';
import { UserListItem } from '@/components/social/user-list-item';
import { Palette } from '@/constants/colors';
import { formatNickname } from '@/features/profile/store';
import { useSocialStore } from '@/features/social/store';
import type { FollowListType, SocialUser } from '@/features/social/types';

export default function FollowListScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const listType: FollowListType = type === 'followers' ? 'followers' : 'following';

  const following = useSocialStore((s) => s.following);
  const followers = useSocialStore((s) => s.followers);
  const loadingFollowing = useSocialStore((s) => s.loadingFollowing);
  const loadingFollowers = useSocialStore((s) => s.loadingFollowers);
  const pendingFollowOps = useSocialStore((s) => s.pendingFollowOps);
  const loadFollowing = useSocialStore((s) => s.loadFollowing);
  const loadFollowers = useSocialStore((s) => s.loadFollowers);
  const followAction = useSocialStore((s) => s.follow);
  const unfollowAction = useSocialStore((s) => s.unfollow);
  const isFollowing = useSocialStore((s) => s.isFollowing);

  const list = listType === 'following' ? following : followers;
  const loading = listType === 'following' ? loadingFollowing : loadingFollowers;
  const reload = listType === 'following' ? loadFollowing : loadFollowers;

  const [refreshing, setRefreshing] = useState(false);
  const [unfollowTarget, setUnfollowTarget] = useState<SocialUser | null>(null);

  useEffect(() => {
    if (list.length === 0) {
      reload().catch(() => {});
    }
  }, [list.length, reload]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  const handleToggleFollow = useCallback(
    (user: SocialUser) => {
      if (isFollowing(user.id)) {
        setUnfollowTarget(user);
      } else {
        followAction(user).catch(() => {});
      }
    },
    [followAction, isFollowing],
  );

  const handleConfirmUnfollow = useCallback(() => {
    if (!unfollowTarget) return;
    const id = unfollowTarget.id;
    setUnfollowTarget(null);
    unfollowAction(id).catch(() => {});
  }, [unfollowTarget, unfollowAction]);

  const handlePressUser = useCallback((user: SocialUser) => {
    router.push({
      pathname: '/user-profile',
      params: {
        userId: user.id,
        name: user.name,
        keyword: user.keyword,
        bio: user.bio,
        avatarUri: user.avatarUri ?? '',
      },
    });
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScreenHeader
        title={listType === 'following' ? '팔로잉' : '팔로워'}
        onBack={() => router.back()}
      />

      {loading && list.length === 0 ? (
        <FlatList
          data={Array.from({ length: 8 })}
          keyExtractor={(_, i) => `skel-${i}`}
          renderItem={() => <SkeletonRow />}
          ItemSeparatorComponent={Divider}
        />
      ) : list.length === 0 ? (
        <EmptyFollowState type={listType} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(u) => u.id}
          ItemSeparatorComponent={Divider}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Palette.pink500}
            />
          }
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              following={isFollowing(item.id)}
              pending={!!pendingFollowOps[item.id]}
              onPressUser={() => handlePressUser(item)}
              onPressFollow={() => handleToggleFollow(item)}
            />
          )}
        />
      )}

      <UnfollowModal
        visible={!!unfollowTarget}
        targetName={
          unfollowTarget
            ? formatNickname(unfollowTarget.keyword, unfollowTarget.name)
            : undefined
        }
        onCancel={() => setUnfollowTarget(null)}
        onConfirm={handleConfirmUnfollow}
      />
    </SafeAreaView>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.gray220,
  },
});
