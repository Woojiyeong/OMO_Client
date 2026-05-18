import { MOCK_FOLLOWERS, MOCK_FOLLOWING } from './mock';
import type { SocialUser, UserProfileDetail } from './types';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchFollowing(): Promise<SocialUser[]> {
  await wait(700);
  return MOCK_FOLLOWING;
}

export async function fetchFollowers(): Promise<SocialUser[]> {
  await wait(700);
  return MOCK_FOLLOWERS;
}

export async function unfollow(_userId: string): Promise<{ ok: true }> {
  await wait(400);
  return { ok: true };
}

export async function follow(_userId: string): Promise<{ ok: true }> {
  await wait(400);
  return { ok: true };
}

export async function fetchUserProfile(userId: string): Promise<UserProfileDetail> {
  await wait(700);
  const found =
    MOCK_FOLLOWING.find((u) => u.id === userId) ??
    MOCK_FOLLOWERS.find((u) => u.id === userId);

  const base: SocialUser = found ?? {
    id: userId,
    name: '알 수 없는 사용자',
    keyword: 'casual',
    bio: '',
  };

  return {
    ...base,
    heightCm: 170,
    weightKg: 60,
    stats: { posts: 0, following: 42, followers: 87 },
  };
}
