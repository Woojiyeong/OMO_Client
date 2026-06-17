import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type Variant = 'compact' | 'block';

type Props = {
  following: boolean;
  pending?: boolean;
  onPress: () => void;
  variant?: Variant;
};

const DEBOUNCE_MS = 300;

export function FollowButton({ following, pending, onPress, variant = 'compact' }: Props) {
  const lastTapRef = useRef(0);

  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < DEBOUNCE_MS) return;
    lastTapRef.current = now;
    onPress();
  }, [onPress]);

  const isBlock = variant === 'block';

  return (
    <Pressable
      onPress={handlePress}
      disabled={pending}
      accessibilityRole="button"
      accessibilityLabel={following ? '팔로잉' : '팔로우'}
      accessibilityState={{ disabled: !!pending }}
      style={[
        styles.base,
        isBlock ? styles.block : styles.compact,
        following ? styles.following : styles.notFollowing,
        pending && styles.pending,
      ]}
    >
      <Text
        style={[
          isBlock ? styles.textBlock : styles.textCompact,
          following ? styles.textFollowing : styles.textNotFollowing,
        ]}
      >
        {following ? '팔로잉' : '팔로우'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 9999,
  },
  block: {
    height: 46,
    borderRadius: 8,
    width: '100%',
  },
  following: {
    backgroundColor: Palette.gray230,
  },
  notFollowing: {
    backgroundColor: Palette.pink500,
  },
  pending: {
    opacity: 0.6,
  },
  textCompact: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
  },
  textBlock: {
    fontFamily: FontFamily.semibold,
    fontSize: 15,
  },
  textFollowing: {
    color: Palette.textPrimary,
  },
  textNotFollowing: {
    color: Palette.white,
  },
});
