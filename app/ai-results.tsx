import { router } from 'expo-router';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductGridCard } from '@/components/ai/product-grid-card';
import { ScreenHeader } from '@/components/social/screen-header';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { MOCK_AI_RESULTS } from '@/features/ai/mock';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_GAP = Spacing.md;
const HORIZONTAL_PADDING = Spacing.base;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

export default function AiResultsScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScreenHeader title="검색 결과" onBack={() => router.back()} />
      <FlatList
        data={MOCK_AI_RESULTS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
        renderItem={({ item }) => <ProductGridCard product={item} width={CARD_WIDTH} />}
        showsVerticalScrollIndicator={false}
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
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  row: {
    gap: COLUMN_GAP,
  },
  rowSeparator: {
    height: Spacing.base,
  },
});
