import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HangerAnimation } from '@/components/ai/hanger-animation';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

const TRANSITION_MS = 2500;

export default function AiLoadingScreen() {
  const { query } = useLocalSearchParams<{ query?: string }>();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace({ pathname: '/ai-results', params: { query: query ?? '' } });
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
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
    alignItems: 'center',
    justifyContent: 'center',
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
