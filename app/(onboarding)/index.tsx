import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandText } from '@/components/ui/brand-text';
import { Button } from '@/components/ui/button';
import { LoginPrompt } from '@/components/ui/login-prompt';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={styles.center} pointerEvents="none">
        <BrandText />
      </View>
      <View
        style={[
          styles.bottom,
          { paddingBottom: Math.max(insets.bottom, Spacing.base) + Spacing.sm },
        ]}
      >
        <Button onPress={() => router.push('/(onboarding)/email')}>시작하기</Button>
        <View style={styles.linkWrap}>
          <LoginPrompt onPress={() => router.push('/(onboarding)/login')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    gap: Spacing.lg,
  },
  linkWrap: {
    alignItems: 'center',
  },
});
