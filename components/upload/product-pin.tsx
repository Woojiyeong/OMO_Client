import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Palette } from '@/constants/colors';

type Props = {
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
  onPress: () => void;
};

const PIN_SIZE = 34;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ProductPin({ x, y, containerWidth, containerHeight, onPress }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.6);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 280 });
    scale.value = withTiming(1, { duration: 280 });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pressScale.value }],
  }));

  const left = x * containerWidth - PIN_SIZE / 2;
  const top = y * containerHeight - PIN_SIZE / 2;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        pressScale.value = withTiming(0.88, { duration: 80 });
      }}
      onPressOut={() => {
        pressScale.value = withTiming(1, { duration: 120 });
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="상품 핀"
      style={[styles.pin, { left, top }, animatedStyle]}
    >
      <View style={styles.dot} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pin: {
    position: 'absolute',
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.pink500,
  },
});
