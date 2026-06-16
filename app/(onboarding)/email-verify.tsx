import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ErrorText } from '@/components/ui/error-text';
import { OnboardingScreen } from '@/components/ui/onboarding-screen';
import { PillButton } from '@/components/ui/pill-button';
import { TextField } from '@/components/ui/text-field';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import {
  sendVerificationCode,
  verifyCode,
} from '@/features/onboarding/api';
import { useOnboardingStore } from '@/features/onboarding/store';
import { useResendTimer } from '@/hooks/use-resend-timer';

export default function EmailVerifyScreen() {
  const email = useOnboardingStore((s) => s.email);
  const markEmailVerified = useOnboardingStore((s) => s.markEmailVerified);
  const setEmailPendingToken = useOnboardingStore((s) => s.setEmailPendingToken);
  const setEmailVerificationToken = useOnboardingStore(
    (s) => s.setEmailVerificationToken,
  );
  const markOnboarded = useOnboardingStore((s) => s.markOnboarded);
  const reset = useOnboardingStore((s) => s.reset);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<TextInput>(null);
  const timer = useResendTimer(300);

  useEffect(() => {
    timer.start();
    const focusTimer = setTimeout(() => codeRef.current?.focus(), 250);
    return () => clearTimeout(focusTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (raw = code) => {
    if (raw.length !== 6 || verifying || verified) return;
    setVerifying(true);
    setError(null);
    try {
      const response = await verifyCode(
        useOnboardingStore.getState().emailPendingToken,
        raw,
      );
      if (!response.verifiedToken) {
        throw new Error('인증 토큰을 받지 못했어요. 인증을 다시 시도해주세요.');
      }
      setEmailVerificationToken(response.verifiedToken);
      markEmailVerified();
      setVerified(true);
      timer.stop();
    } catch (e) {
      setError(e instanceof Error ? e.message : '인증에 실패했어요.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending || timer.active) return;
    setResending(true);
    setError(null);
    try {
      const response = await sendVerificationCode(email);
      setEmailPendingToken(response.pendingToken);
      timer.start();
      setTimeout(() => codeRef.current?.focus(), 250);
    } catch (e) {
      setError(e instanceof Error ? e.message : '인증코드 재전송에 실패했어요.');
    } finally {
      setResending(false);
    }
  };

  const goNext = () => {
    reset();
    markOnboarded();
    router.replace('/(tabs)');
  };
  const canVerify = code.length === 6 && !verifying && !verified;

  return (
    <OnboardingScreen
      progress={1}
      title={'메일로 받은\n인증코드를 입력해주세요'}
      footer={
        <Button onPress={goNext} disabled={!verified}>
          시작하기
        </Button>
      }
    >
      <View style={styles.fields}>
        <Text style={styles.email}>{email}</Text>
        <TextField
          ref={codeRef}
          label="인증코드"
          placeholder="6자리 숫자"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, '');
            setCode(digits);
            setError(null);
            if (digits.length === 6) handleVerify(digits);
          }}
          error={error ?? undefined}
          editable={!verified}
          rightSlot={
            verified ? null : (
              <Text style={styles.timer}>
                {timer.active ? timer.formatted : timer.expired ? '만료' : ''}
              </Text>
            )
          }
        />
        {verified ? (
          <ErrorText iconName="checkmark-circle">인증이 되었습니다</ErrorText>
        ) : null}
        <View style={styles.actions}>
          <PillButton active={canVerify} loading={verifying} onPress={() => handleVerify()}>
            인증 확인
          </PillButton>
          <PillButton
            active={!timer.active && !resending}
            loading={resending}
            onPress={handleResend}
          >
            재전송
          </PillButton>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: Spacing.sm,
  },
  email: {
    ...Typography.caption,
    color: Palette.gray500,
  },
  timer: {
    ...Typography.caption,
    color: Palette.pink500,
    minWidth: 44,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
});
