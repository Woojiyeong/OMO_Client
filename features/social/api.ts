import { apiFetch, resolveApiAssetUrl } from '@/features/api/client';
import { toAppStyleKeyword } from '@/features/api/style-keyword';
import { useAuthStore } from '@/features/auth/store';

import type { SocialUser, UserProfileDetail } from './types';

export type ReportReason = 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'ETC';

type ApiListResponse<T> =
  | T[]
  | {
      items?: T[];
      users?: T[];
      data?: T[];
      content?: T[];
      nextCursor?: string | null;
      hasNext?: boolean;
    };

export type SocialPage = {
  users: SocialUser[];
  nextCursor: string | null;
  hasNext: boolean;
};

type ApiUser = {
  id?: string;
  userId?: string;
  nickname?: string;
  name?: string;
  styleKeyword?: string;
  keyword?: string;
  bio?: string | null;
  profileImage?: string | null;
  avatarUri?: string;
  isFollowing?: boolean;
  followedAt?: string;
  height?: number;
  weight?: number;
  posts?: number;
  postCount?: number;
  postsCount?: number;
  following?: number;
  followingCount?: number;
  followingsCount?: number;
  followers?: number;
  followerCount?: number;
  followersCount?: number;
};

function currentUserId() {
  return useAuthStore.getState().currentUserId;
}

function listItems<T>(response: ApiListResponse<T>): T[] {
  if (Array.isArray(response)) return response;
  return response.items ?? response.users ?? response.data ?? response.content ?? [];
}

function pageMeta<T>(response: ApiListResponse<T>) {
  if (Array.isArray(response)) return { nextCursor: null, hasNext: false };
  return {
    nextCursor: response.nextCursor ?? null,
    hasNext: response.hasNext ?? !!response.nextCursor,
  };
}

function mapUser(user: ApiUser): SocialUser {
  return {
    id: user.id ?? user.userId ?? '',
    name: user.nickname ?? user.name ?? '',
    keyword: toAppStyleKeyword(user.styleKeyword ?? user.keyword),
    bio: user.bio ?? '',
    avatarUri: resolveApiAssetUrl(user.profileImage ?? user.avatarUri),
  };
}

export async function fetchFollowingPageForUser({
  userId,
  cursor,
  limit = 20,
}: {
  userId: string;
  cursor?: string;
  limit?: number;
}): Promise<SocialPage> {
  if (!userId) return { users: [], nextCursor: null, hasNext: false };
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);

  const response = await apiFetch<ApiListResponse<ApiUser>>(
    `/users/${encodeURIComponent(userId)}/followings?${params.toString()}`,
  );
  const meta = pageMeta(response);
  return { users: listItems(response).map(mapUser), ...meta };
}

export async function fetchFollowersPageForUser({
  userId,
  cursor,
  limit = 20,
}: {
  userId: string;
  cursor?: string;
  limit?: number;
}): Promise<SocialPage> {
  if (!userId) return { users: [], nextCursor: null, hasNext: false };
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);

  const response = await apiFetch<ApiListResponse<ApiUser>>(
    `/users/${encodeURIComponent(userId)}/followers?${params.toString()}`,
  );
  const meta = pageMeta(response);
  return { users: listItems(response).map(mapUser), ...meta };
}

export async function fetchFollowingForUser(userId: string): Promise<SocialUser[]> {
  return (await fetchFollowingPageForUser({ userId })).users;
}

export async function fetchFollowersForUser(userId: string): Promise<SocialUser[]> {
  return (await fetchFollowersPageForUser({ userId })).users;
}

export async function fetchFollowing(): Promise<SocialUser[]> {
  return fetchFollowingForUser(currentUserId());
}

export async function fetchFollowers(): Promise<SocialUser[]> {
  return fetchFollowersForUser(currentUserId());
}

export async function unfollow(userId: string): Promise<{ ok: true }> {
  await apiFetch<{ following: false }>(`/users/${encodeURIComponent(userId)}/follow`, {
    method: 'DELETE',
  });
  return { ok: true };
}

export async function follow(userId: string): Promise<{ ok: true }> {
  await apiFetch<{ following: true }>(`/users/${encodeURIComponent(userId)}/follow`, {
    method: 'POST',
  });
  return { ok: true };
}

export async function fetchFollowStatus(
  userId: string,
): Promise<{ isFollowing: boolean; isFollower: boolean }> {
  return apiFetch<{ isFollowing: boolean; isFollower: boolean }>(
    `/users/${encodeURIComponent(userId)}/follow-status`,
  );
}

export async function fetchUserProfile(userId: string): Promise<UserProfileDetail> {
  const user = await apiFetch<ApiUser>(`/users/${encodeURIComponent(userId)}`);
  const base = mapUser(user);

  return {
    ...base,
    heightCm: user.height,
    weightKg: user.weight,
    stats: {
      posts: user.postsCount ?? user.postCount ?? user.posts ?? 0,
      following: user.followingsCount ?? user.followingCount ?? user.following ?? 0,
      followers: user.followersCount ?? user.followerCount ?? user.followers ?? 0,
    },
  };
}

export async function reportUser(
  userId: string,
  payload: { reason: ReportReason; description?: string },
): Promise<void> {
  await apiFetch<unknown>(`/users/${encodeURIComponent(userId)}/report`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
