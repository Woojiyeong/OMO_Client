import { router } from 'expo-router';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import type { FeedPost } from '@/features/feed/types';

const COLUMNS = 3;
const GAP = 2;

type Props = {
  posts: FeedPost[];
  source?: 'my' | 'saved' | 'user';
  userId?: string;
  userName?: string;
  onEndReached?: () => void;
};

export function PostGrid({ posts, source, userId, userName, onEndReached }: Props) {
  const { width } = useWindowDimensions();
  const cellSize = Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS);

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      renderItem={({ item, index }) => {
        const isLastInRow = (index + 1) % COLUMNS === 0;
        const params: Record<string, string> = { id: item.id };
        if (source) params.source = source;
        if (userId) params.userId = userId;
        if (userName) params.name = userName;
        return (
          <Pressable
            onPress={() => router.push({ pathname: '/post-detail', params })}
            accessibilityRole="button"
            accessibilityLabel="게시글 상세 보기"
            style={{
              width: cellSize,
              height: cellSize,
              marginRight: isLastInRow ? 0 : GAP,
            }}
          >
            <Image source={item.image} style={styles.image} resizeMode="cover" />
          </Pressable>
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.7}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
