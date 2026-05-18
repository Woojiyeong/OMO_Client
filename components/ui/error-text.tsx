import Ionicons from '@expo/vector-icons/Ionicons';
import { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

type IconName = 'alert-circle' | 'checkmark-circle';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  showIcon?: boolean;
  iconName?: IconName;
};

export function ErrorText({
  children,
  style,
  showIcon = true,
  iconName = 'alert-circle',
}: Props) {
  return (
    <View
      style={[styles.row, style]}
      accessibilityRole="alert"
      accessibilityLiveRegion={Platform.OS === 'android' ? 'polite' : undefined}
    >
      {showIcon ? (
        <Ionicons name={iconName} size={14} color={Palette.pink500} style={styles.icon} />
      ) : null}
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  icon: {
    marginTop: 1,
  },
  text: {
    ...Typography.caption,
    color: Palette.pink500,
  },
});
