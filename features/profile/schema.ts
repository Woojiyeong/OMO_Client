import { z } from 'zod';

const numericString = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label}을(를) 입력해주세요.`)
    .regex(/^\d+$/, `${label}은(는) 숫자로 입력해주세요.`)
    .refine((v) => {
      const n = Number(v);
      return n >= min && n <= max;
    }, `${label} 범위가 올바르지 않아요.`);

export const profileEditSchema = z.object({
  keyword: z.enum(['minimalist', 'street', 'lovely', 'casual', 'formal']),
  name: z
    .string()
    .trim()
    .min(1, '이름을 입력해주세요.')
    .max(16, '16자 이하로 입력해주세요.'),
  heightCm: numericString('키', 50, 250),
  weightKg: numericString('몸무게', 20, 250),
  bio: z.string().max(60, '60자 이하로 입력해주세요.'),
});

export type ProfileEditForm = z.infer<typeof profileEditSchema>;
