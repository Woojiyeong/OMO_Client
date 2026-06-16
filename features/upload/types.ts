import type { ProductRecommendation } from '@/features/feed/types';

export type UploadStatus = 'idle' | 'picked' | 'analyzing' | 'completed';

export type UploadProduct = ProductRecommendation & {
  detectedProductId?: string;
  productId?: string;
  pin: { x: number; y: number };
  link?: string;
};

export const CATEGORY_OPTIONS = [
  '상의',
  '하의',
  '아우터',
  '신발',
  '가방',
  '액세서리',
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];
