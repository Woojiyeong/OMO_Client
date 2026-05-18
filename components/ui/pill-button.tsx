import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

type Props = {
  children: string;
  active: boolean;
  onPress?: () => void;
  loading?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PillButton({ children, active, onPress, loading }: Props) {
  const scale = useSharedValue(1);
  const disabled = !active || loading;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        if (!disabled) scale.value = withTiming(0.97, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled: !active, busy: !!loading }}
      style={[
        styles.base,
        active ? styles.active : styles.inactive,
        loading && styles.loading,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={active ? Palette.white : Palette.gray500} />
      ) : (
        <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>
          {children}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 36,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactive: {
    borderColor: Palette.grayBorder,
    backgroundColor: Palette.white,
  },
  active: {
    borderColor: Palette.pink500,
    backgroundColor: Palette.pink500,
  },
  loading: {
    opacity: 0.7,
  },
  text: {
    ...Typography.button,
    fontSize: 14,
    lineHeight: 18,
  },
  textInactive: {
    color: Palette.gray500,
  },
  textActive: {
    color: Palette.white,
  },
});
