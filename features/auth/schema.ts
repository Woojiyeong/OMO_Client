import { z } from 'zod';

export const loginSchema = z.object({
  id: z.string().min(1, '아이디를 입력해 주세요.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해 주세요.')
    .min(8, '비밀번호는 8자 이상 입력해 주세요.'),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const accountIdSchema = z.object({
  username: z
    .string()
    .min(3, '3자 이상 입력해주세요.')
    .max(20, '20자 이하로 입력해주세요.')
    .regex(/^[a-zA-Z0-9_]+$/, '영문/숫자/_ 만 사용 가능해요.'),
});

export type AccountIdForm = z.infer<typeof accountIdSchema>;

export const accountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해 주세요.'),
    newPassword: z
      .string()
      .min(8, '특수문자를 포함해 8자리 이상 입력해주세요.')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, '특수문자를 포함해 8자리 이상 입력해주세요.'),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ['confirm'],
    message: '비밀번호가 일치하지 않아요.',
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ['newPassword'],
    message: '이전과 다른 비밀번호로 입력해 주세요.',
  });

export type AccountPasswordForm = z.infer<typeof accountPasswordSchema>;
