import { z } from 'zod';

export const emailSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않아요.'),
});

export const codeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, '6자리 숫자를 입력해주세요.'),
});

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, '3자 이상 입력해주세요.')
    .max(20, '20자 이하로 입력해주세요.')
    .regex(/^[a-zA-Z0-9_]+$/, '영문/숫자/_ 만 사용 가능해요.'),
});

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, '특수문자를 포함해 8자리 이상 입력해주세요.')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, '특수문자를 포함해 8자리 이상 입력해주세요.'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: '비밀번호가 일치하지 않아요.',
  });

export const profileSchema = z.object({
  style: z.enum(['minimalist', 'street', 'lovely', 'casual', 'formal']),
  name: z.string().min(1, '이름을 입력해주세요.').max(20, '20자 이하로 입력해주세요.'),
});

export const bodySchema = z.object({
  height: z.number().int().min(140).max(190),
  weight: z.number().int().min(35).max(120),
});

export type EmailForm = z.infer<typeof emailSchema>;
export type CodeForm = z.infer<typeof codeSchema>;
export type UsernameForm = z.infer<typeof usernameSchema>;
export type PasswordForm = z.infer<typeof passwordSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type BodyForm = z.infer<typeof bodySchema>;
