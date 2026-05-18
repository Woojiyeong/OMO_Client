import type { StyleOption } from '@/features/onboarding/styles';

import type { AiCoordiDetail, AiCoordiSummary } from './types';

const FASHION_1 = require('@/assets/images/fashion1.png');
const FASHION_2 = require('@/assets/images/fashion2.png');
const FASHION_3 = require('@/assets/images/fashion3.png');

const FASHION_IMAGES = [FASHION_1, FASHION_2, FASHION_3];

const AUTHOR_NICKNAMES = ['오모지기', '스타일리스트모', '코디장인', '데일리룩러'];
const AUTHOR_KEYWORDS: StyleOption[] = ['casual', 'minimalist', 'formal', 'lovely'];

export const MOCK_AI_RESULTS: AiCoordiSummary[] = [
  { id: 'coordi-1', name: '데일리 꾸안꾸 코디', priceWon: 89000, thumbnail: FASHION_1 },
  { id: 'coordi-2', name: '러블리 데이트 룩', priceWon: 124000, thumbnail: FASHION_2 },
  { id: 'coordi-3', name: '캐주얼 스트릿 룩', priceWon: 98000, thumbnail: FASHION_3 },
  { id: 'coordi-4', name: '미니멀 오피스 룩', priceWon: 156000, thumbnail: FASHION_1 },
  { id: 'coordi-5', name: '여름 휴양지 룩', priceWon: 78000, thumbnail: FASHION_2 },
  { id: 'coordi-6', name: '가을 데일리 코디', priceWon: 112000, thumbnail: FASHION_3 },
];

function buildDetail(summary: AiCoordiSummary, index: number): AiCoordiDetail {
  const heroIndex = index % FASHION_IMAGES.length;
  return {
    id: summary.id,
    images: [
      FASHION_IMAGES[heroIndex],
      FASHION_IMAGES[(heroIndex + 1) % FASHION_IMAGES.length],
      FASHION_IMAGES[(heroIndex + 2) % FASHION_IMAGES.length],
    ],
    title: summary.name,
    description:
      '친구 만나러 가는 날, 부담스럽지 않으면서도 센스 있게 보이는 꾸안꾸 코디예요. 편안한 핏과 포인트 소품으로 자연스러운 분위기를 완성해 보세요.',
    hashtags: ['꾸안꾸', '데일리룩', '친구만남', '캐주얼'],
    totalBudgetWon: summary.priceWon,
    likes: 128 + index * 17,
    author: {
      id: `author-${(index % 4) + 1}`,
      nickname: AUTHOR_NICKNAMES[index % 4],
      keyword: AUTHOR_KEYWORDS[index % 4],
    },
    items: [
      {
        id: `${summary.id}-item-1`,
        category: '상의',
        name: '오버핏 코튼 셔츠',
        priceWon: 32000,
        thumbnail: FASHION_IMAGES[heroIndex],
        pin: { x: 0.5, y: 0.28 },
      },
      {
        id: `${summary.id}-item-2`,
        category: '하의',
        name: '와이드 데님 팬츠',
        priceWon: 45000,
        thumbnail: FASHION_IMAGES[(heroIndex + 1) % FASHION_IMAGES.length],
        pin: { x: 0.5, y: 0.62 },
      },
      {
        id: `${summary.id}-item-3`,
        category: '신발',
        name: '클래식 스니커즈',
        priceWon: 38000,
        thumbnail: FASHION_IMAGES[(heroIndex + 2) % FASHION_IMAGES.length],
        pin: { x: 0.5, y: 0.88 },
      },
    ],
  };
}

export const MOCK_AI_DETAILS: Record<string, AiCoordiDetail> = MOCK_AI_RESULTS.reduce(
  (acc, summary, index) => {
    acc[summary.id] = buildDetail(summary, index);
    return acc;
  },
  {} as Record<string, AiCoordiDetail>,
);

export function getAiDetailById(id: string): AiCoordiDetail | undefined {
  return MOCK_AI_DETAILS[id];
}
