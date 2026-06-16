import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { Palette } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { FontFamily } from "@/constants/typography";
import type { FollowListType } from "@/features/social/types";

type Props = {
  type: FollowListType;
};

const ICON_SIZE = 44;
const ICON_STROKE = Palette.gray300;
const ICON_STROKE_WIDTH = 1.8;

export function EmptyFollowState({ type }: Props) {
  const message =
    type === "following"
      ? "아직 팔로우한 유저가 없어요"
      : "아직 팔로워가 없어요";

  return (
    <View style={styles.container}>
      <EmptyFollowIcon />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

function EmptyFollowIcon() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 44 44" fill="none">
      <Circle
        cx={22}
        cy={17}
        r={7}
        stroke={ICON_STROKE}
        strokeWidth={ICON_STROKE_WIDTH}
      />
      <Path
        d="M8 36C8 29.9249 14.268 25 22 25C29.732 25 36 29.9249 36 36"
        stroke={ICON_STROKE}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    gap: Spacing.sm,
  },
  message: {
    fontFamily: FontFamily.semibold,
    fontSize: 15,
    lineHeight: 22,
    color: Palette.gray500,
  },
});
