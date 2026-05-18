import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Palette } from '@/constants/colors';

type Props = {
  value: number; // 0~1
};

// 화면 간 이동 시 이전 진행률에서 새 진행률로 자라는 효과를 주기 위해
// 모듈 스코프에 마지막 값을 보관한다.
let lastProgress = 0;

export function ProgressBar({ value }: Props) {
  const target = Math.max(0, Math.min(1, value));
  const v = useSharedValue(lastProgress);

  useEffect(() => {
    v.value = withTiming(target, { duration: 600 });
    lastProgress = target;
  }, [v, target]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${v.value * 100}%`,
  }));

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100) }}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: Palette.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Palette.pink500,
    borderRadius: 3,
  },
});
