import { create } from 'zustand';

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
  name: '',
  keyword: 'casual',
  heightCm: 0,
  weightKg: 0,
  bio: '',
  stats: {
    posts: 0,
    following: 0,
    followers: 0,
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
