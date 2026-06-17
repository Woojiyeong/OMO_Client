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
const STROKE_WIDTH = 2.8;

const HANGER_PATH =
  "M 20.9 14.2 " +
  "C 20.9 11.7 23.0 10.0 25.4 10.0 " +
  "C 28.1 10.0 30.0 11.6 30.0 13.7 " +
  "C 30.0 15.4 28.8 16.8 27.2 17.8 " +
  "C 25.3 19.0 24.0 21.0 24.0 23.3 " +
  "C 24.0 24.2 23.4 24.8 22.4 25.5 " +
  "L 5.4 37.5 " +
  "C 4.2 38.4 4.8 40.4 6.5 40.4 " +
  "L 43.5 40.4 " +
  "C 45.2 40.4 45.8 38.4 44.6 37.5 " +
  "L 27.6 25.5 " +
  "C 26.6 24.8 25.4 24.2 24.0 23.3";

const PATH_LENGTH = 150;

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
