import { create } from 'zustand';

export type AuthCredentials = {
  currentId: string;
  currentPassword: string;
};

type AuthState = AuthCredentials & {
  setCredentials: (patch: Partial<AuthCredentials>) => void;
};

const INITIAL: AuthCredentials = {
  currentId: 'test',
  currentPassword: 'test1234!',
};

export const useAuthStore = create<AuthState>((set) => ({
  ...INITIAL,
  setCredentials: (patch) => set((s) => ({ ...s, ...patch })),
}));
