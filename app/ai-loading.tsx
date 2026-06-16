import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HangerAnimation } from "@/components/ai/hanger-animation";
import { Palette } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { FontFamily } from "@/constants/typography";
import { useAiChatStore } from "@/features/ai/store";

const MIN_TRANSITION_MS = 800;

export default function AiLoadingScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();
  const requestRecommendations = useAiChatStore(
    (s) => s.requestRecommendations,
  );

  useEffect(() => {
    const trimmed = query?.trim();
    if (!trimmed) {
      router.replace("/(tabs)/ai");
      return;
    }

    let cancelled = false;
    const startedAt = Date.now();

    requestRecommendations(trimmed)
      .catch(() => undefined)
      .finally(() => {
        const delay = Math.max(MIN_TRANSITION_MS - (Date.now() - startedAt), 0);
        setTimeout(() => {
          if (!cancelled) {
            router.replace({
              pathname: "/ai-results",
              params: { query: trimmed },
            });
          }
        }, delay);
      });

    return () => {
      cancelled = true;
    };
  }, [query, requestRecommendations]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.center}>
        <HangerAnimation />
        <Text style={styles.main}>딱 어울리는 코디를 만들고 있어요</Text>
        <Text style={styles.sub}>오모가 상황을 분석 중이에요..</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  main: {
    marginTop: Spacing.xl,
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Palette.pink500,
  },
  sub: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.gray400,
  },
});
