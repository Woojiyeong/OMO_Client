import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

type Variant = 'primary' | 'secondary';
type Size = 'md' | 'sm';

type Props = {
  onPress?: () => void;
  children: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
  accessibilityLabel,
}: Props) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const variantStyle = isDisabled
    ? styles.disabled
    : variant === 'primary'
      ? styles.primary
      : styles.secondary;

  const textStyle = isDisabled
    ? styles.disabledText
    : variant === 'primary'
      ? styles.primaryText
      : styles.secondaryText;

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={[styles.base, size === 'sm' ? styles.sm : styles.md, variantStyle, animatedStyle, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? Palette.white : Palette.pink500} />
      ) : (
        <Text style={[Typography.button, textStyle, size === 'sm' && styles.smText]}>{children}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  md: {
    height: 52,
    paddingHorizontal: Spacing.lg,
  },
  sm: {
    height: 40,
    paddingHorizontal: Spacing.md,
  },
  primary: {
    backgroundColor: Palette.pink500,
  },
  secondary: {
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.pink500,
  },
  disabled: {
    backgroundColor: '#FFDDEC',
  },
  primaryText: {
    color: Palette.white,
  },
  secondaryText: {
    color: Palette.pink500,
  },
  disabledText: {
    color: Palette.white,
  },
  smText: {
    fontSize: 14,
  },
});
