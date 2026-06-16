import { apiFetch, resolveApiAssetUrl } from '@/features/api/client';
import {
  toApiStyleKeyword,
  toAppStyleKeyword,
  type ApiStyleKeyword,
} from '@/features/api/style-keyword';
import { useProfileStore } from '@/features/profile/store';

import { useAuthStore } from './store';

export type LoginPayload = {
  id: string;
  password: string;
};

export type LoginResult = {
  ok: true;
  userId: string;
  token: string;
};

type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

type ImageFile = {
  uri: string;
  name?: string;
  type?: string;
};

type ApiProfile = {
  id: string;
  loginId: string;
  email: string;
  nickname: string;
  isEmailVerified?: boolean;
  styleKeyword: ApiStyleKeyword;
  height: number;
  weight: number;
  bio: string | null;
  profileImage: string | null;
  role?: 'USER' | 'ADMIN';
  createdAt?: string;
};

function getAccessToken() {
  const token = useAuthStore.getState().accessToken;
  if (!token) throw new Error('로그인이 필요해요.');
  return token;
}

function clearAuthSession() {
  useAuthStore.getState().clearTokens();
  useAuthStore.getState().setCredentials({
    currentUserId: '',
    currentId: '',
    currentPassword: '',
  });
}

function syncProfile(profile: ApiProfile) {
  useProfileStore.getState().setProfile({
    name: profile.nickname ?? '',
    keyword: toAppStyleKeyword(profile.styleKeyword),
    heightCm: profile.height ?? 0,
    weightKg: profile.weight ?? 0,
    bio: profile.bio ?? '',
    avatarUri: resolveApiAssetUrl(profile.profileImage),
  });

  useAuthStore.getState().setCredentials({
    currentId: profile.loginId ?? useAuthStore.getState().currentId,
    currentUserId: profile.id ?? useAuthStore.getState().currentUserId,
  });
}

export async function fetchMyProfile(): Promise<ApiProfile> {
  const profile = await apiFetch<ApiProfile>('/auth/profile', {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  syncProfile(profile);
  return profile;
}

export async function login({ id, password }: LoginPayload): Promise<LoginResult> {
  const tokens = await apiFetch<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ loginId: id, password }),
  });

  useAuthStore.getState().setTokens(tokens);
  useAuthStore.getState().setCredentials({ currentId: id });

  await fetchMyProfile().catch(() => undefined);

  return { ok: true, userId: id, token: tokens.accessToken };
}

export async function checkAccountIdAvailable(id: string): Promise<{ available: boolean }> {
  return apiFetch<{ available: boolean }>(
    `/auth/check-login-id?loginId=${encodeURIComponent(id)}`,
    { skipAuth: true },
  );
}

export async function changeLoginId(payload: {
  newLoginId: string;
  currentPassword: string;
}): Promise<{ ok: true }> {
  await apiFetch<unknown>('/auth/login-id', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(payload),
  });

  clearAuthSession();
  return { ok: true };
}

export async function updateMyProfile(payload: {
  nickname: string;
  styleKeyword: Parameters<typeof toApiStyleKeyword>[0];
  height: number;
  weight: number;
  bio: string;
  profileImage?: string;
}): Promise<ApiProfile> {
  const profile = await apiFetch<ApiProfile>('/auth/profile', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({
      nickname: payload.nickname,
      height: payload.height,
      weight: payload.weight,
      bio: payload.bio,
      profileImage: payload.profileImage,
      styleKeyword: toApiStyleKeyword(payload.styleKeyword),
    }),
  });
  syncProfile(profile);
  return profile;
}

export async function uploadProfileImage(image: ImageFile): Promise<ApiProfile> {
  const formData = new FormData();
  formData.append('image', {
    uri: image.uri,
    name: image.name ?? 'profile.jpg',
    type: image.type ?? 'image/jpeg',
  } as unknown as Blob);

  const profile = await apiFetch<ApiProfile>('/auth/profile/image', {
    method: 'POST',
    body: formData,
  });
  syncProfile(profile);
  return profile;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true }> {
  await apiFetch<unknown>('/auth/password', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(payload),
  });
  clearAuthSession();
  return { ok: true };
}

export async function verifyEmailAfterSignup(code: string): Promise<void> {
  await apiFetch<unknown>('/auth/email/verify', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ code }),
  });
}

export async function resendEmailVerification(): Promise<void> {
  await apiFetch<unknown>('/auth/email/resend', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
}

export async function verifyCurrentPassword(_password: string): Promise<{ ok: boolean }> {
  throw new Error('비밀번호 확인은 비밀번호 변경 API에서 처리돼요.');
}

export async function refreshTokens(): Promise<AuthTokenResponse> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) throw new Error('refreshToken이 없어요.');

  const tokens = await apiFetch<AuthTokenResponse>('/auth/refresh', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({ refreshToken }),
  });
  useAuthStore.getState().setTokens(tokens);
  return tokens;
}

export async function logout(): Promise<void> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return;

  await apiFetch<unknown>('/auth/logout', {
    method: 'DELETE',
    skipAuth: true,
    body: JSON.stringify({ refreshToken }),
  });
  clearAuthSession();
}

export async function fetchServerRoot(): Promise<string> {
  return apiFetch<string>('/', { skipAuth: true });
}

export async function logoutAll(): Promise<void> {
  await apiFetch<unknown>('/auth/logout/all', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  clearAuthSession();
}

export async function withdrawAccount(password: string): Promise<void> {
  await apiFetch<unknown>('/auth/withdraw', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ password }),
  });
  clearAuthSession();
}
