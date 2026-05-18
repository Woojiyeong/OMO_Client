import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import MoCasual from '@/assets/avatars/Mo_casual.svg';
import MoFormal from '@/assets/avatars/Mo_formal.svg';
import MoLovely from '@/assets/avatars/Mo_lovely.svg';
import MoMinimalist from '@/assets/avatars/Mo_minimalist.svg';
import MoStreet from '@/assets/avatars/Mo_street.svg';
import OCasual from '@/assets/avatars/O_casual.svg';
import OFormal from '@/assets/avatars/O_formal.svg';
import OLovely from '@/assets/avatars/O_lovely.svg';
import OMinimalist from '@/assets/avatars/O_minimalist.svg';
import OStreet from '@/assets/avatars/O_street.svg';
import type { StyleOption } from '@/features/onboarding/styles';

export type AvatarComponent = FC<SvgProps>;

const AVATAR_MAP: Record<StyleOption, AvatarComponent[]> = {
  casual: [MoCasual, OCasual],
  formal: [MoFormal, OFormal],
  lovely: [MoLovely, OLovely],
  minimalist: [MoMinimalist, OMinimalist],
  street: [MoStreet, OStreet],
};

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getAvatarForKeyword(keyword: StyleOption, seed: string): AvatarComponent {
  const variants = AVATAR_MAP[keyword];
  return variants[hashSeed(seed) % variants.length];
}
