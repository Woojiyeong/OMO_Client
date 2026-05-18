import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, ViewStyle } from 'react-native';

import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

import { TextField } from './text-field';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export const PasswordField = forwardRef<TextInput, Props>(function PasswordField(
  { label, error, containerStyle, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      ref={ref}
      label={label}
      error={error}
      containerStyle={containerStyle}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      {...rest}
      secureTextEntry={!visible}
      rightSlot={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
          hitSlop={8}
          style={styles.eye}
        >
          <Ionicons
            name={visible ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color={Palette.gray600}
          />
        </Pressable>
      }
    />
  );
});

const styles = StyleSheet.create({
  eye: {
    paddingHorizontal: Spacing.xs,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
