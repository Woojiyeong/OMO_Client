import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Palette } from '@/constants/colors';
import { fetchPostsPage, toTrendItems } from '@/features/feed/api';
import type { TrendItem } from '@/features/feed/types';

const COLUMNS = 3;
const GAP = 2;

export function TrendGrid() {
  const { width } = useWindowDimensions();
  const cellSize = Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS);
  const [items, setItems] = useState<TrendItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchPostsPage({ sort: 'trending' });
      setItems(toTrendItems(page.posts));
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
        sort: 'trending',
        cursor: nextCursor,
      });
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.postId));
        return [
          ...prev,
          ...toTrendItems(page.posts).filter((item) => !seen.has(item.postId)),
        ];
      });
      setNextCursor(page.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, nextCursor]);

  useEffect(() => {
    loadItems().catch(() => {});
  }, [loadItems]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadItems();
    } finally {
      setRefreshing(false);
    }
  }, [loadItems]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      renderItem={({ item, index }) => (
        <TrendCell item={item} size={cellSize} isLastInRow={(index + 1) % COLUMNS === 0} />
      )}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.7}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Palette.pink500}
        />
      }
    />
  );
}

type CellProps = {
  item: TrendItem;
  size: number;
  isLastInRow: boolean;
};

function TrendCell({ item, size, isLastInRow }: CellProps) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/post-detail',
          params: { id: item.postId, source: 'trend' },
        })
      }
      accessibilityRole="button"
      accessibilityLabel="게시글 상세 보기"
      style={{ width: size, height: size, marginRight: isLastInRow ? 0 : GAP }}
    >
      <Image source={item.image} style={styles.image} resizeMode="cover" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    backgroundColor: Palette.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
