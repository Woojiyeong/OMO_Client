import { router, useLocalSearchParams } from "expo-router";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductGridCard } from "@/components/ai/product-grid-card";
import { ScreenHeader } from "@/components/social/screen-header";
import { Palette } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { FontFamily } from "@/constants/typography";
import { useAiChatStore } from "@/features/ai/store";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLUMN_GAP = Spacing.md;
const HORIZONTAL_PADDING = Spacing.base;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

export default function AiResultsScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();
  const results = useAiChatStore((s) => s.results);
  const error = useAiChatStore((s) => s.error);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScreenHeader title="검색 결과" onBack={() => router.back()} />
      {error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>추천을 불러오지 못했어요</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable
            onPress={() =>
              router.replace({
                pathname: "/ai-loading",
                params: { query: query ?? "" },
              })
            }
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="다시 추천 받기"
          >
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>추천할 게시글이 없어요</Text>
          <Text style={styles.emptyText}>
            다른 상황이나 스타일로 다시 입력해 주세요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
          renderItem={({ item }) => (
            <ProductGridCard product={item} width={CARD_WIDTH} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Palette.textPrimary,
  },
  emptyText: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.gray500,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.lg,
    height: 54,
    paddingHorizontal: Spacing.lg,
    borderRadius: 999,
    backgroundColor: Palette.pink500,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Palette.white,
  },
});
