import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { BrandText } from '@/components/ui/brand-text';

const VISIBLE_MS = 1000;
const FADE_MS = 400;

export function Intro({ onFinish }: { onFinish: () => void }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      VISIBLE_MS,
      withTiming(0, { duration: FADE_MS, easing: Easing.out(Easing.ease) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, [opacity, onFinish]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View pointerEvents="none" style={[styles.container, animatedStyle]}>
      <BrandText />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
