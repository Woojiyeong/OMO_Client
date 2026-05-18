import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/colors';
import { getAvatarForKeyword } from '@/features/profile/avatar-map';
import type { StyleOption } from '@/features/onboarding/styles';

type Props = {
  keyword: StyleOption;
  seed: string;
  size?: number;
};

export function KeywordAvatar({ keyword, seed, size = 80 }: Props) {
  const Svg = getAvatarForKeyword(keyword, seed);
  const dim = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.container, dim]}>
      <Svg width={size} height={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Palette.gray50,
  },
});
