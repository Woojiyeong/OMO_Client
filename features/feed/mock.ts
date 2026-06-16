import type { FeedPost, TrendItem } from './types';

export const MOCK_FEED_POSTS: FeedPost[] = [];

export const RANKED_FEED_POSTS: FeedPost[] = [...MOCK_FEED_POSTS].sort(
  (a, b) => b.likes - a.likes,
);

export const MOCK_MY_POSTS: FeedPost[] = [];

export const MOCK_SAVED_POSTS: FeedPost[] = [];

export function getPostsByUser(userId: string, userName?: string): FeedPost[] {
  if (!userName) return MOCK_FEED_POSTS.filter((p) => p.author.id === userId);
  return MOCK_FEED_POSTS.filter((p) => p.author.name === userName);
}

export const MOCK_TREND_ITEMS: TrendItem[] = [];
