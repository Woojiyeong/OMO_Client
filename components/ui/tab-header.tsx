import { StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

type Props = {
  title: string;
};

export function TabHeader({ title }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    paddingHorizontal: Spacing.base,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
    backgroundColor: Palette.white,
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Palette.textPrimary,
  },
});
