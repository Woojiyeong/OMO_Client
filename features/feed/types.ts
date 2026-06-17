import type { ImageSourcePropType } from 'react-native';

import type { StyleOption } from '@/features/onboarding/styles';

export type FeedAuthor = {
  id: string;
  name: string;
  keyword: StyleOption;
  avatarUri?: string;
  isFollowing?: boolean;
};

export type ProductRecommendation = {
  id: string;
  detailId?: string;
  category: string;
  name: string;
  priceWon: number;
  thumbnail?: ImageSourcePropType;
  productUrl?: string;
};

export type FeedPost = {
  id: string;
  author: FeedAuthor;
  image: ImageSourcePropType;
  likes: number;
  title: string;
  description: string;
  hashtags: string[];
  products: ProductRecommendation[];
  liked?: boolean;
  bookmarked?: boolean;
};

export type TrendItem = {
  id: string;
  postId: string;
  image: ImageSourcePropType;
};
