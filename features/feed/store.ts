import { create } from 'zustand';

import type { FeedPost } from './types';

type MyPostsState = {
  uploaded: FeedPost[];
  addPost: (post: FeedPost) => void;
  reset: () => void;
};

export const useMyPostsStore = create<MyPostsState>((set) => ({
  uploaded: [],
  addPost: (post) => set((s) => ({ uploaded: [post, ...s.uploaded] })),
  reset: () => set({ uploaded: [] }),
}));
