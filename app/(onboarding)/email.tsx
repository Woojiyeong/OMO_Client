import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/error-text";
import { OnboardingScreen } from "@/components/ui/onboarding-screen";
import { PillButton } from "@/components/ui/pill-button";
import { TextField } from "@/components/ui/text-field";
import { Palette } from "@/constants/colors";
import { Radius, Spacing } from "@/constants/spacing";
import { Typography } from "@/constants/typography";
import {
  sendVerificationCode,
  verifyCode,
} from "@/features/onboarding/api";
import { emailSchema, type EmailForm } from "@/features/onboarding/schema";
import { useOnboardingStore } from "@/features/onboarding/store";
import { useResendTimer } from "@/hooks/use-resend-timer";

export default function EmailScreen() {
  const setField = useOnboardingStore((s) => s.setField);
  const markEmailVerified = useOnboardingStore((s) => s.markEmailVerified);
  const setEmailPendingToken = useOnboardingStore(
    (s) => s.setEmailPendingToken,
  );
  const setEmailVerificationToken = useOnboardingStore(
    (s) => s.setEmailVerificationToken,
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { email: useOnboardingStore.getState().email },
  });

  const email = watch("email");
  const [sending, setSending] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const codeRef = useRef<TextInput>(null);
  const timer = useResendTimer(300);

  useEffect(() => {
    if (!codeSent) return;
    setCodeSent(false);
    setCode("");
    setVerifyError(null);
    setVerified(false);
    timer.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const onSendCode = handleSubmit(async ({ email }) => {
    setSending(true);
    setVerifyError(null);
    try {
      const response = await sendVerificationCode(email);
      setField("email", email);
      setEmailPendingToken(response.pendingToken);
      setCodeSent(true);
      timer.start();
      setTimeout(() => codeRef.current?.focus(), 250);
    } catch (e) {
      setVerifyError(
        e instanceof Error ? e.message : "인증 메일 발송에 실패했어요.",
      );
    } finally {
      setSending(false);
    }
  });

  const tryVerify = async (raw = code) => {
    if (raw.length !== 6 || verifying || verified) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      const response = await verifyCode(
        useOnboardingStore.getState().emailPendingToken,
        raw,
      );
      if (!response.verifiedToken) {
        throw new Error("인증 토큰을 받지 못했어요. 인증을 다시 시도해주세요.");
      }
      setField("email", email);
      setEmailVerificationToken(response.verifiedToken);
      markEmailVerified();
      setVerified(true);
      timer.stop();
      router.push("/(onboarding)/username");
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "인증에 실패했어요.");
    } finally {
      setVerifying(false);
    }
  };

  const goNext = () => {
    setField("email", email);
    router.push("/(onboarding)/username");
  };
  const canVerify = code.length === 6 && !verifying && !verified;

  return (
    <OnboardingScreen
      progress={0.1}
      title={"오모에서 사용하실\n이메일을 입력해주세요"}
      footer={
        <Button onPress={goNext} disabled={!verified}>
          다음으로
        </Button>
      }
    >
      <View style={styles.fieldGroup}>
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
                  active={isValid && !sending && !verified}
                  loading={sending}
                  onPress={onSendCode}
                >
                  {codeSent && timer.active ? "재전송" : "확인"}
                </PillButton>
              }
            />
          )}
        />
        {!codeSent && verifyError ? <ErrorText>{verifyError}</ErrorText> : null}
      </View>

      {codeSent ? (
        <Animated.View
          entering={FadeInDown.duration(220)}
          style={styles.codeWrap}
        >
          <View style={styles.codeFieldGroup}>
            <View style={styles.codeInputRow}>
              <TextField
                ref={codeRef}
                label="인증코드"
                placeholder="6자리 숫자"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={(text) => {
                  const digits = text.replace(/\D/g, "");
                  setCode(digits);
                  setVerifyError(null);
                }}
                error={verifyError ?? undefined}
                editable={!verified}
                containerStyle={styles.codeInput}
                rightSlot={
                  verified ? null : (
                    <Text style={styles.timer}>
                      {timer.active
                        ? timer.formatted
                        : timer.expired
                          ? "만료"
                          : ""}
                    </Text>
                  )
                }
              />
              {!verified ? (
                <View style={styles.verifyButtonWrap}>
                  <PillButton
                    active={canVerify}
                    loading={verifying}
                    onPress={() => tryVerify()}
                    style={styles.verifyButton}
                  >
                    인증 확인
                  </PillButton>
                </View>
              ) : null}
            </View>
            {verified ? (
              <ErrorText iconName="checkmark-circle">
                인증이 되었습니다
              </ErrorText>
            ) : null}
          </View>
          {timer.expired && !verified ? (
            <ErrorText>인증 시간이 만료되었어요.</ErrorText>
          ) : null}
        </Animated.View>
      ) : null}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: Spacing.xs,
  },
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
    textAlign: "right",
  },
  codeInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  codeInput: {
    flex: 1,
  },
  verifyButtonWrap: {
    paddingTop: 28,
  },
  verifyButton: {
    height: 56,
    borderRadius: Radius.lg,
  },
});
