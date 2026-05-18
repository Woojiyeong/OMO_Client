import { create } from 'zustand';

import type { StyleOption } from './styles';

export type OnboardingData = {
  email: string;
  emailVerified: boolean;
  username: string;
  password: string;
  style: StyleOption | null;
  name: string;
  height: number;
  weight: number;
};

type OnboardingState = OnboardingData & {
  isOnboarded: boolean;
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  markEmailVerified: () => void;
  markOnboarded: () => void;
  reset: () => void;
};

const INITIAL: OnboardingData = {
  email: '',
  emailVerified: false,
  username: '',
  password: '',
  style: null,
  name: '',
  height: 165,
  weight: 60,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...INITIAL,
  isOnboarded: false,
  setField: (key, value) => set((s) => ({ ...s, [key]: value })),
  markEmailVerified: () => set({ emailVerified: true }),
  markOnboarded: () => set({ isOnboarded: true }),
  reset: () => set({ ...INITIAL, isOnboarded: false }),
}));
