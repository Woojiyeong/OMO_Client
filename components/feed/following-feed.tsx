import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyFollowState } from '@/components/social/empty-follow-state';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { MOCK_FEED_POSTS } from '@/features/feed/mock';
import { useSocialStore } from '@/features/social/store';

import { PostCard } from './post-card';

export function FollowingFeed() {
  const [refreshing, setRefreshing] = useState(false);

  const following = useSocialStore((s) => s.following);
  const loadFollowing = useSocialStore((s) => s.loadFollowing);

  useEffect(() => {
    if (following.length === 0) {
      loadFollowing().catch(() => {});
    }
  }, [following.length, loadFollowing]);

  const followedIds = useMemo(
    () => new Set(following.map((u) => u.id)),
    [following],
  );

  const posts = useMemo(
    () =>
      MOCK_FEED_POSTS.filter(
        (p) => p.author.id !== 'me' && followedIds.has(p.author.id),
      ),
    [followedIds],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFollowing();
    } finally {
      setRefreshing(false);
    }
  }, [loadFollowing]);

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={posts.length === 0 ? styles.emptyContent : styles.content}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyFollowState type="following" />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Palette.pink500}
          colors={[Palette.pink500]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    backgroundColor: Palette.white,
  },
  emptyContent: {
    flexGrow: 1,
    backgroundColor: Palette.white,
  },
  separator: {
    height: 1,
    marginHorizontal: Spacing.base,
    backgroundColor: Palette.borderSubtle,
  },
});
