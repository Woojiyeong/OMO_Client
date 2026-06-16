import { create } from 'zustand';

export type AuthCredentials = {
  currentUserId: string;
  currentId: string;
  currentPassword: string;
  accessToken: string | null;
  refreshToken: string | null;
};

type AuthState = AuthCredentials & {
  setCredentials: (patch: Partial<AuthCredentials>) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearTokens: () => void;
};

const INITIAL: AuthCredentials = {
  currentUserId: '',
  currentId: '',
  currentPassword: '',
  accessToken: null,
  refreshToken: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...INITIAL,
  setCredentials: (patch) => set((s) => ({ ...s, ...patch })),
  setTokens: (tokens) => set(tokens),
  clearTokens: () => set({ accessToken: null, refreshToken: null }),
}));
