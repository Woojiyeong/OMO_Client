import type { ImageSourcePropType } from 'react-native';

import type { StyleOption } from '@/features/onboarding/styles';

export type FeedAuthor = {
  id: string;
  name: string;
  keyword: StyleOption;
  avatarUri?: string;
};

export type ProductRecommendation = {
  id: string;
  category: string;
  name: string;
  priceWon: number;
  thumbnail: ImageSourcePropType;
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
};

export type TrendItem = {
  id: string;
  postId: string;
  image: ImageSourcePropType;
};
