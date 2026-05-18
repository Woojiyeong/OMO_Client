import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/spacing';
import { Button } from '@/components/ui/button';
import { OnboardingScreen } from '@/components/ui/onboarding-screen';
import { StyleDropdown } from '@/components/ui/style-dropdown';
import { TextField } from '@/components/ui/text-field';
import { profileSchema, type ProfileForm } from '@/features/onboarding/schema';
import { useOnboardingStore } from '@/features/onboarding/store';

export default function ProfileScreen() {
  const setField = useOnboardingStore((s) => s.setField);
  const stored = useOnboardingStore.getState();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      style: stored.style ?? undefined,
      name: stored.name,
    } as Partial<ProfileForm> as ProfileForm,
  });

  const onSubmit = handleSubmit(({ style, name }) => {
    setField('style', style);
    setField('name', name);
    router.push('/(onboarding)/body');
  });

  return (
    <OnboardingScreen
      progress={0.75}
      title={'오모에서 사용할\n스타일을 선택하고 이름을 입력해 주세요.'}
      footer={
        <Button onPress={onSubmit} disabled={!isValid}>
          다음으로
        </Button>
      }
    >
      <View style={styles.row}>
        <View style={styles.col}>
          <Controller
            control={control}
            name="style"
            render={({ field: { onChange, value } }) => (
              <StyleDropdown
                value={value ?? null}
                onChange={onChange}
                error={errors.style?.message}
              />
            )}
          />
        </View>
        <View style={styles.col}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="이름"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
              />
            )}
          />
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
});
