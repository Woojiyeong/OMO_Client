import { create } from 'zustand';

import { MOCK_FOLLOWERS, MOCK_FOLLOWING } from '@/features/social/mock';
import { STYLE_OPTIONS, type StyleOption } from '@/features/onboarding/styles';

export type ProfileStats = {
  posts: number;
  following: number;
  followers: number;
};

export type ProfileData = {
  name: string;
  keyword: StyleOption;
  heightCm: number;
  weightKg: number;
  bio: string;
  stats: ProfileStats;
  avatarUri?: string;
};

type ProfileState = ProfileData & {
  setProfile: (patch: Partial<ProfileData>) => void;
  reset: () => void;
};

const INITIAL: ProfileData = {
  name: '우지영',
  keyword: 'formal',
  heightCm: 180,
  weightKg: 70,
  bio: '회사에선 개발자 오프에선 패션짱',
  stats: {
    posts: 3,
    following: MOCK_FOLLOWING.length,
    followers: MOCK_FOLLOWERS.length,
  },
  avatarUri: undefined,
};

export const useProfileStore = create<ProfileState>((set) => ({
  ...INITIAL,
  setProfile: (patch) => set((s) => ({ ...s, ...patch })),
  reset: () => set({ ...INITIAL }),
}));

export function formatNickname(keyword: StyleOption, name: string): string {
  const label = STYLE_OPTIONS.find((o) => o.value === keyword)?.label ?? '';
  return label ? `${label}_${name}` : name;
}
