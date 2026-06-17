import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyFollowState } from '@/components/social/empty-follow-state';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { fetchPostsPage } from '@/features/feed/api';
import type { FeedPost } from '@/features/feed/types';
import { useSocialStore } from '@/features/social/store';

import { PostCard } from './post-card';

export function FollowingFeed() {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const following = useSocialStore((s) => s.following);
  const loadFollowing = useSocialStore((s) => s.loadFollowing);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchPostsPage({ sort: 'following' });
      setPosts(page.posts);
      setNextCursor(page.nextCursor);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loading || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchPostsPage({
        sort: 'following',
        cursor: nextCursor,
      });
      setPosts((prev) => {
        const seen = new Set(prev.map((post) => post.id));
        return [...prev, ...page.posts.filter((post) => !seen.has(post.id))];
      });
      setNextCursor(page.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, nextCursor]);

  useEffect(() => {
    if (following.length === 0) {
      loadFollowing().catch(() => {});
    }
  }, [following.length, loadFollowing]);

  useEffect(() => {
    loadPosts().catch(() => {});
  }, [loadPosts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadFollowing(true), loadPosts()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadFollowing, loadPosts]);

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} initialFollowing />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={posts.length === 0 ? styles.emptyContent : styles.content}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={loading ? null : <EmptyFollowState type="following" />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.6}
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
