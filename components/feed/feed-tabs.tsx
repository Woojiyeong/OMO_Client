import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

export type FeedTab = 'following' | 'trend';

type Props = {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
};

const TABS: { value: FeedTab; label: string }[] = [
  { value: 'following', label: '팔로잉' },
  { value: 'trend', label: '트렌드' },
];

export function FeedTabs({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const selected = active === tab.value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
          >
            <Text style={[styles.label, selected ? styles.labelActive : styles.labelInactive]}>
              {tab.label}
            </Text>
            {selected && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.xxl,
    backgroundColor: Palette.white,
  },
  tab: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
  labelActive: {
    fontFamily: FontFamily.bold,
    color: Palette.textPrimary,
  },
  labelInactive: {
    fontFamily: FontFamily.regular,
    color: Palette.grayBorder,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: Palette.pink500,
    borderRadius: 1,
  },
});
