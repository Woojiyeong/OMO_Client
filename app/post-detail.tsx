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
  fetchMyBookmarksPage,
  fetchMyPostsPage,
  fetchPost,
  fetchPostsPage,
  fetchUserPostsPage,
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

function mergePosts(...groups: FeedPost[][]): FeedPost[] {
  const seen = new Set<string>();
  return groups.flatMap((group) =>
    group.filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    }),
  );
}

function postsWithFocusedPost(focusedPost: FeedPost | null, posts: FeedPost[]): FeedPost[] {
  if (!focusedPost) return posts;
  const existingIndex = posts.findIndex((post) => post.id === focusedPost.id);
  if (existingIndex < 0) return [focusedPost, ...posts];

  const nextPosts = [...posts];
  nextPosts[existingIndex] = focusedPost;
  return nextPosts;
}

export default function PostDetailScreen() {
  const { id, source: rawSource, userId } = useLocalSearchParams<{
    id?: string;
    source?: string;
    userId?: string;
    name?: string;
  }>();
  const source: Source =
    rawSource === 'my' || rawSource === 'saved' || rawSource === 'user'
      ? rawSource
      : 'trend';

  const uploaded = useMyPostsStore((s) => s.uploaded);
  const deletedPostIds = useMyPostsStore((s) => s.deletedIds);
  const markPostDeleted = useMyPostsStore((s) => s.markPostDeleted);
  const restorePostDeleted = useMyPostsStore((s) => s.restorePostDeleted);
  const markBookmarkRemoved = useMyPostsStore((s) => s.markBookmarkRemoved);
  const restoreBookmarkRemoved = useMyPostsStore((s) => s.restoreBookmarkRemoved);
  const [remotePosts, setRemotePosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);

  const basePosts = useMemo<FeedPost[]>(() => {
    if (source === 'my') return mergePosts(uploaded, remotePosts, MOCK_MY_POSTS);
    return remotePosts;
  }, [source, uploaded, remotePosts]);
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const posts = useMemo(
    () => basePosts.filter((p) => !removedIds.has(p.id) && !deletedPostIds.includes(p.id)),
    [basePosts, deletedPostIds, removedIds],
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
    if (!id) return;
    let cancelled = false;
    setRemotePosts([]);
    setNextCursor(null);

    if (source === 'trend') {
      Promise.all([
        fetchPost(id),
        fetchPostsPage({ sort: 'trending' }),
      ])
        .then(([focusedPost, page]) => {
          if (cancelled) return;
          setRemotePosts(postsWithFocusedPost(focusedPost, page.posts));
          setNextCursor(page.nextCursor);
        })
        .catch(() => {
          if (!cancelled) router.back();
        });
    } else if (source === 'my') {
      Promise.all([
        fetchPost(id).catch(() => null),
        fetchMyPostsPage(),
      ])
        .then(([focusedPost, page]) => {
          if (cancelled) return;
          setRemotePosts(postsWithFocusedPost(focusedPost, page.posts));
          setNextCursor(page.nextCursor);
        })
        .catch(() => {
          if (!cancelled) router.back();
        });
    } else if (source === 'saved') {
      Promise.all([
        fetchPost(id).catch(() => null),
        fetchMyBookmarksPage(),
      ])
        .then(([focusedPost, page]) => {
          if (cancelled) return;
          setRemotePosts(postsWithFocusedPost(focusedPost, page.posts));
          setNextCursor(page.nextCursor);
        })
        .catch(() => {
          if (!cancelled) router.back();
        });
    } else if (source === 'user' && userId) {
      Promise.all([
        fetchPost(id).catch(() => null),
        fetchUserPostsPage({ userId }),
      ])
        .then(([focusedPost, page]) => {
          if (cancelled) return;
          const sameUserFocusedPost =
            focusedPost && focusedPost.author.id === userId ? focusedPost : null;
          setRemotePosts(postsWithFocusedPost(sameUserFocusedPost, page.posts));
          setNextCursor(page.nextCursor);
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
  }, [id, source, userId]);

  const loadMorePosts = useCallback(async () => {
    if (!nextCursor || loadingMorePosts) return;
    if (source === 'user' && !userId) return;
    if (source !== 'trend' && source !== 'my' && source !== 'user' && source !== 'saved') {
      return;
    }

    setLoadingMorePosts(true);
    try {
      const page =
        source === 'trend'
          ? await fetchPostsPage({ sort: 'trending', cursor: nextCursor })
          : source === 'my'
            ? await fetchMyPostsPage({ cursor: nextCursor })
            : source === 'saved'
              ? await fetchMyBookmarksPage({ cursor: nextCursor })
              : await fetchUserPostsPage({ userId: userId ?? '', cursor: nextCursor });

      setRemotePosts((prev) => mergePosts(prev, page.posts));
      setNextCursor(page.nextCursor);
    } finally {
      setLoadingMorePosts(false);
    }
  }, [loadingMorePosts, nextCursor, source, userId]);

  const handleRemove = useCallback((post: FeedPost) => {
    const shouldReturnToMyPage = source === 'my' && posts.length <= 1;

    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(post.id);
      return next;
    });
    if (source === 'my') {
      markPostDeleted(post.id);
      if (shouldReturnToMyPage) {
        router.replace('/(tabs)/my');
      }
    } else if (source === 'saved') {
      markBookmarkRemoved(post.id);
    }
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
      if (source === 'my') {
        restorePostDeleted(post.id);
      } else if (source === 'saved') {
        restoreBookmarkRemoved(post.id);
      }
    });
  }, [
    markBookmarkRemoved,
    markPostDeleted,
    posts.length,
    restoreBookmarkRemoved,
    restorePostDeleted,
    source,
  ]);

  const handleBookmarkChange = useCallback(
    (post: FeedPost, bookmarked: boolean) => {
      if (source !== 'saved') return;
      setRemovedIds((prev) => {
        const next = new Set(prev);
        if (bookmarked) {
          next.delete(post.id);
        } else {
          next.add(post.id);
        }
        return next;
      });
      if (bookmarked) {
        restoreBookmarkRemoved(post.id);
      } else {
        markBookmarkRemoved(post.id);
      }
    },
    [markBookmarkRemoved, restoreBookmarkRemoved, source],
  );

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
            initialBookmarked={source === 'saved' ? true : undefined}
            hideFollowButton={source === 'my'}
            moreVariant={variant}
            onMoreAction={onMoreAction}
            onBookmarkChange={handleBookmarkChange}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMorePosts}
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
