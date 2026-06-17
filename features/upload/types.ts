import type { ProductRecommendation } from '@/features/feed/types';
import {
  PRODUCT_CATEGORY_OPTIONS,
  type ProductCategoryOption,
} from '@/features/products/categories';

export type UploadStatus = 'idle' | 'picked' | 'analyzing' | 'completed';

export type UploadProduct = ProductRecommendation & {
  detectedProductId?: string;
  productId?: string;
  pin: { x: number; y: number };
  link?: string;
};

export const CATEGORY_OPTIONS = PRODUCT_CATEGORY_OPTIONS;

export type CategoryOption = ProductCategoryOption;
