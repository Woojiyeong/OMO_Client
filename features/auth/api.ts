import { useAuthStore } from './store';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export type LoginPayload = {
  id: string;
  password: string;
};

export type LoginResult = {
  ok: true;
  userId: string;
  token: string;
};

const VALID_ID = 'test';
const VALID_PASSWORD = 'test1234!';

export async function mockLogin({ id, password }: LoginPayload): Promise<LoginResult> {
  await wait(700);
  if (id !== VALID_ID || password !== VALID_PASSWORD) {
    throw new Error('아이디 또는 비밀번호를 확인해 주세요.');
  }
  return { ok: true, userId: id, token: `mock-token-${Date.now()}` };
}

export async function checkAccountIdAvailable(id: string): Promise<{ available: boolean }> {
  await wait(700);
  const currentId = useAuthStore.getState().currentId;
  if (id === currentId) return { available: false };
  if (id === 'taken' || id === 'admin') return { available: false };
  return { available: true };
}

export async function verifyCurrentPassword(password: string): Promise<{ ok: boolean }> {
  await wait(400);
  const currentPassword = useAuthStore.getState().currentPassword;
  return { ok: password === currentPassword };
}
