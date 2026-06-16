import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/profile/empty-state";
import { PostGrid } from "@/components/profile/post-grid";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTab, ProfileTabs } from "@/components/profile/profile-tabs";
import { TabHeader } from "@/components/ui/tab-header";
import { Palette } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { fetchMyBookmarksPage, fetchMyPostsPage } from "@/features/feed/api";
import { useMyPostsStore } from "@/features/feed/store";
import type { FeedPost } from "@/features/feed/types";

export default function MyScreen() {
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [myPosts, setMyPosts] = useState<FeedPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<FeedPost[]>([]);
  const [postsCursor, setPostsCursor] = useState<string | null>(null);
  const [savedCursor, setSavedCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const uploaded = useMyPostsStore((s) => s.uploaded);

  const loadMyPosts = useCallback(async () => {
    const page = await fetchMyPostsPage();
    setMyPosts(page.posts);
    setPostsCursor(page.nextCursor);
  }, []);

  const loadSavedPosts = useCallback(async () => {
    const page = await fetchMyBookmarksPage();
    setSavedPosts(page.posts);
    setSavedCursor(page.nextCursor);
  }, []);

  const loadMore = useCallback(async () => {
    const cursor = tab === "posts" ? postsCursor : savedCursor;
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page =
        tab === "posts"
          ? await fetchMyPostsPage({ cursor })
          : await fetchMyBookmarksPage({ cursor });
      const append = (prev: FeedPost[]) => {
        const seen = new Set(prev.map((post) => post.id));
        return [...prev, ...page.posts.filter((post) => !seen.has(post.id))];
      };
      if (tab === "posts") {
        setMyPosts(append);
        setPostsCursor(page.nextCursor);
      } else {
        setSavedPosts(append);
        setSavedCursor(page.nextCursor);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, postsCursor, savedCursor, tab]);

  useEffect(() => {
    if (tab === "posts") {
      loadMyPosts().catch(() => {});
    } else {
      loadSavedPosts().catch(() => {});
    }
  }, [loadMyPosts, loadSavedPosts, tab]);

  const posts =
    tab === "posts"
      ? [
          ...uploaded,
          ...myPosts.filter(
            (post) => !uploaded.some((item) => item.id === post.id),
          ),
        ]
      : savedPosts;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <TabHeader title="마이" />

      <View style={styles.profileSection}>
        <ProfileHeader />
      </View>

      <ProfileTabs active={tab} onChange={setTab} />

      {posts.length === 0 ? (
        <EmptyState
          message={tab === "posts" ? "게시물이 없어요" : "저장한 패션이 없어요"}
          icon={tab === "posts" ? "post" : "bookmark"}
        />
      ) : (
        <PostGrid
          posts={posts}
          source={tab === "posts" ? "my" : "saved"}
          onEndReached={loadMore}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  profileSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
});
