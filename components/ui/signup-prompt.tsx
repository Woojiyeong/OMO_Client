import { Pressable, StyleSheet, Text } from 'react-native';

import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type Props = {
  onPress?: () => void;
};

export function SignupPrompt({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel="아직 회원이 아니라면 회원가입하기"
      hitSlop={8}
    >
      <Text style={styles.lead}>
        아직 회원이 아니라면 <Text style={styles.cta}>회원가입하기</Text>
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
    textAlign: 'center',
  },
  cta: {
    color: Palette.pink500,
    textDecorationLine: 'underline',
  },
});
