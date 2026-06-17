import { Pressable, StyleSheet, View } from 'react-native';

import BookmarkG from '@/assets/icons/bookmark_g.svg';
import BookmarkP from '@/assets/icons/bookmark_p.svg';
import GridG from '@/assets/icons/grid_g.svg';
import GridP from '@/assets/icons/grid_p.svg';
import { Palette } from '@/constants/colors';

export type ProfileTab = 'posts' | 'saved';

type Props = {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
};

export function ProfileTabs({ active, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TabItem
        active={active === 'posts'}
        onPress={() => onChange('posts')}
        Icon={active === 'posts' ? GridP : GridG}
        label="게시물 탭"
      />
      <TabItem
        active={active === 'saved'}
        onPress={() => onChange('saved')}
        Icon={active === 'saved' ? BookmarkP : BookmarkG}
        label="저장 탭"
      />
    </View>
  );
}

type TabItemProps = {
  active: boolean;
  onPress: () => void;
  Icon: React.FC<{ width?: number; height?: number }>;
  label: string;
};

function TabItem({ active, onPress, Icon, label }: TabItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Icon width={24} height={24} />
      {active && <View style={styles.indicator} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 54,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 74,
    height: 2,
    backgroundColor: Palette.pink500,
  },
});
