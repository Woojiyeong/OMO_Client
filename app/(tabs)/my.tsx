import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/profile/empty-state';
import { PostGrid } from '@/components/profile/post-grid';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTab, ProfileTabs } from '@/components/profile/profile-tabs';
import { TabHeader } from '@/components/ui/tab-header';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { MOCK_MY_POSTS, MOCK_SAVED_POSTS } from '@/features/feed/mock';
import { useMyPostsStore } from '@/features/feed/store';

export default function MyScreen() {
  const [tab, setTab] = useState<ProfileTab>('posts');
  const uploaded = useMyPostsStore((s) => s.uploaded);

  const posts =
    tab === 'posts' ? [...uploaded, ...MOCK_MY_POSTS] : MOCK_SAVED_POSTS;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <TabHeader title="마이" />

      <View style={styles.profileSection}>
        <ProfileHeader />
      </View>

      <ProfileTabs active={tab} onChange={setTab} />

      {posts.length === 0 ? (
        <EmptyState
          message={tab === 'posts' ? '게시물이 없어요' : '저장한 패션이 없어요'}
        />
      ) : (
        <PostGrid posts={posts} source={tab === 'posts' ? 'my' : 'saved'} />
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
