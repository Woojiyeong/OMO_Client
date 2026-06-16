import { create } from 'zustand';

import type { StyleOption } from './styles';

export type OnboardingData = {
  email: string;
  emailVerified: boolean;
  emailPendingToken: string;
  emailVerificationToken: string;
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
  setEmailPendingToken: (token: string) => void;
  markEmailVerified: () => void;
  setEmailVerificationToken: (token: string) => void;
  markOnboarded: () => void;
  reset: () => void;
};

const INITIAL: OnboardingData = {
  email: '',
  emailVerified: false,
  emailPendingToken: '',
  emailVerificationToken: '',
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
  setEmailPendingToken: (token) => set({ emailPendingToken: token }),
  markEmailVerified: () => set({ emailVerified: true }),
  setEmailVerificationToken: (token) => set({ emailVerificationToken: token }),
  markOnboarded: () => set({ isOnboarded: true }),
  reset: () => set({ ...INITIAL, isOnboarded: false }),
}));
