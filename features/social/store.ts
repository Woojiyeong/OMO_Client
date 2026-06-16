import { create } from 'zustand';

import { useAuthStore } from '@/features/auth/store';
import { useProfileStore } from '@/features/profile/store';

import * as api from './api';
import type { SocialUser } from './types';

type SocialState = {
  following: SocialUser[];
  followers: SocialUser[];
  loadingFollowing: boolean;
  loadingFollowers: boolean;
  followingLoaded: boolean;
  followersLoaded: boolean;
  followingCursor: string | null;
  followersCursor: string | null;
  followingHasNext: boolean;
  followersHasNext: boolean;
  loadingMoreFollowing: boolean;
  loadingMoreFollowers: boolean;
  pendingFollowOps: Record<string, true>;
  loadFollowing: (force?: boolean) => Promise<void>;
  loadFollowers: (force?: boolean) => Promise<void>;
  loadMoreFollowing: () => Promise<void>;
  loadMoreFollowers: () => Promise<void>;
  follow: (user: SocialUser) => Promise<void>;
  unfollow: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
};

function syncProfileCounts(following: SocialUser[], followers: SocialUser[]) {
  const profile = useProfileStore.getState();
  profile.setProfile({
    stats: {
      ...profile.stats,
      following: following.length,
      followers: followers.length,
    },
  });
}

export const useSocialStore = create<SocialState>((set, get) => ({
  following: [],
  followers: [],
  loadingFollowing: false,
  loadingFollowers: false,
  followingLoaded: false,
  followersLoaded: false,
  followingCursor: null,
  followersCursor: null,
  followingHasNext: false,
  followersHasNext: false,
  loadingMoreFollowing: false,
  loadingMoreFollowers: false,
  pendingFollowOps: {},

  async loadFollowing(force = false) {
    if (get().loadingFollowing || (!force && get().followingLoaded)) return;
    set({ loadingFollowing: true });
    try {
      const page = await api.fetchFollowingPageForUser({
        userId: useAuthStore.getState().currentUserId,
      }).catch(async () => {
        const users = await api.fetchFollowing();
        return { users, nextCursor: null, hasNext: false };
      });
      const apiIds = new Set(page.users.map((u) => u.id));
      const optimisticAdds = get().following.filter((u) => !apiIds.has(u.id));
      const merged = [...optimisticAdds, ...page.users];
      set({
        following: merged,
        followingLoaded: true,
        followingCursor: page.nextCursor,
        followingHasNext: page.hasNext,
      });
      syncProfileCounts(merged, get().followers);
    } finally {
      set({ loadingFollowing: false });
    }
  },

  async loadFollowers(force = false) {
    if (get().loadingFollowers || (!force && get().followersLoaded)) return;
    set({ loadingFollowers: true });
    try {
      const page = await api.fetchFollowersPageForUser({
        userId: useAuthStore.getState().currentUserId,
      }).catch(async () => {
        const users = await api.fetchFollowers();
        return { users, nextCursor: null, hasNext: false };
      });
      const apiIds = new Set(page.users.map((u) => u.id));
      const optimisticAdds = get().followers.filter((u) => !apiIds.has(u.id));
      const merged = [...optimisticAdds, ...page.users];
      set({
        followers: merged,
        followersLoaded: true,
        followersCursor: page.nextCursor,
        followersHasNext: page.hasNext,
      });
      syncProfileCounts(get().following, merged);
    } finally {
      set({ loadingFollowers: false });
    }
  },

  async loadMoreFollowing() {
    const state = get();
    if (
      state.loadingMoreFollowing ||
      !state.followingHasNext ||
      !state.followingCursor
    ) {
      return;
    }
    set({ loadingMoreFollowing: true });
    try {
      const page = await api.fetchFollowingPageForUser({
        userId: useAuthStore.getState().currentUserId,
        cursor: state.followingCursor,
      });
      set((s) => {
        const seen = new Set(s.following.map((user) => user.id));
        const following = [
          ...s.following,
          ...page.users.filter((user) => !seen.has(user.id)),
        ];
        syncProfileCounts(following, s.followers);
        return {
          following,
          followingCursor: page.nextCursor,
          followingHasNext: page.hasNext,
        };
      });
    } finally {
      set({ loadingMoreFollowing: false });
    }
  },

  async loadMoreFollowers() {
    const state = get();
    if (
      state.loadingMoreFollowers ||
      !state.followersHasNext ||
      !state.followersCursor
    ) {
      return;
    }
    set({ loadingMoreFollowers: true });
    try {
      const page = await api.fetchFollowersPageForUser({
        userId: useAuthStore.getState().currentUserId,
        cursor: state.followersCursor,
      });
      set((s) => {
        const seen = new Set(s.followers.map((user) => user.id));
        const followers = [
          ...s.followers,
          ...page.users.filter((user) => !seen.has(user.id)),
        ];
        syncProfileCounts(s.following, followers);
        return {
          followers,
          followersCursor: page.nextCursor,
          followersHasNext: page.hasNext,
        };
      });
    } finally {
      set({ loadingMoreFollowers: false });
    }
  },

  async follow(user) {
    if (get().pendingFollowOps[user.id]) return;
    if (get().isFollowing(user.id)) return;

    set((s) => ({
      pendingFollowOps: { ...s.pendingFollowOps, [user.id]: true },
      following: [user, ...s.following],
    }));
    syncProfileCounts(get().following, get().followers);

    try {
      await api.follow(user.id);
    } catch (e) {
      set((s) => ({ following: s.following.filter((u) => u.id !== user.id) }));
      syncProfileCounts(get().following, get().followers);
      throw e;
    } finally {
      set((s) => {
        const next = { ...s.pendingFollowOps };
        delete next[user.id];
        return { pendingFollowOps: next };
      });
    }
  },

  async unfollow(userId) {
    if (get().pendingFollowOps[userId]) return;

    const prev = get().following;
    const removed = prev.find((u) => u.id === userId);
    if (!removed) return;

    set((s) => ({
      pendingFollowOps: { ...s.pendingFollowOps, [userId]: true },
      following: s.following.filter((u) => u.id !== userId),
    }));
    syncProfileCounts(get().following, get().followers);

    try {
      await api.unfollow(userId);
    } catch (e) {
      set({ following: prev });
      syncProfileCounts(prev, get().followers);
      throw e;
    } finally {
      set((s) => {
        const next = { ...s.pendingFollowOps };
        delete next[userId];
        return { pendingFollowOps: next };
      });
    }
  },

  isFollowing(userId) {
    return get().following.some((u) => u.id === userId);
  },
}));
