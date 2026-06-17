import { forwardRef, ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily, Typography } from '@/constants/typography';

import { ErrorText } from './error-text';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  rightSlot?: ReactNode;
  containerStyle?: ViewStyle;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, rightSlot, containerStyle, style, ...rest },
  ref,
) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.row, error && styles.errorBorder]}>
        <TextInput
          ref={ref}
          {...rest}
          placeholderTextColor={Palette.gray400}
          style={[styles.input, style]}
          accessibilityLabel={rest.accessibilityLabel ?? label ?? rest.placeholder}
        />
        {rightSlot ? <View style={styles.right}>{rightSlot}</View> : null}
      </View>
      {error ? <ErrorText style={styles.errorText}>{error}</ErrorText> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    ...Typography.label,
    color: Palette.gray800,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderWidth: 1,
    borderColor: Palette.gray150,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    backgroundColor: Palette.white,
  },
  errorBorder: {
    borderColor: Palette.pink500,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 17,
    color: Palette.black,
    paddingVertical: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  right: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
});
