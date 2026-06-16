import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/feed/post-card';
import type { PostMoreVariant } from '@/components/feed/post-more-sheet';
import { ScreenHeader } from '@/components/social/screen-header';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import {
  deletePost,
  fetchPost,
  fetchPostsPage,
  removeMyBookmark,
} from '@/features/feed/api';
import { MOCK_MY_POSTS } from '@/features/feed/mock';
import { useMyPostsStore } from '@/features/feed/store';
import type { FeedPost } from '@/features/feed/types';

type Source = 'my' | 'saved' | 'user' | 'trend';

const SOURCE_TITLE: Record<Source, string> = {
  my: '게시물',
  saved: '저장',
  user: '게시글',
  trend: '게시글',
};

const SOURCE_VARIANT: Record<Source, PostMoreVariant> = {
  my: 'delete',
  saved: 'unsave',
  user: 'report',
  trend: 'report',
};

export default function PostDetailScreen() {
  const { id, source: rawSource } = useLocalSearchParams<{
    id?: string;
    source?: string;
    name?: string;
  }>();
  const source: Source =
    rawSource === 'my' || rawSource === 'saved' || rawSource === 'user'
      ? rawSource
      : 'trend';

  const uploaded = useMyPostsStore((s) => s.uploaded);
  const [remotePosts, setRemotePosts] = useState<FeedPost[]>([]);
  const [trendNextCursor, setTrendNextCursor] = useState<string | null>(null);
  const [loadingMoreTrend, setLoadingMoreTrend] = useState(false);

  const basePosts = useMemo<FeedPost[]>(() => {
    if (source === 'my') return [...uploaded, ...MOCK_MY_POSTS];
    return remotePosts;
  }, [source, uploaded, remotePosts]);
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const posts = useMemo(
    () => basePosts.filter((p) => !removedIds.has(p.id)),
    [basePosts, removedIds],
  );

  const initialIndex = useMemo(() => {
    const i = posts.findIndex((p) => p.id === id);
    return i < 0 ? 0 : i;
  }, [posts, id]);

  const listRef = useRef<FlatList<FeedPost>>(null);

  useEffect(() => {
    if (initialIndex === 0) return;
    const t = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
        viewPosition: 0,
      });
    }, 80);
    return () => clearTimeout(t);
  }, [initialIndex]);

  useEffect(() => {
    if (!id || source === 'my') return;
    let cancelled = false;

    if (source === 'trend') {
      Promise.all([
        fetchPost(id),
        fetchPostsPage({ sort: 'trending' }),
      ])
        .then(([focusedPost, page]) => {
          if (cancelled) return;
          const hasFocusedPost = page.posts.some((post) => post.id === focusedPost.id);
          setRemotePosts(hasFocusedPost ? page.posts : [focusedPost, ...page.posts]);
          setTrendNextCursor(page.nextCursor);
        })
        .catch(() => {
          if (!cancelled) router.back();
        });
    } else {
      fetchPost(id)
        .then((post) => {
          if (!cancelled) setRemotePosts([post]);
        })
        .catch(() => {
          if (!cancelled) router.back();
        });
    }

    return () => {
      cancelled = true;
    };
  }, [id, source]);

  const loadMoreTrendPosts = useCallback(async () => {
    if (source !== 'trend' || !trendNextCursor || loadingMoreTrend) return;
    setLoadingMoreTrend(true);
    try {
      const page = await fetchPostsPage({
        sort: 'trending',
        cursor: trendNextCursor,
      });
      setRemotePosts((prev) => {
        const seen = new Set(prev.map((post) => post.id));
        return [
          ...prev,
          ...page.posts.filter((post) => !seen.has(post.id)),
        ];
      });
      setTrendNextCursor(page.nextCursor);
    } finally {
      setLoadingMoreTrend(false);
    }
  }, [loadingMoreTrend, source, trendNextCursor]);

  const handleRemove = useCallback((post: FeedPost) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(post.id);
      return next;
    });
    const request =
      source === 'my'
        ? deletePost(post.id)
        : source === 'saved'
          ? removeMyBookmark(post.id)
          : Promise.resolve();
    request.catch(() => {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
    });
  }, [source]);

  const variant = SOURCE_VARIANT[source];
  const onMoreAction = source === 'trend' ? undefined : handleRemove;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScreenHeader title={SOURCE_TITLE[source]} onBack={() => router.back()} />
      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            moreVariant={variant}
            onMoreAction={onMoreAction}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onEndReached={source === 'trend' ? loadMoreTrendPosts : undefined}
        onEndReachedThreshold={0.7}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.index * info.averageItemLength,
            animated: false,
          });
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
              viewPosition: 0,
            });
          }, 120);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  content: {
    paddingBottom: Spacing.xl,
    backgroundColor: Palette.white,
  },
  separator: {
    height: 1,
    marginHorizontal: Spacing.base,
    backgroundColor: Palette.borderSubtle,
  },
});
