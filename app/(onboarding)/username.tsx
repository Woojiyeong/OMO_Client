import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ErrorText } from '@/components/ui/error-text';
import { OnboardingScreen } from '@/components/ui/onboarding-screen';
import { PillButton } from '@/components/ui/pill-button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/spacing';
import { checkUsername } from '@/features/onboarding/api';
import { usernameSchema, type UsernameForm } from '@/features/onboarding/schema';
import { useOnboardingStore } from '@/features/onboarding/store';

export default function UsernameScreen() {
  const setField = useOnboardingStore((s) => s.setField);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<UsernameForm>({
    resolver: zodResolver(usernameSchema),
    mode: 'onChange',
    defaultValues: { username: useOnboardingStore.getState().username },
  });

  const username = watch('username');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  // 입력값 바뀌면 검증 결과 무효화
  useEffect(() => {
    setAvailable(null);
  }, [username]);

  const onCheck = handleSubmit(async ({ username }) => {
    setChecking(true);
    try {
      const res = await checkUsername(username);
      setAvailable(res.available);
    } finally {
      setChecking(false);
    }
  });

  const goNext = () => {
    setField('username', username);
    router.push('/(onboarding)/password');
  };

  const fieldError =
    errors.username?.message ?? (available === false ? '이미 사용중인 아이디예요.' : undefined);
  const canProceed = available === true && !errors.username;

  return (
    <OnboardingScreen
      progress={0.25}
      title={'오모에서 사용하실\n아이디를 입력해 주세요.'}
      footer={
        <Button onPress={goNext} disabled={!canProceed}>
          다음으로
        </Button>
      }
    >
      <View style={styles.fieldGroup}>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              placeholder="아이디를 입력해 주세요."
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldError}
              rightSlot={
                <PillButton
                  active={isValid && !checking}
                  loading={checking}
                  onPress={onCheck}
                >
                  중복 확인
                </PillButton>
              }
            />
          )}
        />
        {available === true && (
          <ErrorText iconName="checkmark-circle">사용 가능한 아이디예요.</ErrorText>
        )}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: Spacing.xs,
  },
});
