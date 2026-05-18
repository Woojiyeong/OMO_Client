import { create } from 'zustand';

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
  pendingFollowOps: Record<string, true>;
  loadFollowing: () => Promise<void>;
  loadFollowers: () => Promise<void>;
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
  pendingFollowOps: {},

  async loadFollowing() {
    if (get().loadingFollowing || get().followingLoaded) return;
    set({ loadingFollowing: true });
    try {
      const list = await api.fetchFollowing();
      const apiIds = new Set(list.map((u) => u.id));
      const optimisticAdds = get().following.filter((u) => !apiIds.has(u.id));
      const merged = [...optimisticAdds, ...list];
      set({ following: merged, followingLoaded: true });
      syncProfileCounts(merged, get().followers);
    } finally {
      set({ loadingFollowing: false });
    }
  },

  async loadFollowers() {
    if (get().loadingFollowers || get().followersLoaded) return;
    set({ loadingFollowers: true });
    try {
      const list = await api.fetchFollowers();
      const apiIds = new Set(list.map((u) => u.id));
      const optimisticAdds = get().followers.filter((u) => !apiIds.has(u.id));
      const merged = [...optimisticAdds, ...list];
      set({ followers: merged, followersLoaded: true });
      syncProfileCounts(get().following, merged);
    } finally {
      set({ loadingFollowers: false });
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
