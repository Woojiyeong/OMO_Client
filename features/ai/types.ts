import type { ImageSourcePropType } from "react-native";

import type { ProductRecommendation } from "@/features/feed/types";
import type { StyleOption } from "@/features/onboarding/styles";

export type AiCoordiSummary = {
  id: string;
  name: string;
  priceWon: number;
  thumbnail?: ImageSourcePropType;
};

export type AiCoordiAuthor = {
  id: string;
  nickname: string;
  keyword: StyleOption;
  avatarUri?: string;
};

export type AiCoordiItem = ProductRecommendation & {
  pin?: { x: number; y: number };
};

export type AiCoordiDetail = {
  id: string;
  images: ImageSourcePropType[];
  title: string;
  description: string;
  hashtags: string[];
  totalBudgetWon: number;
  likes: number;
  liked?: boolean;
  bookmarked?: boolean;
  author: AiCoordiAuthor;
  items: AiCoordiItem[];
};
