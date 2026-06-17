import { TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

type Variant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyBold'
  | 'button'
  | 'caption'
  | 'label';

export const Typography: Record<Variant, TextStyle> = {
  display: { fontFamily: FontFamily.bold, fontSize: 31, lineHeight: 40 },
  title: { fontFamily: FontFamily.bold, fontSize: 24, lineHeight: 32 },
  subtitle: { fontFamily: FontFamily.semibold, fontSize: 20, lineHeight: 28 },
  body: { fontFamily: FontFamily.regular, fontSize: 17, lineHeight: 26 },
  bodyBold: { fontFamily: FontFamily.semibold, fontSize: 17, lineHeight: 26 },
  button: { fontFamily: FontFamily.semibold, fontSize: 17, lineHeight: 22 },
  caption: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 22 },
};
