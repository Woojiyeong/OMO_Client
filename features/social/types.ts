import type { StyleOption } from '@/features/onboarding/styles';

export type SocialUser = {
  id: string;
  name: string;
  keyword: StyleOption;
  bio: string;
  avatarUri?: string;
  isFollowing?: boolean;
};

export type FollowListType = 'following' | 'followers';

export type UserProfileDetail = SocialUser & {
  heightCm?: number;
  weightKg?: number;
  stats: {
    posts: number;
    following: number;
    followers: number;
  };
};
