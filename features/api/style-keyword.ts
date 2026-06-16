import type { StyleOption } from '@/features/onboarding/styles';

export type ApiStyleKeyword = 'CASUAL' | 'STREET' | 'MINIMAL' | 'LOVELY' | 'FORMAL';

const APP_TO_API: Record<StyleOption, ApiStyleKeyword> = {
  casual: 'CASUAL',
  street: 'STREET',
  minimalist: 'MINIMAL',
  lovely: 'LOVELY',
  formal: 'FORMAL',
};

const API_TO_APP: Record<ApiStyleKeyword, StyleOption> = {
  CASUAL: 'casual',
  STREET: 'street',
  MINIMAL: 'minimalist',
  LOVELY: 'lovely',
  FORMAL: 'formal',
};

export function toApiStyleKeyword(style: StyleOption): ApiStyleKeyword {
  return APP_TO_API[style];
}

export function toAppStyleKeyword(style: unknown): StyleOption {
  return typeof style === 'string' && style in API_TO_APP
    ? API_TO_APP[style as ApiStyleKeyword]
    : 'casual';
}
