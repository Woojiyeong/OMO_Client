import { Pressable, StyleSheet, Text } from 'react-native';

import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type Props = {
  onPress?: () => void;
};

export function LoginPrompt({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel="이미 계정이 있다면 로그인하기"
      hitSlop={8}
    >
      <Text style={styles.lead}>
        이미 계정이 있다면 <Text style={styles.cta}>로그인하기</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#424242',
  },
  cta: {
    color: Palette.pink500,
    textDecorationLine: 'underline',
  },
});
