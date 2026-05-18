import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { ErrorText } from '@/components/ui/error-text';
import { OnboardingScreen } from '@/components/ui/onboarding-screen';
import { PillButton } from '@/components/ui/pill-button';
import { TextField } from '@/components/ui/text-field';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { sendVerificationCode, verifyCode } from '@/features/onboarding/api';
import { emailSchema, type EmailForm } from '@/features/onboarding/schema';
import { useOnboardingStore } from '@/features/onboarding/store';
import { useResendTimer } from '@/hooks/use-resend-timer';

const AUTO_NEXT_MS = 700;

export default function EmailScreen() {
  const setField = useOnboardingStore((s) => s.setField);
  const markEmailVerified = useOnboardingStore((s) => s.markEmailVerified);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: useOnboardingStore.getState().email },
  });

  const email = watch('email');

  const [sending, setSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const codeRef = useRef<TextInput>(null);
  const timer = useResendTimer(300);

  // 입력값 바뀌면 인증 상태 초기화
  useEffect(() => {
    if (codeSent) {
      setCodeSent(false);
      setCode('');
      setVerifyError(null);
      setVerified(false);
      timer.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const onSendCode = handleSubmit(async ({ email }) => {
    setSending(true);
    try {
      await sendVerificationCode(email);
      setField('email', email);
      setCodeSent(true);
      timer.start();
      setTimeout(() => codeRef.current?.focus(), 250);
    } finally {
      setSending(false);
    }
  });

  const tryVerify = async (raw: string) => {
    if (raw.length !== 6 || verifying || verified) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      await verifyCode(email, raw);
      markEmailVerified();
      setVerified(true);
      timer.stop();
      setTimeout(() => router.push('/(onboarding)/username'), AUTO_NEXT_MS);
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : '인증에 실패했어요.');
    } finally {
      setVerifying(false);
    }
  };

  const goNext = () => router.push('/(onboarding)/username');

  return (
    <OnboardingScreen
      progress={0.1}
      title={'오모에서 사용하실\n이메일을 입력해주세요'}
      footer={
        <Button onPress={goNext} disabled={!verified}>
          다음으로
        </Button>
      }
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            placeholder="이메일을 입력해 주세요."
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={touchedFields.email ? errors.email?.message : undefined}
            rightSlot={
              <PillButton
                active={isValid && !sending}
                loading={sending}
                onPress={onSendCode}
              >
                {codeSent && timer.active ? '재전송' : '확인'}
              </PillButton>
            }
          />
        )}
      />

      {codeSent && (
        <Animated.View entering={FadeInDown.duration(220)} style={styles.codeWrap}>
          <View style={styles.codeFieldGroup}>
            <TextField
              ref={codeRef}
              label="인증코드"
              placeholder="6자리 숫자"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(t) => {
                const digits = t.replace(/\D/g, '');
                setCode(digits);
                setVerifyError(null);
                if (digits.length === 6) tryVerify(digits);
              }}
              error={verifyError ?? undefined}
              editable={!verified}
              rightSlot={
                verified ? null : (
                  <Text style={styles.timer}>
                    {timer.active ? timer.formatted : timer.expired ? '만료' : ''}
                  </Text>
                )
              }
            />
            {verified && (
              <ErrorText iconName="checkmark-circle">인증이 되었습니다</ErrorText>
            )}
          </View>
          {timer.expired && !verified && (
            <View style={styles.expiredRow}>
              <ErrorText>인증 시간이 만료되었어요.</ErrorText>
            </View>
          )}
        </Animated.View>
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  codeWrap: {
    gap: Spacing.sm,
  },
  codeFieldGroup: {
    gap: Spacing.xs,
  },
  timer: {
    ...Typography.caption,
    color: Palette.pink500,
    minWidth: 44,
    textAlign: 'right',
  },
  expiredRow: {
    paddingTop: Spacing.xs,
  },
});
