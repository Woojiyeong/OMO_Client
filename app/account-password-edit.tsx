import { zodResolver } from '@hookform/resolvers/zod';
import { router, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/password-field';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { verifyCurrentPassword } from '@/features/auth/api';
import {
  accountPasswordSchema,
  type AccountPasswordForm,
} from '@/features/auth/schema';
import { useAuthStore } from '@/features/auth/store';

export default function AccountPasswordEditScreen() {
  const navigation = useNavigation();
  const setCredentials = useAuthStore((s) => s.setCredentials);

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<AccountPasswordForm>({
    resolver: zodResolver(accountPasswordSchema),
    mode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const currentPasswordValue = watch('currentPassword');
  const newPasswordValue = watch('newPassword');
  const confirmValue = watch('confirm');

  const [submitting, setSubmitting] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e: any) => {
      if (!isDirty || savingRef.current) return;
      e.preventDefault();
      Alert.alert(
        '변경사항을 저장하지 않고 나갈까요?',
        '입력한 내용이 사라져요.',
        [
          { text: '계속 편집', style: 'cancel' },
          {
            text: '나가기',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
        { cancelable: true },
      );
    });
    return unsub;
  }, [navigation, isDirty]);

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setSubmitting(true);
    try {
      const res = await verifyCurrentPassword(currentPassword);
      if (!res.ok) {
        setError('currentPassword', {
          type: 'manual',
          message: '비밀번호가 일치하지 않아요.',
        });
        return;
      }
      setCredentials({ currentPassword: newPassword });
      savingRef.current = true;
      router.back();
    } finally {
      setSubmitting(false);
    }
  });

  const currentPasswordError =
    currentPasswordValue.length > 0 ? errors.currentPassword?.message : undefined;
  const newPasswordError =
    newPasswordValue.length > 0 ? errors.newPassword?.message : undefined;
  const confirmError = confirmValue.length > 0 ? errors.confirm?.message : undefined;

  const canSave = isValid && isDirty && !submitting;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          style={styles.headerSide}
        >
          <ChevronLeft />
        </Pressable>
        <Text style={styles.headerTitle}>비밀번호 변경</Text>
        <View style={styles.headerSide} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordField
                label="현재 비밀번호"
                placeholder="현재 비밀번호를 입력해 주세요."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={currentPasswordError}
              />
            )}
          />
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordField
                label="새 비밀번호"
                placeholder="특수문자 포함 8자 이상"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={newPasswordError}
              />
            )}
          />
          <Controller
            control={control}
            name="confirm"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordField
                label="새 비밀번호 확인"
                placeholder="새 비밀번호를 한번 더 입력해 주세요."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={confirmError}
              />
            )}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={onSubmit} disabled={!canSave} loading={submitting}>
            저장
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  safeArea: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  headerSide: {
    minWidth: 48,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Palette.textPrimary,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    backgroundColor: Palette.white,
  },
});
