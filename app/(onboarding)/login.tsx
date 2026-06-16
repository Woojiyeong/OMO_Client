import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandText } from '@/components/ui/brand-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ErrorText } from '@/components/ui/error-text';
import { PasswordField } from '@/components/ui/password-field';
import { SignupPrompt } from '@/components/ui/signup-prompt';
import { TextField } from '@/components/ui/text-field';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { login } from '@/features/auth/api';
import { loginSchema, type LoginForm } from '@/features/auth/schema';

const LOGO_TOP_FROM_SCREEN = 190;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { id: '', password: '' },
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const id = watch('id');
  const password = watch('password');
  const canSubmit = id.trim().length > 0 && password.length > 0 && !loading;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setLoading(true);
    try {
      await login(values);
      router.replace('/(tabs)');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '로그인에 실패했어요.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginTop: Math.max(LOGO_TOP_FROM_SCREEN - insets.top, Spacing.xl) }}>
            <BrandText size="sm" align="left" />
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="id"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  placeholder="아이디를 입력해 주세요."
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  accessibilityLabel="아이디 입력"
                  error={touchedFields.id ? errors.id?.message : undefined}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordField
                  placeholder="비밀번호를 입력해 주세요."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  accessibilityLabel="비밀번호 입력"
                  error={touchedFields.password ? errors.password?.message : undefined}
                />
              )}
            />

            <View style={styles.optionsRow}>
              <Checkbox checked={rememberMe} onChange={setRememberMe} label="로그인 저장" />
              <Pressable
                onPress={() => {}}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel="비밀번호 찾기"
              >
                <Text style={styles.findLink}>비밀번호 찾기</Text>
              </Pressable>
            </View>

            {submitError ? (
              <View style={styles.submitErrorWrap}>
                <ErrorText>{submitError}</ErrorText>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing.base) + Spacing.sm },
        ]}
      >
        <Button onPress={onSubmit} loading={loading} disabled={!canSubmit}>
          로그인하기
        </Button>
        <View style={styles.linkWrap}>
          <SignupPrompt onPress={() => router.push('/(onboarding)/email')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.white },
  kav: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  form: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  findLink: {
    ...Typography.caption,
    color: Palette.pink500,
    textDecorationLine: 'underline',
  },
  submitErrorWrap: {
    marginTop: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    gap: Spacing.lg,
  },
  linkWrap: {
    alignItems: 'center',
  },
});
