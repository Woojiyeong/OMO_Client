import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { G, Path } from "react-native-svg";

import { Palette } from "@/constants/colors";

const DEFAULT_SIZE = 96;
const STROKE = Palette.pink500;
const STROKE_WIDTH = 2;

const HOOK_CX = 24;
const HOOK_CY = 14;
const HOOK_R = 3.5;
const APEX_X = 24;
const APEX_Y = 24;
const LEFT_X = 8;
const RIGHT_X = 40;
const BOTTOM_Y = 40;
const CORNER_R = 3;

const SLANT_LEN = Math.hypot(LEFT_X - APEX_X, BOTTOM_Y - APEX_Y);
const SLANT_UX = (LEFT_X - APEX_X) / SLANT_LEN;
const SLANT_UY = (BOTTOM_Y - APEX_Y) / SLANT_LEN;

const APEX_OUT_L_X = APEX_X + SLANT_UX * CORNER_R;
const APEX_OUT_L_Y = APEX_Y + SLANT_UY * CORNER_R;
const APEX_IN_R_X = APEX_X - SLANT_UX * CORNER_R;
const APEX_IN_R_Y = APEX_Y + SLANT_UY * CORNER_R;
const BL_IN_X = LEFT_X - SLANT_UX * CORNER_R;
const BL_IN_Y = BOTTOM_Y - SLANT_UY * CORNER_R;
const BL_OUT_X = LEFT_X + CORNER_R;
const BR_IN_X = RIGHT_X - CORNER_R;
const BR_OUT_X = RIGHT_X + SLANT_UX * CORNER_R;
const BR_OUT_Y = BOTTOM_Y - SLANT_UY * CORNER_R;

const f = (n: number) => n.toFixed(2);

const HANGER_PATH =
  `M ${HOOK_CX - HOOK_R} ${HOOK_CY} ` +
  `Q ${HOOK_CX - HOOK_R} ${HOOK_CY - HOOK_R} ${HOOK_CX} ${HOOK_CY - HOOK_R} ` +
  `Q ${HOOK_CX + HOOK_R} ${HOOK_CY - HOOK_R} ${HOOK_CX + HOOK_R} ${HOOK_CY} ` +
  `Q ${HOOK_CX + HOOK_R} ${HOOK_CY + HOOK_R} ${HOOK_CX} ${HOOK_CY + HOOK_R} ` +
  `L ${APEX_X} ${APEX_Y - CORNER_R} ` +
  `Q ${APEX_X} ${APEX_Y} ${f(APEX_OUT_L_X)} ${f(APEX_OUT_L_Y)} ` +
  `L ${f(BL_IN_X)} ${f(BL_IN_Y)} ` +
  `Q ${LEFT_X} ${BOTTOM_Y} ${BL_OUT_X} ${BOTTOM_Y} ` +
  `L ${BR_IN_X} ${BOTTOM_Y} ` +
  `Q ${RIGHT_X} ${BOTTOM_Y} ${f(BR_OUT_X)} ${f(BR_OUT_Y)} ` +
  `L ${f(APEX_IN_R_X)} ${f(APEX_IN_R_Y)} ` +
  `Q ${APEX_X} ${APEX_Y} ${f(APEX_OUT_L_X)} ${f(APEX_OUT_L_Y)}`;

const PATH_LENGTH = 100;

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  size?: number;
  shapeHeightScale?: number;
};

export function HangerAnimation({
  size = DEFAULT_SIZE,
  shapeHeightScale = 1,
}: Props) {
  const draw = useSharedValue(0);

  useEffect(() => {
    draw.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withDelay(1200, withTiming(0, { duration: 300 })),
      ),
      -1,
      false,
    );
  }, [draw]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: PATH_LENGTH * (1 - draw.value),
  }));

  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 50 50" fill="none">
        <G
          transform={`translate(0 ${25 * (1 - shapeHeightScale)}) scale(1 ${shapeHeightScale})`}
        >
          <AnimatedPath
            d={HANGER_PATH}
            stroke={STROKE}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={[PATH_LENGTH, PATH_LENGTH]}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
  },
});
