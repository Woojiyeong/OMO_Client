import { router } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Palette } from '@/constants/colors';
import { MOCK_TREND_ITEMS } from '@/features/feed/mock';
import type { TrendItem } from '@/features/feed/types';

const COLUMNS = 3;
const GAP = 2;

export function TrendGrid() {
  const { width } = useWindowDimensions();
  const cellSize = Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS);

  return (
    <FlatList
      data={MOCK_TREND_ITEMS}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      renderItem={({ item, index }) => (
        <TrendCell item={item} size={cellSize} isLastInRow={(index + 1) % COLUMNS === 0} />
      )}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
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
      onPress={() => router.push({ pathname: '/post-detail', params: { id: item.postId } })}
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
