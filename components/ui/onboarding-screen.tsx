import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

import { LoginPrompt } from './login-prompt';
import { ProgressBar } from './progress-bar';

type Props = {
  progress: number; // 0~1
  title: string;
  children: ReactNode;
  footer: ReactNode;
};

export function OnboardingScreen({ progress, title, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const showBack = router.canGoBack();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="이전으로"
              style={styles.backHit}
            >
              <Ionicons name="chevron-back" size={24} color="#111111" />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.progressWrap}>
          <ProgressBar value={progress} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.title}>{title}</ThemedText>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing.base) + Spacing.sm },
        ]}
      >
        {footer}
        <View style={styles.linkWrap}>
          <LoginPrompt onPress={() => router.push('/(onboarding)/login')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.white },
  kav: { flex: 1 },
  header: {
    height: 48,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    justifyContent: 'center',
  },
  backHit: {
    width: 44,
    height: 44,
    marginLeft: -Spacing.sm,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  progressWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xxl,
  },
  title: {
    ...Typography.display,
    fontSize: 20,
    lineHeight: 28,
    color: Palette.black,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    gap: Spacing.lg,
  },
  linkWrap: {
    alignItems: 'center',
  },
});
