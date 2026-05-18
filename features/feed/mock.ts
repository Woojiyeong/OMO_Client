import type { FeedAuthor, FeedPost, TrendItem } from './types';

const fashion1 = require('../../assets/images/fashion1.png');
const fashion2 = require('../../assets/images/fashion2.png');
const fashion3 = require('../../assets/images/fashion3.png');

export const MOCK_FEED_POSTS: FeedPost[] = [
  {
    id: 'p00',
    author: { id: 'u00', name: '테스트', keyword: 'casual' },
    image: fashion3,
    likes: 7,
    title: '[테스트] 상품 2개 — 화살표 보여야 함',
    description: '상품이 2개 이상일 때 각 카드 우측에 v 화살표가 표시되어야 합니다.',
    hashtags: ['테스트', '드롭다운'],
    products: [
      {
        id: 'pr00a',
        category: '상의',
        name: '테스트 상품 A (첫 번째)',
        priceWon: 19900,
        thumbnail: fashion1,
      },
      {
        id: 'pr00b',
        category: '하의',
        name: '테스트 상품 B (두 번째)',
        priceWon: 29900,
        thumbnail: fashion2,
      },
    ],
  },
  {
    id: 'p01',
    author: { id: 'u01', name: '박홍준', keyword: 'street' },
    image: fashion1,
    likes: 1240,
    title: '봄맞이 데일리 스트릿 코디',
    description: '오버사이즈 자켓 하나로 캐주얼하게 마무리한 봄 코디. 발색 좋은 데님과 매치해보세요.',
    hashtags: ['봄코디', '스트릿', '데일리룩'],
    products: [
      {
        id: 'pr01',
        category: '아우터',
        name: '오버사이즈 데님 자켓',
        priceWon: 89000,
        thumbnail: fashion2,
      },
    ],
  },
  {
    id: 'p02',
    author: { id: 'u02', name: '김민지', keyword: 'minimalist' },
    image: fashion2,
    likes: 892,
    title: '톤온톤 미니멀 데일리',
    description: '아이보리와 베이지로 부드럽게 이어지는 미니멀 무드. 출근룩으로도 좋아요.',
    hashtags: ['미니멀', '톤온톤', '오피스룩'],
    products: [
      {
        id: 'pr02',
        category: '상의',
        name: '와이드 카라 니트',
        priceWon: 64000,
        thumbnail: fashion3,
      },
    ],
  },
  {
    id: 'p03',
    author: { id: 'u03', name: '이서준', keyword: 'casual' },
    image: fashion3,
    likes: 542,
    title: '주말 캐주얼 데일리',
    description: '편안한 후디와 와이드 슬랙스로 완성한 주말 캐주얼. 어디에 가도 무난해요.',
    hashtags: ['캐주얼', '주말룩', '데일리'],
    products: [
      {
        id: 'pr03',
        category: '하의',
        name: '와이드 코튼 슬랙스',
        priceWon: 49000,
        thumbnail: fashion1,
      },
    ],
  },
  {
    id: 'p04',
    author: { id: 'u04', name: '박소연', keyword: 'lovely' },
    image: fashion1,
    likes: 2310,
    title: '러블리 봄 원피스',
    description: '핑크 톤 원피스에 화이트 가디건을 매치한 러블리 코디.',
    hashtags: ['러블리', '원피스', '봄코디'],
    products: [
      {
        id: 'pr04',
        category: '원피스',
        name: '플로럴 미디 원피스',
        priceWon: 78000,
        thumbnail: fashion2,
      },
    ],
  },
];

export const RANKED_FEED_POSTS: FeedPost[] = [...MOCK_FEED_POSTS].sort(
  (a, b) => b.likes - a.likes,
);

const findPost = (id: string): FeedPost => {
  const post = MOCK_FEED_POSTS.find((p) => p.id === id);
  if (!post) throw new Error(`Unknown post id: ${id}`);
  return post;
};

const MY_AUTHOR: FeedAuthor = { id: 'me', name: '우지영', keyword: 'formal' };

export const MOCK_MY_POSTS: FeedPost[] = [
  {
    id: 'my-01',
    author: MY_AUTHOR,
    image: fashion1,
    likes: 142,
    title: '오늘의 스트릿 데일리',
    description: '오버사이즈 셔츠에 데님 매치한 가벼운 데일리 룩.',
    hashtags: ['스트릿', '데일리룩', '내코디'],
    products: [
      {
        id: 'my-01-p1',
        category: '상의',
        name: '오버사이즈 셔츠',
        priceWon: 39000,
        thumbnail: fashion2,
      },
    ],
  },
  {
    id: 'my-02',
    author: MY_AUTHOR,
    image: fashion3,
    likes: 87,
    title: '워크웨어 무드',
    description: '카키 자켓에 와이드 슬랙스로 워크 무드 살리기.',
    hashtags: ['워크웨어', '봄코디'],
    products: [
      {
        id: 'my-02-p1',
        category: '아우터',
        name: '카키 워크 자켓',
        priceWon: 89000,
        thumbnail: fashion3,
      },
      {
        id: 'my-02-p2',
        category: '하의',
        name: '와이드 슬랙스',
        priceWon: 49000,
        thumbnail: fashion1,
      },
    ],
  },
  {
    id: 'my-03',
    author: MY_AUTHOR,
    image: fashion2,
    likes: 56,
    title: '가벼운 봄 코디',
    description: '베이지 가디건으로 톤다운된 봄 코디.',
    hashtags: ['봄코디', '가디건'],
    products: [
      {
        id: 'my-03-p1',
        category: '아우터',
        name: '베이지 가디건',
        priceWon: 64000,
        thumbnail: fashion2,
      },
    ],
  },
];

export const MOCK_SAVED_POSTS: FeedPost[] = ['p04', 'p02', 'p01', 'p00'].map(findPost);

export function getPostsByUser(userId: string, userName?: string): FeedPost[] {
  if (!userName) return MOCK_FEED_POSTS.filter((p) => p.author.id === userId);
  return MOCK_FEED_POSTS.filter((p) => p.author.name === userName);
}

export const MOCK_TREND_ITEMS: TrendItem[] = Array.from({ length: 15 }, (_, i) => {
  const post = RANKED_FEED_POSTS[i % RANKED_FEED_POSTS.length];
  return {
    id: `t${String(i + 1).padStart(2, '0')}`,
    postId: post.id,
    image: post.image,
  };
});
