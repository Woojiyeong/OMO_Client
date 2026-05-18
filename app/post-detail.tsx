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
  getPostsByUser,
  MOCK_MY_POSTS,
  MOCK_SAVED_POSTS,
  RANKED_FEED_POSTS,
} from '@/features/feed/mock';
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
  const { id, source: rawSource, name } = useLocalSearchParams<{
    id?: string;
    source?: string;
    name?: string;
  }>();
  const source: Source =
    rawSource === 'my' || rawSource === 'saved' || rawSource === 'user'
      ? rawSource
      : 'trend';

  const uploaded = useMyPostsStore((s) => s.uploaded);

  const basePosts = useMemo<FeedPost[]>(() => {
    if (source === 'my') return [...uploaded, ...MOCK_MY_POSTS];
    if (source === 'saved') return MOCK_SAVED_POSTS;
    if (source === 'user') return getPostsByUser('', name);
    return RANKED_FEED_POSTS;
  }, [source, name, uploaded]);
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
    if (posts.length === 0) router.back();
  }, [posts.length]);

  const handleRemove = useCallback((post: FeedPost) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(post.id);
      return next;
    });
  }, []);

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
