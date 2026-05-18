export const MAX_SELECTIONS = 2;

export const STYLE_OPTIONS = [
  '심플베이지',
  '캐주얼',
  '스트릿',
  '미니멀',
  '빈티지',
  '시티보이룩',
  '꾸안꾸',
] as const;

export type StyleOption = (typeof STYLE_OPTIONS)[number];

export const SITUATION_OPTIONS = [
  '데일리',
  '데이트',
  '학교',
  '여행',
  '놀이공원',
  '카페',
  '캠퍼스룩',
  '하객룩',
  '운동',
  '축제',
  '파티',
] as const;

export type SituationOption = (typeof SITUATION_OPTIONS)[number];
