import { create } from 'zustand';

import type { FeedPost } from './types';

type MyPostsState = {
  uploaded: FeedPost[];
  deletedIds: string[];
  bookmarkedPosts: FeedPost[];
  removedBookmarkIds: string[];
  addPost: (post: FeedPost) => void;
  markPostDeleted: (postId: string) => void;
  restorePostDeleted: (postId: string) => void;
  markBookmarkAdded: (post: FeedPost) => void;
  markBookmarkRemoved: (postId: string) => void;
  restoreBookmarkRemoved: (postId: string) => void;
  reset: () => void;
};

export const useMyPostsStore = create<MyPostsState>((set) => ({
  uploaded: [],
  deletedIds: [],
  bookmarkedPosts: [],
  removedBookmarkIds: [],
  addPost: (post) =>
    set((s) => ({
      uploaded: [post, ...s.uploaded],
      deletedIds: s.deletedIds.filter((id) => id !== post.id),
    })),
  markPostDeleted: (postId) =>
    set((s) => ({
      uploaded: s.uploaded.filter((post) => post.id !== postId),
      deletedIds: s.deletedIds.includes(postId)
        ? s.deletedIds
        : [...s.deletedIds, postId],
    })),
  restorePostDeleted: (postId) =>
    set((s) => ({
      deletedIds: s.deletedIds.filter((id) => id !== postId),
    })),
  markBookmarkAdded: (post) =>
    set((s) => ({
      bookmarkedPosts: [
        { ...post, bookmarked: true },
        ...s.bookmarkedPosts.filter((item) => item.id !== post.id),
      ],
      removedBookmarkIds: s.removedBookmarkIds.filter((id) => id !== post.id),
    })),
  markBookmarkRemoved: (postId) =>
    set((s) => ({
      bookmarkedPosts: s.bookmarkedPosts.filter((post) => post.id !== postId),
      removedBookmarkIds: s.removedBookmarkIds.includes(postId)
        ? s.removedBookmarkIds
        : [...s.removedBookmarkIds, postId],
    })),
  restoreBookmarkRemoved: (postId) =>
    set((s) => ({
      removedBookmarkIds: s.removedBookmarkIds.filter((id) => id !== postId),
    })),
  reset: () =>
    set({
      uploaded: [],
      deletedIds: [],
      bookmarkedPosts: [],
      removedBookmarkIds: [],
    }),
}));
