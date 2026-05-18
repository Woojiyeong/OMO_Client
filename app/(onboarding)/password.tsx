import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { OnboardingScreen } from '@/components/ui/onboarding-screen';
import { PasswordField } from '@/components/ui/password-field';
import { Spacing } from '@/constants/spacing';
import { passwordSchema, type PasswordForm } from '@/features/onboarding/schema';
import { useOnboardingStore } from '@/features/onboarding/store';

export default function PasswordScreen() {
  const setField = useOnboardingStore((s) => s.setField);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirm: '' },
  });

  const passwordValue = watch('password');
  const confirmValue = watch('confirm');

  const passwordError = passwordValue.length > 0 ? errors.password?.message : undefined;
  const confirmError = confirmValue.length > 0 ? errors.confirm?.message : undefined;

  const onSubmit = handleSubmit(({ password }) => {
    setField('password', password);
    router.push('/(onboarding)/profile');
  });

  return (
    <OnboardingScreen
      progress={0.5}
      title={'오모에서 사용하실\n비밀번호를 입력해 주세요.'}
      footer={
        <Button onPress={onSubmit} disabled={!isValid}>
          다음으로
        </Button>
      }
    >
      <View style={styles.fields}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordField
              label="비밀번호"
              placeholder="비밀번호를 입력해 주세요."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={passwordError}
            />
          )}
        />
        <Controller
          control={control}
          name="confirm"
          render={({ field: { onChange, onBlur, value } }) => (
            <PasswordField
              label="비밀번호 재입력"
              placeholder="비밀번호를 한번 더 입력해 주세요."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={confirmError}
            />
          )}
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: Spacing.lg,
  },
});
