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
import { ErrorText } from '@/components/ui/error-text';
import { PasswordField } from '@/components/ui/password-field';
import { PillButton } from '@/components/ui/pill-button';
import { TextField } from '@/components/ui/text-field';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { changeLoginId, checkAccountIdAvailable } from '@/features/auth/api';
import { accountIdSchema, type AccountIdForm } from '@/features/auth/schema';
import { useAuthStore } from '@/features/auth/store';

export default function AccountIdEditScreen() {
  const navigation = useNavigation();
  const currentId = useAuthStore((s) => s.currentId);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<AccountIdForm>({
    resolver: zodResolver(accountIdSchema),
    mode: 'onChange',
    defaultValues: { username: currentId, currentPassword: '' },
  });

  const username = watch('username');
  const currentPassword = watch('currentPassword');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    setAvailable(null);
    setCheckError(null);
    setSubmitError(null);
  }, [username]);

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

  const onCheck = handleSubmit(async ({ username }) => {
    setChecking(true);
    try {
      const res = await checkAccountIdAvailable(username);
      setAvailable(res.available);
    } catch (e) {
      setCheckError(e instanceof Error ? e.message : '아이디 확인에 실패했어요.');
    } finally {
      setChecking(false);
    }
  });

  const onSubmit = handleSubmit(async ({ username, currentPassword }) => {
    setSaving(true);
    setSubmitError(null);
    try {
      await changeLoginId({ newLoginId: username, currentPassword });
      savingRef.current = true;
      router.replace('/(onboarding)/login');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '아이디 변경에 실패했어요.');
    } finally {
      setSaving(false);
    }
  });

  const fieldError =
    errors.username?.message ??
    checkError ??
    (available === false ? '이미 사용중인 아이디예요.' : undefined);
  const canSave =
    available === true &&
    isValid &&
    isDirty &&
    currentPassword.length > 0 &&
    !saving;

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
        <Text style={styles.headerTitle}>아이디 변경</Text>
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
          <View style={styles.currentRow}>
            <Text style={styles.currentLabel}>현재 아이디</Text>
            <Text style={styles.currentValue}>{currentId}</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="새 아이디"
                  placeholder="새 아이디를 입력해 주세요."
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
                error={errors.currentPassword?.message}
              />
            )}
          />

          {submitError ? <ErrorText>{submitError}</ErrorText> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={onSubmit} disabled={!canSave} loading={saving}>
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
  currentRow: {
    backgroundColor: Palette.gray50,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: 2,
  },
  currentLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Palette.gray500,
  },
  currentValue: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Palette.textPrimary,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    backgroundColor: Palette.white,
  },
});
