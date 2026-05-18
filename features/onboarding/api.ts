import type { StyleOption } from './styles';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export type SignUpPayload = {
  email: string;
  username: string;
  password: string;
  style: StyleOption;
  name: string;
  height: number;
  weight: number;
};

export async function sendVerificationCode(_email: string): Promise<{ ok: true }> {
  await wait(500);
  return { ok: true };
}

export async function verifyCode(_email: string, code: string): Promise<{ ok: true }> {
  await wait(400);
  if (code !== '123456') {
    throw new Error('인증코드가 올바르지 않아요.');
  }
  return { ok: true };
}

const TAKEN_USERNAMES = new Set(['admin', 'test', 'omo']);

export async function checkUsername(username: string): Promise<{ available: boolean }> {
  await wait(400);
  return { available: !TAKEN_USERNAMES.has(username.toLowerCase()) };
}

export async function signUp(payload: SignUpPayload): Promise<{ ok: true; userId: string }> {
  await wait(800);
  return { ok: true, userId: `mock-${Date.now()}-${payload.username}` };
}
