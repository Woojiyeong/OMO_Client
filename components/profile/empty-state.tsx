import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { Palette } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { FontFamily } from "@/constants/typography";

type Props = {
  message: string;
  icon?: "post" | "bookmark";
};

const ICON_SIZE = 44;
const ICON_STROKE = Palette.gray300;
const ICON_STROKE_WIDTH = 1.8;

export function EmptyState({ message, icon = "post" }: Props) {
  return (
    <View style={styles.container}>
      {icon === "bookmark" ? <BookmarkIcon /> : <CameraIcon />}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

function CameraIcon() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 44 44" fill="none">
      <Path
        d="M9 16.5C9 15.3954 9.89543 14.5 11 14.5H15L17.5 12H26.5L29 14.5H33C34.1046 14.5 35 15.3954 35 16.5V31C35 32.1046 34.1046 33 33 33H11C9.89543 33 9 32.1046 9 31V16.5Z"
        stroke={ICON_STROKE}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={22}
        cy={24}
        r={5.5}
        stroke={ICON_STROKE}
        strokeWidth={ICON_STROKE_WIDTH}
      />
    </Svg>
  );
}

function BookmarkIcon() {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 44 44" fill="none">
      <Path
        d="M14 10H30C31.1046 10 32 10.8954 32 12V34L22 28L12 34V12C12 10.8954 12.8954 10 14 10Z"
        stroke={ICON_STROKE}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
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
