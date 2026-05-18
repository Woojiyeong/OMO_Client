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
  display: { fontFamily: FontFamily.bold, fontSize: 28, lineHeight: 36 },
  title: { fontFamily: FontFamily.bold, fontSize: 22, lineHeight: 30 },
  subtitle: { fontFamily: FontFamily.semibold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: FontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodyBold: { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 24 },
  button: { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 20 },
  caption: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20 },
};
