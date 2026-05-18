import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedTabs, type FeedTab } from '@/components/feed/feed-tabs';
import { FollowingFeed } from '@/components/feed/following-feed';
import { TrendGrid } from '@/components/feed/trend-grid';
import { TabHeader } from '@/components/ui/tab-header';
import { Palette } from '@/constants/colors';

export default function FeedScreen() {
  const [tab, setTab] = useState<FeedTab>('following');

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <TabHeader title="피드" />
      <FeedTabs active={tab} onChange={setTab} />
      <View style={styles.body}>
        {tab === 'trend' ? <TrendGrid /> : <FollowingFeed />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  body: {
    flex: 1,
  },
});
