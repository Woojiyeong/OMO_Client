import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

type Props = {
  title: string;
  onBack: () => void;
};

export function ScreenHeader({ title, onBack }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        style={styles.side}
      >
        <ChevronLeft />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.side} />
    </View>
  );
}

function ChevronLeft() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={Palette.textPrimary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
    backgroundColor: Palette.white,
  },
  side: {
    minWidth: 48,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Palette.textPrimary,
  },
});
