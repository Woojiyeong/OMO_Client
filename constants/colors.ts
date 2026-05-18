export const Palette = {
  pink50: '#FFD9EC',
  pink100: '#FFA7D3',
  pink200: '#FF83C1',
  pink300: '#FF62B0',
  pink500: '#FF007F',
  white: '#FFFFFF',
  black: '#11181C',
  gray50: '#F7F8FA',
  gray100: '#EEF0F3',
  gray150: '#E2E2E2',
  gray200: '#D9DCE0',
  gray210: '#D9D9D9',
  gray220: '#F1F1F1',
  gray230: '#F3F3F3',
  borderSubtle: '#EDEDED',
  grayBorder: '#A6A6A6',
  gray300: '#C7C7C7',
  gray400: '#9BA1A6',
  gray500: '#777777',
  gray600: '#687076',
  gray800: '#2A2D31',
  textPrimary: '#222222',
  danger: '#FF3B30',
} as const;

export type ColorScheme = {
  text: string;
  textMuted: string;
  background: string;
  surface: string;
  border: string;
  borderFocus: string;
  primary: string;
  primaryText: string;
  primaryDisabledBg: string;
  primaryDisabledText: string;
  error: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
};

export const Colors: { light: ColorScheme; dark: ColorScheme } = {
  light: {
    text: Palette.black,
    textMuted: Palette.gray600,
    background: Palette.white,
    surface: Palette.gray50,
    border: Palette.gray200,
    borderFocus: Palette.pink500,
    primary: Palette.pink500,
    primaryText: Palette.white,
    primaryDisabledBg: Palette.gray100,
    primaryDisabledText: Palette.gray400,
    error: Palette.pink500,
    tint: Palette.pink500,
    icon: Palette.gray600,
    tabIconDefault: Palette.gray600,
    tabIconSelected: Palette.pink500,
  },
  dark: {
    text: '#ECEDEE',
    textMuted: Palette.gray400,
    background: '#151718',
    surface: Palette.gray800,
    border: Palette.gray800,
    borderFocus: Palette.pink300,
    primary: Palette.pink300,
    primaryText: Palette.white,
    primaryDisabledBg: Palette.gray800,
    primaryDisabledText: Palette.gray600,
    error: Palette.pink300,
    tint: Palette.pink300,
    icon: Palette.gray400,
    tabIconDefault: Palette.gray400,
    tabIconSelected: Palette.pink300,
  },
};
