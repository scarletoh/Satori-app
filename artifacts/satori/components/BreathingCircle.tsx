import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Phase = "inhale" | "hold-in" | "exhale" | "hold-out";

interface PhaseConfig {
  label: string;
  instruction: string;
  duration: number;
  scale: number;
  opacity: number;
  next: Phase;
}

const PHASES: Record<Phase, PhaseConfig> = {
  inhale: {
    label: "Breathe In",
    instruction: "through your nose",
    duration: 4000,
    scale: 1,
    opacity: 0.9,
    next: "hold-in",
  },
  "hold-in": {
    label: "Hold",
    instruction: "gently",
    duration: 4000,
    scale: 1,
    opacity: 0.9,
    next: "exhale",
  },
  exhale: {
    label: "Breathe Out",
    instruction: "slowly through your mouth",
    duration: 6000,
    scale: 0.55,
    opacity: 0.4,
    next: "hold-out",
  },
  "hold-out": {
    label: "Hold",
    instruction: "release all tension",
    duration: 2000,
    scale: 0.55,
    opacity: 0.4,
    next: "inhale",
  },
};

interface Props {
  size?: number;
}

export default function BreathingCircle({ size = 240 }: Props) {
  const colors = useColors();
  const [phase, setPhase] = React.useState<Phase>("inhale");
  const [countdown, setCountdown] = React.useState(4);
  const scaleAnim = useRef(new Animated.Value(0.55)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  const phaseRef = useRef<Phase>("inhale");

  useEffect(() => {
    phaseRef.current = phase;
    const config = PHASES[phase];
    setCountdown(Math.round(config.duration / 1000));

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: config.scale,
        duration: config.duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: config.opacity,
        duration: config.duration,
        useNativeDriver: true,
      }),
    ]).start();

    const countInterval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    const phaseTimeout = setTimeout(() => {
      setPhase((p) => PHASES[p].next);
    }, config.duration);

    return () => {
      clearInterval(countInterval);
      clearTimeout(phaseTimeout);
    };
  }, [phase, scaleAnim, opacityAnim]);

  const config = PHASES[phase];

  return (
    <View style={styles.container}>
      <View style={[styles.outerRing, { width: size, height: size, borderColor: colors.border }]}>
        <Animated.View
          style={[
            styles.circle,
            {
              width: size - 40,
              height: size - 40,
              borderRadius: (size - 40) / 2,
              backgroundColor: colors.sage,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <View style={styles.textOverlay}>
          <Text style={[styles.countdown, { color: colors.foreground }]}>
            {countdown}
          </Text>
        </View>
      </View>
      <View style={styles.phaseInfo}>
        <Text style={[styles.phaseLabel, { color: colors.foreground }]}>
          {config.label}
        </Text>
        <Text style={[styles.phaseInstruction, { color: colors.mutedForeground }]}>
          {config.instruction}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 32,
  },
  outerRing: {
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circle: {
    position: "absolute",
  },
  textOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  countdown: {
    fontSize: 40,
    fontFamily: "Inter_400Regular",
    letterSpacing: -2,
    opacity: 0.8,
  },
  phaseInfo: {
    alignItems: "center",
    gap: 4,
  },
  phaseLabel: {
    fontSize: 22,
    fontFamily: "Inter_400Regular",
    letterSpacing: -0.5,
  },
  phaseInstruction: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
});
