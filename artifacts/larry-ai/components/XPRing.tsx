import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const XP_PER_STAGE = [75, 125, 300, Infinity];
const STAGE_XP_START = [0, 75, 200, 500];
const STAGE_NAMES = ["Awakening", "Replacement", "Reinforcement", "Autonomy"];

interface Props {
  xp: number;
  stage: number;
  size?: number;
  color?: string;
}

export function XPRing({ xp, stage, size = 100, color }: Props) {
  const colors = useColors();
  const ringColor = color ?? colors.primary;

  const stageStart = STAGE_XP_START[Math.min(stage - 1, 3)];
  const stageMax = XP_PER_STAGE[Math.min(stage - 1, 3)];
  const stageXp = xp - stageStart;
  const progress = stageMax === Infinity ? 1 : Math.min(stageXp / stageMax, 1);

  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;

  const animProgress = useSharedValue(0);

  useEffect(() => {
    animProgress.value = withTiming(progress, { duration: 900 });
  }, [progress]);

  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animProgress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor + "22"}
          strokeWidth={7}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={7}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.xpText, { color: colors.foreground }]}>{xp}</Text>
        <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>XP</Text>
      </View>
    </View>
  );
}

export function StageLabel({ stage }: { stage: number }) {
  const colors = useColors();
  const name = STAGE_NAMES[Math.min(stage - 1, 3)];
  return (
    <View style={styles.stageLabelRow}>
      <View style={[styles.stageNum, { backgroundColor: colors.primary + "22" }]}>
        <Text style={[styles.stageNumText, { color: colors.primary }]}>
          Stage {stage}
        </Text>
      </View>
      <Text style={[styles.stageName, { color: colors.foreground }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
  },
  xpText: {
    fontSize: 22,
    fontWeight: "700",
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: -2,
  },
  stageLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  stageNum: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  stageNumText: {
    fontSize: 12,
    fontWeight: "700",
  },
  stageName: {
    fontSize: 14,
    fontWeight: "600",
  },
});
