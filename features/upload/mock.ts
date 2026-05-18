import type { UploadProduct } from './types';

const FASHION_1 = require('@/assets/images/fashion1.png');
const FASHION_2 = require('@/assets/images/fashion2.png');
const FASHION_3 = require('@/assets/images/fashion3.png');

export const MOCK_UPLOAD_PRODUCTS: UploadProduct[] = [
  {
    id: 'upload-item-1',
    category: '상의',
    name: '오버핏 코튼 셔츠',
    priceWon: 32000,
    thumbnail: FASHION_1,
    pin: { x: 0.5, y: 0.26 },
  },
  {
    id: 'upload-item-2',
    category: '하의',
    name: '와이드 데님 팬츠',
    priceWon: 45000,
    thumbnail: FASHION_2,
    pin: { x: 0.46, y: 0.6 },
  },
  {
    id: 'upload-item-3',
    category: '신발',
    name: '클래식 스니커즈',
    priceWon: 38000,
    thumbnail: FASHION_3,
    pin: { x: 0.54, y: 0.86 },
  },
];
