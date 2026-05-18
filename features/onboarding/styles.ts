export const STYLE_OPTIONS = [
  { value: 'minimalist', label: '미니멀' },
  { value: 'street', label: '스트릿' },
  { value: 'lovely', label: '러블리' },
  { value: 'casual', label: '캐주얼' },
  { value: 'formal', label: '포멀' },
] as const;

export type StyleOption = (typeof STYLE_OPTIONS)[number]['value'];
