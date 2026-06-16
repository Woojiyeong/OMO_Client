import type { StyleOption } from "./styles";

import { apiFetch } from "@/features/api/client";
import { toApiStyleKeyword } from "@/features/api/style-keyword";
import { fetchMyProfile } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import { useOnboardingStore } from "@/features/onboarding/store";

export type SignUpPayload = {
  email: string;
  username: string;
  password: string;
  style: StyleOption;
  name: string;
  height: number;
  weight: number;
};

type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

type SendVerificationCodeResponse = {
  pendingToken: string;
};

type VerifyCodeResponse = {
  verifiedToken: string;
};

export async function sendVerificationCode(
  email: string,
): Promise<SendVerificationCodeResponse> {
  return apiFetch<SendVerificationCodeResponse>("/auth/email/send-code", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email }),
  });
}

export async function verifyCode(
  pendingToken: string,
  code: string,
): Promise<VerifyCodeResponse> {
  return apiFetch<VerifyCodeResponse>("/auth/email/verify-code", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ pendingToken, code }),
  });
}

export async function checkUsername(
  username: string,
): Promise<{ available: boolean }> {
  return apiFetch<{ available: boolean }>(
    `/auth/check-login-id?loginId=${encodeURIComponent(username)}`,
    { skipAuth: true },
  );
}

export async function signUp(
  payload: SignUpPayload,
): Promise<{ ok: true; userId: string }> {
  const verifiedToken = useOnboardingStore.getState().emailVerificationToken;
  if (!verifiedToken) {
    throw new Error("이메일 인증 토큰이 없어요. 이메일 인증을 다시 진행해주세요.");
  }

  const registerPayload = {
    loginId: payload.username,
    email: payload.email,
    password: payload.password,
    nickname: payload.name,
    styleKeyword: toApiStyleKeyword(payload.style),
    height: payload.height,
    weight: payload.weight,
    verifiedToken,
  };

  if (__DEV__) {
    console.log("signup request", {
      ...registerPayload,
      password: "[hidden]",
      verifiedToken: `${verifiedToken.slice(0, 8)}...`,
    });
  }

  await apiFetch<unknown>("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(registerPayload),
  });

  const tokens = await apiFetch<AuthTokenResponse>("/auth/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({
      loginId: payload.username,
      password: payload.password,
    }),
  });

  useAuthStore.getState().setTokens(tokens);
  useAuthStore.getState().setCredentials({
    currentId: payload.username,
  });

  await fetchMyProfile().catch(() => undefined);

  return { ok: true, userId: payload.username };
}
