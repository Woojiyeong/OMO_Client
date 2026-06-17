import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

export function SkeletonRow() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.avatar, animatedStyle]} />
      <View style={styles.textBlock}>
        <Animated.View style={[styles.lineLong, animatedStyle]} />
        <Animated.View style={[styles.lineShort, animatedStyle]} />
      </View>
      <Animated.View style={[styles.button, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.gray220,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  lineLong: {
    height: 12,
    width: '60%',
    borderRadius: 6,
    backgroundColor: Palette.gray220,
  },
  lineShort: {
    height: 10,
    width: '40%',
    borderRadius: 5,
    backgroundColor: Palette.gray220,
  },
  button: {
    width: 88,
    height: 54,
    borderRadius: 27,
    backgroundColor: Palette.gray220,
  },
});
