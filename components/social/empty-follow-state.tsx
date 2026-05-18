import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import type { FollowListType } from '@/features/social/types';

type Props = {
  type: FollowListType;
};

export function EmptyFollowState({ type }: Props) {
  const message =
    type === 'following' ? '아직 팔로우한 유저가 없어요' : '아직 팔로워가 없어요';

  return (
    <View style={styles.container}>
      <EmptyFollowIcon />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

function EmptyFollowIcon() {
  return (
    <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
      <Circle cx={24} cy={18} r={8} stroke={Palette.gray300} strokeWidth={2} />
      <Path
        d="M8 40C8 33.3726 15.1634 28 24 28C32.8366 28 40 33.3726 40 40"
        stroke={Palette.gray300}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    gap: Spacing.md,
  },
  message: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Palette.grayBorder,
  },
});
